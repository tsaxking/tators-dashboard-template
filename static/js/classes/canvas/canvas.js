class Canvas {
    /**
     * Creates a new canvas
     * @param {HTMLElement} canvas the canvas element you want to create a class for
     */
    constructor(canvas, options = {}) {
        if (!options.state) {
            options.state = {
                onChange: () => {},
                onReject: () => {},
                onClear: () => {}
            };
        }

        /**
         * @type {HTMLElement} the canvas element
         */
        this.canvas = canvas;
        /**
         * @type {Object} the options object
         */
        this.options = options;
        /**
         * @type {CanvasRenderingContext2D} the canvas context
         */
        this.context = canvas.getContext('2d');

        /**
         * @type {Array[Any]} the elements on the canvas
         */
        this.elements = [];
        /**
         * @type {Boolean} whether or not the canvas is animating
         */
        this.animating = false;

        this.canvas.addEventListener('click', this.onclick.bind(this));

        this.canvas.addEventListener('mousedown', this.onstart.bind(this));
        this.canvas.addEventListener('mousemove', this.onmove.bind(this));
        this.canvas.addEventListener('mouseup', this.onend.bind(this));

        this.canvas.addEventListener('touchstart', this.onstart.bind(this));
        this.canvas.addEventListener('touchmove', this.onmove.bind(this));
        this.canvas.addEventListener('touchend', this.onend.bind(this));
        this.canvas.addEventListener('touchcancel', this.onend.bind(this));

        /**
         * @type {StateStack} the state stack
         */
        this.stack = new StateStack(options.state.onChange, options.state.onClear, options.state.onReject);

        if (this.options.clickLog) {
            this.canvas.addEventListener('click', e => {
                const { x, y } = this.getXY(e);
                console.log(`x: ${x}, y: ${y}`);
            });
        }
    }

    /**
     * Adds a state to the stack
     */
    async addState() {
        const img = new CanvasImage(this.canvas.toDataURL());
        await img.render();
        this.stack.addState({
            image: img
        });
    }

    /**
     * @private
     */
    onstart(e) {
        // console.log('Canvas start');

        // get x and y as % of canvas size
        const { x, y } = this.getXY(e);

        this.elements.forEach(el => {
            if (el.onstart && el.isIn && el.isIn(x, y, this)) {
                el.onstart(e, el);
            }
        });
    }

    /**
     * @private
     */
    onclick(e) {
        // console.log('Canvas click');

        // get x and y as % of canvas size
        const { x, y } = this.getXY(e);

        this.elements.forEach(el => {
            if (el.onclick && el.isIn && el.isIn(x, y, this)) {
                el.onclick(e, el);
            }
        });
    }

    /**
     * @private
     */
    onmove(e) {
        // console.log('Canvas move');

        e.preventDefault();
        // get x and y as % of canvas size
        const { x, y } = this.getXY(e);

        this.elements.forEach(el => {
            if (el.onmove && el.isIn && el.isIn(x, y, this)) {
                el.onmove(e, el);
            }
        });
    }

    /**
     * @private
     */
    onend(e) {
        // console.log('Canvas end');

        // get x and y as % of canvas size
        const { x, y } = this.getXY(e);

        this.elements.forEach(el => {
            if (el.onend && el.isIn && el.isIn(x, y, this)) {
                el.onend(e, el);
            }
        });
    }

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }

    /**
     * Clears the canvas 
     * NOTE: This doesn't remove images!!!
     */
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Adds an element that will run element.draw() when you run canvas.draw()
     * @param {Object} element an element with a draw function
     * @param  {Function} element.draw A function that will draw onto this canvas
     */
    add(...element) {
        this.elements.unshift(...element.filter(e => {
            if (e.__added) {
                console.warn('Element already added to a canvas. You may have some dependencies between canvases or you added the same element twice.');
                if (this.options.skipDuplicates) return false;
            }
            e.__added = true;
            return e;
        }));
    }

    /**
     * Removes an element from this canvas' element list
     * @param {Object} element an element with a draw function
     * @param  {Function} element.draw A function that will draw onto this canvas
     */
    remove(element) {
        if (element.added) this.elements.splice(this.elements.indexOf(element), 1);

        element.added = false;
    }

    /**
     * Resizes the canvas to a certain width and height
     * @param {number} width the width you want to resize the canvas to 
     * @param {number} height the height you want to resize the canvas to 
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    /**
     * - Clears the canvas
     * - Calls element.draw() for each element in canvas.elements
     * @param {Boolean} clear whether or not to clear the canvas before drawing
     */
    draw(clear = true) {
        // console.log('Drawing canvas');
        if (clear) this.clear();
        this.elements.forEach(element => {
            this.context.save();
            element.draw(this);
            this.context.restore();
        });
    }

    /**
     * Draws a frame onto the canvas
     * @param {CanvasImage} img canvas image to draw
     */
    drawFrame(img) {
        this.stop();
        this.clear();
        img.draw(this);
    }

    /**
     * Repeatedly redraws each element then runs a function on it
     * @param {function} animateFunction A function that takes in this canvas' elements and then animates them
     * @private
     */
    animate() {
        if (!this.animating) return;
        this.animateFunction(this);
        this.draw();
        requestAnimationFrame(this.animate.bind(this));
    }

    /**
     * Starts animating the canvas
     */
    start(animateFunction) {
        console.log('Starting animation');
        this.animating = true;
        this.animateFunction = typeof animateFunction == 'function' ? animateFunction : () => {};
        requestAnimationFrame(this.animate.bind(this));
    }

    /**
     * Stops animating the canvas and removes it's animate function
     */
    stop() {
        console.log('Stopping animation');
        this.animating = false;
        this.animateFunction = null;
    }

    /**
     * 
     * @param {Event} e Event object 
     * @returns {Object} x and y as a percentage of the canvas size
     */
    getXY(e) {
        const { x, y } = getXY(e);
        const {
            width,
            height,
            top,
            left
        } = this.canvas.getBoundingClientRect();

        return {
            x: (x - left) / width,
            y: (y - top) / height
        };
    }

    get image() {
        return this.canvas.toDataURL('image/png');
    }

    destroy() {
        this.stop();
        this.elements.forEach(e => e.__added = false);
        this.elements = [];
        this.clear();

        this.canvas.removeEventListener('mousedown', this.onstart);
        this.canvas.removeEventListener('touchstart', this.onstart);
        this.canvas.removeEventListener('click', this.onclick);
        this.canvas.removeEventListener('mousemove', this.onmove);
        this.canvas.removeEventListener('touchmove', this.onmove);
        this.canvas.removeEventListener('mouseup', this.onend);
        this.canvas.removeEventListener('touchend', this.onend);
    }
}
class FIRSTField {
    /**
     * An image of the field
     * @param {Number} year The year you are in
     */
    constructor(year) {
        /**
         * @type {Number} The year you are in
         */
        this.year = year;
        /**
         * @type {String} The path to the image of the field
         */
        this.src = `../static/pictures/${year}/field.png`;

        /**
         * @type {Array} An array of properties that the field has
         */
        this.properties = [];

        this.canvasImage = new CanvasImage(this.src);
    }

    /**
     * Draws the field onto a canvas
     * @param {Canvas} canvas The canvas to draw this on (NOT THE CONTEXT!!!)
     * @param {Function} onImageLoad Runs after the image is displayed on the canvas for layering purposes (Put all of you draw things inside of this function because it loads the image asynchronously which causes layering stuff to be weird)
     */
    async draw({ context, canvas }, onImageLoad) {
        if (!context) throw new Error("No Canvas Found");
        if (!this.image) {
            await this.render();
        }

        const { mirror, rotate } = this.properties.reduce((acc, prop) => {
            if (prop.includes('mirror')) {
                acc.mirror = prop.split('-')[1];
            } else if (prop.includes('rotate')) {
                acc.rotate = !acc.rotate;
            }
            return acc;
        }, {
            mirror: false,
            rotate: false,
        });

        // Once all draw functions take in Canvas class
        context.save();

        // Mirror
        if (mirror) {
            // mirror is either x or y (axis to mirror over)
            context.translate(canvas.width / 2, canvas.height / 2);
            context.scale(mirror === 'x' ? -1 : 1, mirror === 'y' ? -1 : 1);
            context.translate(-canvas.width / 2, -canvas.height / 2);
        }

        if (rotate) {
            // rotate 180 degrees
            context.translate(canvas.width / 2, canvas.height / 2);
            context.rotate(Math.PI);
            context.translate(-canvas.width / 2, -canvas.height / 2);
        }

        context.drawImage(this.image, 0, 0, canvas.width, canvas.height);
        context.restore();
        if (onImageLoad) onImageLoad();
    }

    async render() {
        return new Promise((res, rej) => {
            const tempImg = new Image();
            tempImg.src = this.src;
            tempImg.onload = () => {
                this.image = tempImg;
                res(this);
            };
        });
    }

    /**
     * 
     * @param {Array} properties 
     */
    setProperties(properties = []) {
        if (!properties) throw new Error("No Properties Found");
        if (!Array.isArray(properties)) throw new Error("Properties must be an array");
        this.properties = properties;
    }

    get element() {
        if (!this.image) {
            throw new Error('Image has not been rendered yet. Call render() first');
        }

        const img = document.createElement('img');
        img.src = this.image.src;
        img.classList.add(...this.properties);
        return img;
    }

    toDataURL() {
        if (!this.image) {
            throw new Error('Image has not been rendered yet. Call render() first');
        }

        const canvas = new Canvas(document.createElement('canvas'));
        canvas.add(this);
        canvas.resize(this.image.width, this.image.height);
        canvas.draw();

        return canvas.canvas.toDataURL();
    }

    get copy () {
        const field = new FIRSTField(this.year);
        field.setProperties(this.properties);
        return field;
    }
}
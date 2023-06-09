class CanvasButton {
    /**
     * @param {Object} functions Parameters for the button
     */
    constructor(functions = {
        onclick: () => {},
        onstart: () => {},
        onend: () => {},
        onmove: () => {}
    }, properties = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        options: {
            color: "white",
            borderColor: "black",
            border: 1
        }
    }, customParameters = {}) {
        Object.assign(this, functions);

        /**
         * @type {Object} properties The properties of the button
         */
        this.properties = properties;

        /**
         * @type {Object} customParameters The custom parameters of the button
         */
        this.customParameters = customParameters;
    }

    /**
     * 
     * @param {Canvas} canvas the custom canvas class 
     */
    draw(canvas) {
        const {
            context,
            canvas: {
                width: cWidth,
                height: cHeight
            }
        } = canvas;
        const { x, y, width, height, options } = this.properties;

        context.save();

        if (options) {
            if (options.color) context.fillStyle = options.color;
            if (options.borderColor) context.strokeStyle = options.borderColor;
            if (options.border) context.lineWidth = options.border;
        }

        context.fillRect(x * cWidth, y * cHeight, width * cWidth, height * cHeight);
        context.strokeRect(x * cWidth, y * cHeight, width * cWidth, height * cHeight);

        context.restore();

        if (this.text) {
            this.text.draw(canvas);
        }
    }

    isIn(x, y) {
        const { x: bx, y: by, width, height } = this.properties;

        return x >= bx && x <= bx + width && y >= by && y <= by + height;
    }

    addText(text, options) {
        this.text = new CanvasText(text, {
            options: {},
            ...options,
            x: this.properties.x + this.properties.width / 2,
            y: this.properties.y + this.properties.height / 2
        });

        return this;
    }
};
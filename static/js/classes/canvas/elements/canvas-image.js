class CanvasImage {
    constructor(dataUrl, {
        x = 0,
        y = 0,
        width = 1,
        height = 1,
        ignoreRendering = false
    } = {

    }) {
        this.dataUrl = dataUrl;
        this.options = {
            x,
            y,
            width,
            height,
            ignoreRendering
        };

        this.rendered = false;
    }

    /**
     * 
     * @param {Canvas} canvas canvas object 
     */
    draw(canvas) {
        if (!this.rendered && !this.options.ignoreRendering) throw new Error('Image not rendered');

        const {
            context,
            width: cWidth,
            height: cHeight
        } = canvas;

        const {
            x,
            y,
            width: imgWidth,
            height: imgHeight
        } = this.options;

        context.drawImage(this.image, x, y, imgWidth * cWidth, imgHeight * cHeight);
    }

    async render() {
        this.image = await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                this.rendered = true;
                resolve(image);
            };
            image.onerror = reject;
            image.src = this.dataUrl;
        });

        return this;
    }

    isIn(x, y) {
        const {
            x: bx,
            y: by,
            width,
            height
        } = this.options;

        return x >= bx && x <= bx + width && y >= by && y <= by + height;
    }
}
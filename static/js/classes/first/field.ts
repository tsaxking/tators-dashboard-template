class FIRSTField {
    year: number;
    src: string;
    // TODO: we could probably use an enum for field properties
    properties: string[];
    canvasImage: CanvasImage;
    image?: HTMLImageElement;

    /**
     * An image of the field
     * @param {Number} year The year you are in
     */
    constructor(year: number) {
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
    async draw({ context, canvas }: Canvas, onImageLoad: Function): Promise<void> {
        if (!context) throw new Error("No Canvas Found");
        if (!this.image) {
            await this.render();
        }

        type ImagePropertiesAcc = {
            mirror: boolean | string,
            rotate: boolean
        }

        const { mirror, rotate } = this.properties.reduce((acc: ImagePropertiesAcc, prop) => {
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

        const { width, height } = canvas;
        const hWidth = width/2;
        const hHeight = height/2;
        const editCanvas = (cb: () => void) => {
            context.translate(hWidth, hHeight);
            cb();
            context.translate(-hWidth, -hHeight);
        }

        // Mirror
        if (mirror) {
            const xScale = mirror === 'x' ? -1 : 1;
            const yScale = mirror === 'y' ? -1 : 1
            // mirror is either x or y (axis to mirror over)
            editCanvas(() => context.scale(xScale, yScale));
        }

        if (rotate) {
            // rotate 180 degrees
            editCanvas(() => context.rotate(Math.PI));
        }

        if (!this.image) return;
        context.drawImage(this.image, 0, 0, width, height);
        context.restore();
        if (onImageLoad) onImageLoad();
    }

    async render(): Promise<FIRSTField | void> {
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
    setProperties(properties: string[] = []): void {
        if (!properties) throw new Error("No Properties Found");
        if (!Array.isArray(properties)) throw new Error("Properties must be an array");
        this.properties = properties;
    }

    get element() : HTMLImageElement {
        if (!this.image) {
            throw new Error('Image has not been rendered yet. Call render() first');
        }

        const img = document.createElement('img');
        img.src = this.image.src;
        img.classList.add(...this.properties);
        return img;
    }

    toDataURL() : string {
        if (!this.image) {
            throw new Error('Image has not been rendered yet. Call render() first');
        }

        const { width, height } = this.image;

        const canvas = new Canvas(document.createElement('canvas'));
        canvas.add(this);
        canvas.resize(width, height);
        canvas.draw();

        return canvas.canvas.toDataURL();
    }

    get copy() : FIRSTField {
        const field = new FIRSTField(this.year);
        field.setProperties(this.properties);
        return field;
    }
}
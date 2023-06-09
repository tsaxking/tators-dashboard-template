class CustomIcon {
    constructor(svg, {
        color = Color.fromBootstrap('light').toString('hex'),
        size = 24
    } = {}) {
        const icon = document.createElement('div');
        this.color = color;
        this.size = size;

        icon.innerHTML = svg;
        this.svg = icon.querySelector('svg');

        this.setStyle({
            fill: color,
            width: size,
            height: size
        });
    }

    /**
     * 
     * @param {Object} styleObj Similar to the HTML style attribute
     */
    setStyle(styleObj) {
        Object.keys(styleObj).forEach(key => {
            this.svg.style[key] = styleObj[key];
        });

        return this;
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }

    async draw(canvas) {
        if (!this.img) {
            await this.render();
        }

        const { context, width, height } = canvas;

        context.drawImage(
            this.img.image,
            (this.x * width) - (this.size / 2),
            (this.y * height) - (this.size / 2),
            this.size,
            this.size
        );
    }

    isIn(x, y, canvas) {
        const { width, height } = canvas;

        const x1 = (this.x * width) - (this.size / 2);
        const y1 = (this.y * height) - (this.size / 2);

        const x2 = x1 + this.size;
        const y2 = y1 + this.size;

        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    }

    clone() {
        const icon = new CustomIcon(this.svg.outerHTML, this.color, this.size);
        Object.assign(icon, this);
        return icon;
    }

    async render(imageOptions = {}) {
        this.style = window.getComputedStyle(this.svg);

        delete this.svg.style;

        // change svg into dataurl
        let xml = new XMLSerializer().serializeToString(this.svg);

        // change color of svg to match the color of the icon
        const { color } = this;
        xml = xml.replace(/#000000/g, color);

        const svg64 = btoa(xml);
        const b64Start = 'data:image/svg+xml;base64,';
        const image64 = b64Start + svg64;
        this.img = new CanvasImage(image64, imageOptions);
        await this.img.render();
        return this.img;
    }

    /**
     * 
     * @param {String} l The location of the icon in the globalIcons object 
     * @returns {CustomIcon} The icon
     * @example
     * const icon = CustomIcon.from('2023.cone');
     */
    static from(l) {
        const [p, n] = l.split('.');

        return new CustomIcon(globalIcons[p][n]);
    }
}
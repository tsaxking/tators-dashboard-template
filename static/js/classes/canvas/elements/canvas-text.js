class CanvasText {
    constructor(text, {
        x = 0,
        y = 0,
        options: {
            color = Color.fromName('black').toString('hex'),
            font = "Arial",
            size = 16,
            align = "center",
            baseline = "middle"
        }
    } = {
        options: {}
    }) {
        this.text = text;
        this.properties = {
            x,
            y,
            options: {
                color,
                font,
                size,
                align,
                baseline
            }
        };


    }

    draw(canvas) {
        const {
            context,
            width,
            height
        } = canvas;

        const {
            x,
            y,
            options: {
                color,
                font,
                size,
                align,
                baseline
            }
        } = this.properties;

        // context.save();

        context.fillStyle = color;
        context.font = `${size}px ${font}`;
        context.textAlign = align;
        context.textBaseline = baseline;


        context.fillText(this.text, x * width, y * height);
        // context.restore();

        // console.log('Drawing text', this)
    }
}
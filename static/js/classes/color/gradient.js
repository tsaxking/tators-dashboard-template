class Gradient {

    /**
     * Create a random gradient
     * @param {Number} frames - the number of frames to fade over (default: 60) 
     * @returns 
     */
    static random(frames = 60) {
        return Color.random().linearFade(Color.random(), frames);
    }

    /**
     * Combine multiple gradients into one
     * @param  {...Gradient} gradients - the gradients to combine (in order)
     * @returns {Gradient} - the combined gradient
     */
    static combine(...gradients) {
        const colors = [];
        gradients.forEach(gradient => {
            gradient.colors.forEach(color => {
                colors.push(color);
            });
        });
        return new Gradient(colors);
    }


    /**
     * 
     * @param {...Color} colors - the colors that make up the gradient
     */
    constructor(...colors) {
        colors = colors.flat();
        /**
         * @type {Array[Color]} colors - the colors that make up the gradient
         */
        this.colors = colors;
    }

    /**
     * @param {Number} deg - the degree of the gradient
     * @returns {String} - the gradient as a string
     * @example
     * // returns 'linear-gradient(90deg, rgb(255, 0, 0), rgb(0, 255, 0), rgb(0, 0, 255))'
     */
    toString(deg = 90) {
        let gradient = 'linear-gradient(' + deg + 'deg';
        this.colors.forEach(color => {
            gradient += `, ${color.toString()}`;
        });
        gradient += ')';
        return gradient;
    }


    /**
     * 
     * @param {Path} path - the path to create the gradient from
     */
    fromPath(path) {
        if (path.points.length !== this.colors.length + 1) throw new Error('The number of points in the path must be equal to the number of colors in the gradient plus one (each color is between two points)');
        return {
            /**
             * 
             * @param {Canvas} canvas - the canvas to draw the gradient on 
             */
            draw: (canvas) => {
                const { context } = canvas;
                const { points } = path;
                const { colors } = this;

                context.moveTo(points[0].x, points[0].y);
                context.strokeStyle = colors[0].toString();

                points.forEach((p, i) => {
                    if (i === 0) return;
                    context.lineTo(p.x, p.y);
                    context.strokeStyle = colors[i - 1].toString();
                    context.stroke();
                });

                context.closePath();
            }
        }
    }

    /**
     * view the gradient
     */
    view() {
        this.colors.forEach(c => c.view());
    }

    /**
     * console.log(text) but with the gradient
     * @param {String} string - the string to log
     */
    logText(string) {
        if (typeof string !== 'string') throw new Error('The string must be a string');

        // log text where each character is a different color
        // the gradient is repeated if the string is longer than the gradient
        // the string must be a single line

        const { colors } = this;
        const gradientLength = colors.length;

        const gradient = string.split('').map((char) => {
            return `%c${char}`;
        }).join('');

        let gradientIndex = 0;
        let direction = 1;
        const gradientString = string.split('').map((_, i) => {
            // if the string is longer than the gradient, go backwards through the gradient

            if (direction == 1) {
                if (gradientIndex === gradientLength - 1) direction = -1;
            } else {
                if (gradientIndex === 0) direction = 1;
            }


            gradientIndex += direction;

            return `color: ${colors[gradientIndex].toString()}`;

        });

        console.log(gradient, ...gradientString);
    }


    /**
     * Add multiple gradients together
     * @param  {...Gradient} gradients - the gradients to add
     * @returns {Gradient} - This gradient
     */
    add(...gradients) {
        gradients.forEach(gradient => {
            this.colors = [...this.colors, ...gradient.colors];
        });
        return this;
    }

    /**
     * Randomizes the gradient
     */
    random() {
        this.colors.sort(() => Math.random() - 0.5);
        return this;
    }
}
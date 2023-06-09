class Path {
    /**
     * 
     * @param {Color} color the color of the path 
     */
    constructor(color = new Color(0, 0, 0), options = {}) {
        /**
         * @type {Color} the color of the path
         */
        this.color = color;

        /**
         * @type {Array[Point]} the points in the path
         */
        this.points = [];

        /**
         * @type {Point} the latest point in the path
         */
        this.latestPoint = null;

        /**
         * @type {Object} the options of the path
         */
        this.options = options;
    }

    /**
     * 
     * @param {Number} x between 0 and 1
     * @param {Number} y between 0 and 1
     * @param {Number} options the thickness of the path
     */
    addPoint(x, y, options) {
        this.points.push(new Point(x, y, options));
        this.latestPoint = this.points[this.points.length - 1];
    }

    /**
     * Adds several points to the path
     * @param {Array[Point]} points the points to add
     */
    addPoints(points) {
        points.forEach(point => this.addPoint(point.x, point.y, point.options));
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

        context.save();

        context.beginPath();
        context.strokeStyle = this.color.rgb;
        context.lineWidth = this.options.thickness || 1;
        this.points.forEach((point, i) => {
            if (i == 0) context.moveTo(point.x * cWidth, point.y * cHeight);
            else context.lineTo(point.x * cWidth, point.y * cHeight);
        });
        context.stroke();

        context.restore();
    }

    /**
     * Removes the last point in the path
     */
    pop() {
        this.points.pop();
    }

    /**
     * Removes the first point in the path
     */
    shift() {
        this.points.shift();
    }

    /**
     * Returns the length of the path
     */
    get length() {
        return this.points.length;
    }

    linearBestFit() {
        const x = this.points.map(point => point.x);
        const y = this.points.map(point => point.y);

        const xMean = x.reduce((a, b) => a + b) / x.length;
        const yMean = y.reduce((a, b) => a + b) / y.length;

        const xDev = x.map(x => x - xMean);
        const yDev = y.map(y => y - yMean);

        const xyDev = xDev.map((x, i) => x * yDev[i]);

        const xDevSquared = xDev.map(x => x ** 2);

        const slope = xyDev.reduce((a, b) => a + b) / xDevSquared.reduce((a, b) => a + b);
        const yIntercept = yMean - slope * xMean;

        return {
            slope,
            yIntercept
        };
    }

    /**
     * Returns the coefficients of a polynomial of the given degree that best fits the path
     * @param {Number} degree the degree of the polynomial
     * @returns {Array[Number]} the coefficients of the polynomial
     */
    polynomialBestFit(degree) {
        return new Array(degree + 1).fill(0).map((_, i) => {
            const x = this.points.map(point => point.x ** i);
            const y = this.points.map(point => point.y);

            const xMean = x.reduce((a, b) => a + b) / x.length;
            const yMean = y.reduce((a, b) => a + b) / y.length;

            const xDev = x.map(x => x - xMean);
            const yDev = y.map(y => y - yMean);

            const xyDev = xDev.map((x, i) => x * yDev[i]);

            const xDevSquared = xDev.map(x => x ** 2);

            const slope = xyDev.reduce((a, b) => a + b) / xDevSquared.reduce((a, b) => a + b);
            const yIntercept = yMean - slope * xMean;

            return yIntercept;
        });
    }

    /**
     * Returns the derivative of the path
     * @returns {Path} the derivative of the path
     */
    derivative() {
        return new Path(this.color, this.options).addPoints(this.points.map((point, i) => {
            if (i == 0) return point;
            else {
                const x = point.x;
                const y = (point.y - this.points[i - 1].y) / (point.x - this.points[i - 1].x);

                return new Point(x, y);
            }
        }));
    }

    /**
     * Returns the integral of the path
     * @returns {Path} the integral of the path
     * @param {Number} constant the constant of integration
     */
    integral(constant = 0) {
        return new Path(this.color, this.options).addPoints(this.points.map((point, i) => {
            if (i == 0) return point;
            else {
                const x = point.x;
                const y = (point.y + this.points[i - 1].y) / 2 * (point.x - this.points[i - 1].x) + constant;

                return new Point(x, y);
            }
        }));
    }
}
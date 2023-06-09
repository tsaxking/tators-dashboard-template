class Point {
    /**
     * 
     * @param {Number} x between 0 and 1
     * @param {Number} y between 0 and 1
     * @param {Object} options (optional) options for the point
     * @param {Number} options.radius (optional) the radius of the point (used for drawing)
     * @param {Color} options.color (optional) the color of the point (used for drawing)
     * @param {Number} options.thickness (optional) the thickness of the point (used for drawing)
     */
    constructor(x, y, {
        radius,
        color,
        thickness
    } = {
        radius: 0,
        color: Color.fromName('black'),
        thickness: 1
    }) {
        /**
         * @type {Number} x between 0 and 1
         */
        this.x = x;

        /**
         * @type {Number} y between 0 and 1
         */
        this.y = y;

        /**
         * @type {Number} radius (optional) the radius of the point (used for drawing)
         */
        this.radius = radius;

        /**
         * @type {Color} color (optional) the color of the point (used for drawing)
         * @default Color.fromName('black')
         */
        this.color = color ? color : Color.fromName('black').rgb.toString();

        /**
         * @type {Number} thickness (optional) the thickness of the point (used for drawing)
         */
        this.thickness = thickness;
    }

    /**
     * Draws the point onto a canvas
     */
    draw(canvas) {
        const { x, y } = this;

        const {
            context,
            canvas: {
                width,
                height
            }
        } = canvas;

        context.save();

        context.beginPath();
        context.fillStyle = this.color;
        context.lineWidth = this.thickness;
        context.arc(x * width, y * height, this.radius, 0, 2 * Math.PI);
        context.fill();

        context.restore();
    }

    /**
     * Moves the point to a new position
     * @param {Number} x between 0 and 1
     * @param {Number} y between 0 and 1
     * @returns {Point} the point
     */
    moveTo(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Linear interpolation between this point and another point
     * @param {Number} frames Number of frames
     * @param {Point} point the point to interpolate to
     * @returns {Array[Point]} the points in between
     */
    linearMove(frames, point) {
        const arr = new Array(frames).fill(0).map((_, i) => {
            const x = this.x + (point.x - this.x) * (i / frames);
            const y = this.y + (point.y - this.y) * (i / frames);
            return new Point(x, y);
        });
        const path = new Path();
        path.addPoints(arr);
        return path;
    }

    /**
     * Polynomial interpolation between this point and another point
     * @param {Number} frames Number of frames
     * @param {...Point} point the point to interpolate to
     * @returns {Array[Point]} the points in between
     */
    polynomialMove(frames, ...points) {
        const pointsArray = [this, ...points];

        const arr = new Array(frames).fill(0).map((_, i) => {
            const x = pointsArray.reduce((acc, point, index) => {
                return acc + point.x * Math.pow(i / frames, index);
            }, 0);
            const y = pointsArray.reduce((acc, point, index) => {
                return acc + point.y * Math.pow(i / frames, index);
            }, 0);
            return new Point(x, y);
        });

        const path = new Path();
        path.addPoints(arr);
        return path;
    }

    /**
     * Logarithmic interpolation between this point and another point
     * @param {Number} frames Number of frames
     * @param {Point} point the point to interpolate to
     * @param {Number} base the base of the logarithm
     * @returns {Array[Point]} the points in between
     */
    logarithmicMove(frames, point, base) {
        const arr = new Array(frames).fill(0).map((_, i) => {
            const x = this.x + (point.x - this.x) * Math.log(i + 1) / Math.log(base);
            const y = this.y + (point.y - this.y) * Math.log(i + 1) / Math.log(base);
            return new Point(x, y);
        });

        const path = new Path();
        path.addPoints(arr);
        return path;
    }

    /**
     * Exponential interpolation between this point and another point
     * @param {Number} frames Number of frames
     * @param {Point} point the point to interpolate to
     * @param {Number} base the base of the exponent
     * @returns {Array[Point]} the points in between
     */
    exponentialMove(frames, point, base) {
        return new Array(frames).fill(0).map((_, i) => {
            const x = this.x + (point.x - this.x) * (base ** i - 1) / (base - 1);
            const y = this.y + (point.y - this.y) * (base ** i - 1) / (base - 1);
            return new Point(x, y);
        });
    }

    /**
     * Sine interpolation between this point and another point
     * @param {Number} frames Number of frames
     * @param {Point} point the point to interpolate to
     * @returns {Array[Point]} the points in between
     */
    sineMove(frames, point) {
        return new Array(frames).fill(0).map((_, i) => {
            const x = this.x + (point.x - this.x) * (Math.sin(Math.PI * i / frames - Math.PI / 2) + 1) / 2;
            const y = this.y + (point.y - this.y) * (Math.sin(Math.PI * i / frames - Math.PI / 2) + 1) / 2;
            return new Point(x, y);
        });
    }

    /**
     * Cosine interpolation between this point and another point
     * @param {Number} frames Number of frames
     * @param {Point} point the point to interpolate to
     * @returns {Array[Point]} the points in between
     */
    cosineMove(frames, point) {
        return new Array(frames).fill(0).map((_, i) => {
            const x = this.x + (point.x - this.x) * (Math.cos(Math.PI * i / frames - Math.PI / 2) + 1) / 2;
            const y = this.y + (point.y - this.y) * (Math.cos(Math.PI * i / frames - Math.PI / 2) + 1) / 2;
            return new Point(x, y);
        });
    }

    /**
     * Tangent interpolation between this point and another point
     * @param {Number} frames Number of frames
     * @param {Point} point the point to interpolate to
     * @returns {Array[Point]} the points in between
     */
    tangentMove(frames, point) {
        return new Array(frames).fill(0).map((_, i) => {
            const x = this.x + (point.x - this.x) * Math.tan(Math.PI * i / frames - Math.PI / 2);
            const y = this.y + (point.y - this.y) * Math.tan(Math.PI * i / frames - Math.PI / 2);
            return new Point(x, y);
        });
    }

    /**
     * Calculates the distance from this point to another point
     * @param {Point} point the point to calculate the distance from
     * @returns {Number} the distance from this point to another point (in whatever unit its x and y are in)
     */
    distanceFrom(point) {
        return Math.sqrt((this.x - point.x) ** 2 + (this.y - point.y) ** 2);
    }

    /**
     * Clears the point from the canvas
     * @param {Canvas} canvas the canvas to draw on 
     */
    clear(canvas) {
        const {
            radius,
            x,
            y
        } = this;

        canvas.context.clearRect(x * canvas.width - radius, y * canvas.height - radius, radius * 2, radius * 2);
    }
}
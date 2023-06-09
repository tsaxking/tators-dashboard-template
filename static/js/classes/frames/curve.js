class Curve {
    constructor(points) {
        this.points = points;
    }

    static linear(frames, from, to) {
        return new Curve(new Array(frames).fill(0).map((_, i) => {
            return {
                x: i,
                y: from + (to - from) / frames * i
            }
        }));
    }

    static polynomial(frames, from, to, ...coefficients) {
        const maxPower = coefficients.length - 1;
        return new Curve(new Array(frames).fill().map((_, i) => {
            // create a polynomial function
            const polynomial = coefficients.reduce((acc, coeff, power) => {
                return acc + coeff * Math.pow(i / frames, power);
            }, 0);

            return {
                x: i,
                y: from + (to - from) * polynomial
            }
        }));
    }

    static exponential(frames, from, to, base) {
        return new Curve(new Array(frames).fill().map((_, i) => {
            return {
                x: i,
                y: from + (to - from) * Math.pow(base, i / frames)
            }
        }));
    }

    static logarithmic(frames, from, to, base) {
        return new Curve(new Array(frames).fill().map((_, i) => {
            return {
                x: i,
                y: from + (to - from) * Math.log(i / frames) / Math.log(base)
            }
        }));
    }

    static sinusoidal(frames, from, to) {
        return new Curve(new Array(frames).fill().map((_, i) => {
            return {
                x: i,
                y: from + (to - from) * Math.sin(i / frames * Math.PI)
            }
        }));
    }

    static circular(frames, from, to) {
        return new Curve(new Array(frames).fill().map((_, i) => {
            return {
                x: i,
                y: from + (to - from) * (1 - Math.sqrt(1 - Math.pow(i / frames, 2)))
            }
        }));
    }

    bestFit() {
        // use taylor series to approximate the curve
        // https://en.wikipedia.org/wiki/Taylor_series

        // find the best fit polynomial
        return new Curve(this.points.map((point, i) => {
            return {
                x: point.x,
                y: this.points.slice(0, i + 1).reduce((acc, point, j) => {
                    return acc + point.y * this.taylorCoefficient(i, j);
                }, 0)
            }
        }));
    }

    taylorCoefficient(i, j) {
        // https://en.wikipedia.org/wiki/Taylor_series#Formal_definition
        // https://en.wikipedia.org/wiki/Binomial_coefficient

        // find the binomial coefficient
        const binomialCoefficient = (n, k) => {
            if (k > n) return 0;
            if (k === 0 || k === n) return 1;
            return binomialCoefficient(n - 1, k - 1) + binomialCoefficient(n - 1, k);
        }

        // find the taylor coefficient
        return binomialCoefficient(i, j) * Math.pow(-1, j) / Math.pow(i, j);
    }
}
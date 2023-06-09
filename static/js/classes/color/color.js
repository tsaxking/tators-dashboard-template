/**
 * @fileoverview Color class
 * @author tsaxking
 * @license MIT
 * @version 1.0.0
 * @since 1.0.0
 * @example
 * const color = new Color(255, 255, 255);
 * console.log(color.rgb); // rgb(255, 255, 255)
 * console.log(color.rgba); // rgba(255, 255, 255, 1)
 * console.log(color.hex); // #ffffff
 */
class Color {
    /**
     * 
     * @param {Number} r Red between 0 and 255
     * @param {Number} g Green between 0 and 255
     * @param {Number} b Blue between 0 and 255
     * @param {Number} a Alpha between 0 and 1
     */
    constructor(r, g, b, a = 1) {
        const params = ['red', 'green', 'blue'];
        [r,g,b].forEach((v, i) => {
            if (isNaN(v)) throw new Error(`Invalid Color ${params[i]} value: ${v}`);
            else v = +v;

            if (v > 255) {
                console.warn(`Color ${params[i]} value is greater than 255. Setting to 255`);
                this[params[i]] = 255;
            } else if (v < 0) {
                console.warn(`Color ${params[i]} value is less than 0. Setting to 0`);
                this[params[i]] = 0;
            }
        });

        if (typeof a === 'undefined') a = 1;
        else if (isNaN(a)) throw new Error(`Invalid Color alpha value: ${a}`);
        else a = +a;

        if (a > 1) {
            console.warn(`Color alpha value is greater than 1. Setting to 1`);
            a = 1;
        } else if (a < 0) {
            console.warn(`Color alpha value is less than 0. Setting to 0`);
            a = 0;
        }

        /**
         * @property {Number} r Red between 0 and 255
         * @readonly
         */
        this.r = r;

        /**
         * @property {Number} g Green between 0 and 255
         * @readonly
         */
        this.g = g;

        /**
         * @property {Number} b Blue between 0 and 255
         * @readonly
         */
        this.b = b;

        /**
         * @property {Number} a Alpha between 0 and 1
         * @readonly
         * @default 1
         */
        this.a = typeof a == 'number' ? a : 1;
    }

    /**
     * Returns the color in rgb format
     */
    get rgb() {
        return {
            values: [this.r, this.g, this.b],
            /**
             * Sets the color
             * @param {Number} r Red between 0 and 255
             * @param {Number} g Green between 0 and 255
             * @param {Number} b Blue between 0 and 255
             * @param {Number} a Alpha between 0 and 1
             * @returns {Color} This color object
             */
            set: (r, g, b) => {
                const color = new Color(r, g, b, a);

                this.r = color.r;
                this.g = color.g;
                this.b = color.b;

                return this;
            },
            /**
             * Sets the red value
             * @param {Number} r Red between 0 and 255 
             * @returns {Color} This color object
             */
            setRed: (r) => {
                const color = new Color(r, this.g, this.b, this.a);

                this.r = color.r;

                return this;
            },
            /**
             * Sets the green value
             * @param {Number} g Green between 0 and 255 
             * @returns {Color} This color object
             */
            setGreen: (g) => {
                const color = new Color(this.r, g, this.b, this.a);

                this.g = color.g;

                return this;
            },
            /**
             * Sets the blue value
             * @param {Number} b Blue between 0 and 255 
             * @returns {Color} This color object
             */
            setBlue: (b) => {
                const color = new Color(this.r, this.g, b, this.a);

                this.b = color.b;

                return this;
            },
            /**
             * 
             * @returns {String} The color in rgb format
             */
            toString: () => this.toString('rgb')
        }
    }

    /**
     * Returns the color in rgba format
     */
    get rgba() {
        return {
            values: [...this.rgb.values, this.a],
            /**
             * Sets the color
             * @param {Number} r Red between 0 and 255
             * @param {Number} g Green between 0 and 255
             * @param {Number} b Blue between 0 and 255
             * @param {Number} a Alpha between 0 and 1
             * @returns {Color} This color object
             */
            set: (r, g, b, a) => {
                const color = new Color(r, g, b, a);

                this.r = color.r;
                this.g = color.g;
                this.b = color.b;
                this.a = color.a;

                return this;
            },
            /**
             * Sets the alpha value
             * @param {Number} a Alpha between 0 and 1 
             * @returns {Color} This color object
             */
            setAlpha: (a) => {
                const color = new Color(this.r, this.g, this.b, a);

                this.a = color.a;

                return this;
            },
            /**
             * 
             * @returns {String} The color in rgba format
             */
            toString: () => this.toString('rgba')
        }
    }

    /**
     * Returns the color in hex format
     */
    get hex() {
        return {
            values: [this.r.toString(16), this.g.toString(16), this.b.toString(16)],
            /**
             * Sets the color
             * @param {String} hex Hex value for color 
             * @returns {Color} This color object
             */
            set: (hex) => {
                const c = Color.fromHex(hex);
                this.r = c.r;
                this.g = c.g;
                this.b = c.b;

                return this;
            },
            /**
             * 
             * @param {String} r Hex value for red 
             * @returns {Color} This color object
             */
            setRed: (r) => {
                if (r.length != 2) throw new Error('Invalid Hex');
                
                const c = Color.fromHex(r + this.g.toString(16) + this.b.toString(16));
                this.r = c.r;

                return this;
            },
            /**
             * 
             * @param {String} g Hex value for green 
             * @returns {Color} This color object
             */
            setGreen: (g) => {
                if (g.length != 2) throw new Error('Invalid Hex');

                const c = Color.fromHex(this.r.toString(16) + g + this.b.toString(16));
                this.g = c.g;                

                return this;
            },
            /**
             * 
             * @param {String} b Hex value for blue 
             * @returns {Color} This color object
             */
            setBlue: (b) => {
                if (b.length != 2) throw new Error('Invalid Hex');

                const c = Color.fromHex(this.r.toString(16) + this.g.toString(16) + b);
                this.b = c.b;                

                return this;
            },
            /**
             * 
             * @returns {String} The color in hex format
             */
            toString: () => this.toString('hex')
        }
    }

    /**
     * Returns the color in hex format with alpha
     */
    get hexa() {
        return {
            values: [...this.hex.values, this.a.toString(16)],
            ...this.hex,
            /**
             * Sets the alpha value
             * @param {Number} a Alpha between 0 and 1
             * @returns {Color} This color object
             */
            setAlpha: (a) => {
                const color = new Color(this.r, this.g, this.b, a);

                this.a = color.a;

                return this;
            },
            /**
             * 
             * @returns {String} The color in hexa format
             */
            toString: () => this.toString('hexa')
        }
    }

    /**
     * Returns the color in hsl format
     */
    get hsl() {
        const r = this.r / 255;
        const g = this.g / 255;
        const b = this.b / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);

        let h;
        let s;
        let l = (max + min) / 2;

        if (max == min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
        }

        return {
            values: [h, s, l],
            /**
             * Sets the color
             * @param {Number} h Hue between 0 and 1 
             * @param {Number} s Saturation between 0 and 1
             * @param {Number} l Lightness between 0 and 1
             * @returns {Color} This color object
             */
            set: (h, s, l) => {
                const c = Color.fromHSL(h, s, l);
                this.r = c.r;
                this.g = c.g;
                this.b = c.b;

                return this;
            },
            /**
             * Sets the hue
             * @param {Number} h Hue between 0 and 1
             * @returns {Color} This color object
             */
            setHue: (h) => {
                const c = Color.fromHSL(h, this.hsl.values[1], this.hsl.values[2]);
                this.r = c.r;
                this.g = c.g;
                this.b = c.b;

                return this;
            },
            /**
             * Sets the saturation
             * @param {Number} s Saturation between 0 and 1
             * @returns {Color} This color object
             */
            setSaturation: (s) => {
                const c = Color.fromHSL(this.hsl.values[0], s, this.hsl.values[2]);
                this.r = c.r;
                this.g = c.g;
                this.b = c.b;

                return this;
            },
            /**
             * Sets the lightness
             * @param {Number} l Lightness between 0 and 1
             * @returns {Color} This color object
             */
            setLightness: (l) => {
                const c = Color.fromHSL(this.hsl.values[0], this.hsl.values[1], l);
                this.r = c.r;
                this.g = c.g;
                this.b = c.b;

                return this;
            },
            /**
             * 
             * @returns {String} The color in hsl format
             */
            toString: () => this.toString('hsl')
        }
    }

    /**
     * Returns the color in hsla format
     */
    get hsla() {
        return {
            values: [...this.hsl.values, this.a],
            ...this.hsl,
            /**
             * Sets the alpha
             * @param {Number} a Alpha between 0 and 1
             * @returns {Color} This color object
             */
            setAlpha: (a) => {
                const color = new Color(this.r, this.g, this.b, a);

                this.a = color.a;

                return this;
            },
            /**
             * 
             * @returns {String} The color in hsla format
             */
            toString: () => this.toString('hsla')
        }
    }

    /**
     * Returns the color in lab format
     */
    get cielab() {
        const r = this.r / 255;
        const g = this.g / 255;
        const b = this.b / 255;

        const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
        const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
        const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

        const x_ = x / 0.95047;
        const y_ = y / 1.00000;
        const z_ = z / 1.08883;

        const f = (t) => t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116;

        const l = 116 * f(y_) - 16;
        const a = 500 * (f(x_) - f(y_));
        const _b = 200 * (f(y_) - f(z_));

        return {
            values: [l, a, _b],
            /**
             * Sets the color
             * @param {Number} l Luminance between 0 and 100
             * @param {Number} a A between -128 and 127
             * @param {Number} b B between -128 and 127
             * @returns {Color} This color object
             */
            set: (l, a, b) => {
                if (isNaN(l) || isNaN(a) || isNaN(b)) throw new Error('Invalid Color');
                if (l > 100 || a > 127 || b > 127) throw new Error('Invalid Color');
                if (l < 0 || a < -128 || b < -128) throw new Error('Invalid Color');

                const c = Color.fromCIELAB(l, a, b);
                this.r = c.r;
                this.g = c.g;
                this.b = c.b;

                return this;
            },
            /**
             * Sets the luminance
             * @param {Number} l Luminance between 0 and 100
             * @returns {Color} This color object
             */
            setLuminance: (l) => {
                if (isNaN(l)) throw new Error('Invalid Color');
                if (l > 100) throw new Error('Invalid Color');
                if (l < 0) throw new Error('Invalid Color');

                const c = Color.fromCIELAB(l, this.cielab.values[1], this.cielab.values[2]);
                this.r = c.r;
                this.g = c.g;
                this.b = c.b;

                return this;
            },
            /**
             * Sets the a
             * @param {Number} a A between -128 and 127
             * @returns {Color} This color object
             */
            setA: (a) => {
                if (isNaN(a)) throw new Error('Invalid Color');
                if (a > 127) throw new Error('Invalid Color');
                if (a < -128) throw new Error('Invalid Color');

                const c = Color.fromCIELAB(this.cielab.values[0], a, this.cielab.values[2]);
                this.r = c.r;
                this.g = c.g;
                this.b = c.b;

                return this;
            },
            /**
             * Sets the b
             * @param {Number} b B between -128 and 127
             * @returns {Color} This color object
             */
            setB: (b) => {
                if (isNaN(b)) throw new Error('Invalid Color');
                if (b > 127) throw new Error('Invalid Color');
                if (b < -128) throw new Error('Invalid Color');

                const c = Color.fromCIELAB(this.cielab.values[0], this.cielab.values[1], b);
                this.r = c.r;
                this.g = c.g;
                this.b = c.b;

                return this;
            },
            /**
             * 
             * @returns {String} The color in cielab format
             */
            toString: () => this.toString('cielab')
        }
    }

    /**
     * Returns the color in rgb/rgba/hex/hexa/hsl/hsla/cielab format for css use
     * @param {String} type (optional) Color format to return. Default is rgb 
     */
    toString(type = 'rgb') {
        switch (type) {
            case 'rgb':
                return `rgb(${this.r}, ${this.g}, ${this.b})`;
            case 'rgba':
                return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
            case 'hex':
                return `#${this.hex.values.join('')}`;
            case 'hexa':
                return `#${this.hexa.values.join('')}`;
            case 'hsl':
                return `hsl(${this.hsl.values.join(', ')})`;
            case 'hsla':
                return `hsla(${this.hsla.values.join(', ')})`;
            case 'cielab':
                return `lab(${this.cielab.values.join(', ')})`;
            default:
                throw new Error('Invalid color format');
        }
    }

    /**
     * Generates the color from a hex string
     * @param {String} hex Hexadecimal color 
     * @returns {Color} Color object
     */
    static fromHex(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        let a = parseInt(hex.slice(7, 9), 16) / 255;
        if (isNaN(a)) a = 1;

        return new Color(r, g, b, a);
    }

    /**
     * Generates the color from hsl values
     * @param {Number} h Hue value between 0 and 1
     * @param {Number} s Saturation value between 0 and 1
     * @param {Number} l Lightness value between 0 and 1
     * @param {Number} a (optional) Alpha value between 0 and 1. Default is 1
     * @returns {Color} Color object
     */
    static fromHSL(h, s, l, a = 1) {
        const params = ['hue', 'saturation', 'lightness'];
        [h,s,l].forEach((v, i) => {
            if (isNaN(v)) throw new Error(`Invalid ${params[i]}, ${v} is not a parsable number`);

            if (v > 1) {
                console.warn(`Invalid ${params[i]}, ${v} is greater than 1. It will be set to 1`);
                v = 1;
            }

            if (v < 0) {
                console.warn(`Invalid ${params[i]}, ${v} is less than 0. It will be set to 0`);
                v = 0;
            }
        });


        let r, g, b;

        if (s == 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return new Color(r * 255, g * 255, b * 255, a);
    }

    /**
     * Generates the color from cielab values
     * @param {Number} l Luminance value
     * @param {Number} a A value
     * @param {Number} b B value
     * @returns {Color} Color object
     */
    static fromCIELAB(l, a, b) {
        if (isNaN(l) || isNaN(a) || isNaN(b)) throw new Error('Invalid Color');
        if (l > 100 || a > 127 || b > 127) throw new Error('Invalid Color');
        if (l < 0 || a < -128 || b < -128) throw new Error('Invalid Color');

        const f = (t) => t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116;
        const y_ = (l + 16) / 116;
        const x_ = a / 500 + y_;
        const z_ = y_ - b / 200;

        const r = 255 * (f(x_) * 0.95047);
        const g = 255 * (f(y_) * 1.00000);
        const _b = 255 * (f(z_) * 1.08883);

        return new Color(r, g, _b);
    }

    /**
     * Generates a random color
     * @param {Boolean} withAlpha (optional) Whether to include alpha value
     * @returns {Color} Random color
     */
    static random(withAlpha = false) {
        const c = new Color(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), withAlpha ? Math.random() : 1);

        c.hsl.setSaturation(.25 + Math.random() * .5);
        c.hsl.setLightness(.25 + Math.random() * .5);

        return c;
    }

    /**
     * Generates a color from a color name
     * @param {String} name Color name 
     * @param {Number} a (optional) Alpha value
     * @returns {Color} Color object
     */
    static fromName(name, a = 1) {
        const { colors } = this;

        if (name in colors) {
            return new Color(...colors[name], a);
        }

        return null;
    }

    /**
     * Returns the contrast ratio between this color and the given color
     * @param {Color} color Color to compare to
     * @returns {Number} Contrast ratio
     */
    detectContrast(color) {
        const l1 = 0.2126 * Math.pow(this.r / 255, 2.2) + 0.7152 * Math.pow(this.g / 255, 2.2) + 0.0722 * Math.pow(this.b / 255, 2.2);
        const l2 = 0.2126 * Math.pow(color.r / 255, 2.2) + 0.7152 * Math.pow(color.g / 255, 2.2) + 0.0722 * Math.pow(color.b / 255, 2.2);

        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }

    /**
     * Returns an array of colors that fade from this color to the given color on a linear scale
     * @param {Color} color Color to fade to 
     * @param {Number} frames Frames to fade to color 
     * @returns {Gradient} Gradient object
     */
    linearFade(color, frames) {
        return new Gradient(...new Array(frames).fill(0).map((_, i) => {
            return new Color(
                Math.floor(this.r + (color.r - this.r) / frames * i),
                Math.floor(this.g + (color.g - this.g) / frames * i),
                Math.floor(this.b + (color.b - this.b) / frames * i),
                this.a + (color.a - this.a) / frames * i
            );
        }));
    }

    /**
     * Returns an array of colors that fade from this color to the given color on a logarithmic scale
     * @param {Color} color Color to fade to
     * @param {Number} frames Frames to fade to color
     * @param {Number} base Base of the logarithm (default: 2)
     * @returns {Gradient} Gradient object
     */
    logarithmicFade(color, frames, base = 2) {
        return new Gradient(...new Array(frames).fill(0).map((_, i) => {
            return new Color(
                Math.floor(this.r + (color.r - this.r) / Math.pow(base, frames) * Math.pow(base, i)),
                Math.floor(this.g + (color.g - this.g) / Math.pow(base, frames) * Math.pow(base, i)),
                Math.floor(this.b + (color.b - this.b) / Math.pow(base, frames) * Math.pow(base, i)),
                this.a + (color.a - this.a) / Math.pow(base, frames) * Math.pow(base, i)
            );
        }));
    }

    /**
     * Returns an array of colors that fade from this color to the given color on a exponential scale
     * @param {Color} color Color to fade to
     * @param {Number} frames Frames to fade to color
     * @param {Number} base Base of the exponential (default: 2)
     * @returns {Gradient} Gradient object
     */
    exponentialFade(color, frames, base = 2) {
        return new Gradient(new Array(frames).fill(0).map((_, i) => {
            return new Color(
                // TODO: I think you can just do Math.pow(base, frames + i) instead?
                Math.floor(this.r + (color.r - this.r) / Math.pow(base, frames) * Math.pow(base, i)),
                Math.floor(this.g + (color.g - this.g) / Math.pow(base, frames) * Math.pow(base, i)),
                Math.floor(this.b + (color.b - this.b) / Math.pow(base, frames) * Math.pow(base, i)),
                this.a + (color.a - this.a) / Math.pow(base, frames) * Math.pow(base, i)
            );
        }));
    }

    /**
     * Logs with the color of this color
     * @param  {...any} args
     */
    logText(...args) {
        args.forEach(a => {
            if (typeof a !== "string") {
                throw new Error("Only strings are allowed");
            }
        })
        console.log(`%c${args.join(" ")}`, `color: ${this.closestName.color.toString('hex')}`);
    }

    /**
     * View the color in the console
     */
    view() {
        this.logText("Color:", this.closestName.name);
    }

    /**
     * All colors and their RGB values
     */
    static get colors() {
        return {
            "aliceblue": [240, 248, 255, 1],
            "antiquewhite": [250, 235, 215, 1],
            "aqua": [0, 255, 255, 1],
            "aquamarine": [127, 255, 212, 1],
            "azure": [240, 255, 255, 1],
            "beige": [245, 245, 220, 1],
            "bisque": [255, 228, 196, 1],
            "black": [0, 0, 0, 1],
            "blanchedalmond": [255, 235, 205, 1],
            "blue": [0, 0, 255, 1],
            "blueviolet": [138, 43, 226, 1],
            "brown": [165, 42, 42, 1],
            "burlywood": [222, 184, 135, 1],
            "cadetblue": [95, 158, 160, 1],
            "chartreuse": [127, 255, 0, 1],
            "chocolate": [210, 105, 30, 1],
            "coral": [255, 127, 80, 1],
            "cornflowerblue": [100, 149, 237, 1],
            "cornsilk": [255, 248, 220, 1],
            "crimson": [220, 20, 60, 1],
            "cyan": [0, 255, 255, 1],
            "darkblue": [0, 0, 139, 1],
            "darkcyan": [0, 139, 139, 1],
            "darkgoldenrod": [184, 134, 11, 1],
            "darkgray": [169, 169, 169, 1],
            "darkgreen": [0, 100, 0, 1],
            "darkgrey": [169, 169, 169, 1],
            "darkkhaki": [189, 183, 107, 1],
            "darkmagenta": [139, 0, 139, 1],
            "darkolivegreen": [85, 107, 47, 1],
            "darkorange": [255, 140, 0, 1],
            "darkorchid": [153, 50, 204, 1],
            "darkred": [139, 0, 0, 1],
            "darksalmon": [233, 150, 122, 1],
            "darkseagreen": [143, 188, 143, 1],
            "darkslateblue": [72, 61, 139, 1],
            "darkslategray": [47, 79, 79, 1],
            "darkslategrey": [47, 79, 79, 1],
            "darkturquoise": [0, 206, 209, 1],
            "darkviolet": [148, 0, 211, 1],
            "deeppink": [255, 20, 147, 1],
            "deepskyblue": [0, 191, 255, 1],
            "dimgray": [105, 105, 105, 1],
            "dimgrey": [105, 105, 105, 1],
            "dodgerblue": [30, 144, 255, 1],
            "firebrick": [178, 34, 34, 1],
            "floralwhite": [255, 250, 240, 1],
            "forestgreen": [34, 139, 34, 1],
            "fuchsia": [255, 0, 255, 1],
            "gainsboro": [220, 220, 220, 1],
            "ghostwhite": [248, 248, 255, 1],
            "gold": [255, 215, 0, 1],
            "goldenrod": [218, 165, 32, 1],
            "gray": [128, 128, 128, 1],
            "green": [0, 128, 0, 1],
            "greenyellow": [173, 255, 47, 1],
            "grey": [128, 128, 128, 1],
            "honeydew": [240, 255, 240, 1],
            "hotpink": [255, 105, 180, 1],
            "indianred": [205, 92, 92, 1],
            "indigo": [75, 0, 130, 1],
            "ivory": [255, 255, 240, 1],
            "khaki": [240, 230, 140, 1],
            "lavender": [230, 230, 250, 1],
            "lavenderblush": [255, 240, 245, 1],
            "lawngreen": [124, 252, 0, 1],
            "lemonchiffon": [255, 250, 205, 1],
            "lightblue": [173, 216, 230, 1],
            "lightcoral": [240, 128, 128, 1],
            "lightcyan": [224, 255, 255, 1],
            "lightgoldenrodyellow": [250, 250, 210, 1],
            "lightgray": [211, 211, 211, 1],
            "lightgreen": [144, 238, 144, 1],
            "lightgrey": [211, 211, 211, 1],
            "lightpink": [255, 182, 193, 1],
            "lightsalmon": [255, 160, 122, 1],
            "lightseagreen": [32, 178, 170, 1],
            "lightskyblue": [135, 206, 250, 1],
            "lightslategray": [119, 136, 153, 1],
            "lightslategrey": [119, 136, 153, 1],
            "lightsteelblue": [176, 196, 222, 1],
            "lightyellow": [255, 255, 224, 1],
            "lime": [0, 255, 0, 1],
            "limegreen": [50, 205, 50, 1],
            "linen": [250, 240, 230, 1],
            "magenta": [255, 0, 255, 1],
            "maroon": [128, 0, 0, 1],
            "mediumaquamarine": [102, 205, 170, 1],
            "mediumblue": [0, 0, 205, 1],
            "mediumorchid": [186, 85, 211, 1],
            "mediumpurple": [147, 112, 219, 1],
            "mediumseagreen": [60, 179, 113, 1],
            "mediumslateblue": [123, 104, 238, 1],
            "mediumspringgreen": [0, 250, 154, 1],
            "mediumturquoise": [72, 209, 204, 1],
            "mediumvioletred": [199, 21, 133, 1],
            "midnightblue": [25, 25, 112, 1],
            "mintcream": [245, 255, 250, 1],
            "mistyrose": [255, 228, 225, 1],
            "moccasin": [255, 228, 181, 1],
            "navajowhite": [255, 222, 173, 1],
            "navy": [0, 0, 128, 1],
            "oldlace": [253, 245, 230, 1],
            "olive": [128, 128, 0, 1],
            "olivedrab": [107, 142, 35, 1],
            "orange": [255, 165, 0, 1],
            "orangered": [255, 69, 0, 1],
            "orchid": [218, 112, 214, 1],
            "palegoldenrod": [238, 232, 170, 1],
            "palegreen": [152, 251, 152, 1],
            "paleturquoise": [175, 238, 238, 1],
            "palevioletred": [219, 112, 147, 1],
            "papayawhip": [255, 239, 213, 1],
            "peachpuff": [255, 218, 185, 1],
            "peru": [205, 133, 63, 1],
            "pink": [255, 192, 203, 1],
            "plum": [221, 160, 221, 1],
            "powderblue": [176, 224, 230, 1],
            "purple": [128, 0, 128, 1],
            "red": [255, 0, 0, 1],
            "rosybrown": [188, 143, 143, 1],
            "royalblue": [65, 105, 225, 1],
            "saddlebrown": [139, 69, 19, 1],
            "salmon": [250, 128, 114, 1],
            "sandybrown": [244, 164, 96, 1],
            "seagreen": [46, 139, 87, 1],
            "seashell": [255, 245, 238, 1],
            "sienna": [160, 82, 45, 1],
            "silver": [192, 192, 192, 1],
            "skyblue": [135, 206, 235, 1],
            "slateblue": [106, 90, 205, 1],
            "slategray": [112, 128, 144, 1],
            "slategrey": [112, 128, 144, 1],
            "snow": [255, 250, 250, 1],
            "springgreen": [0, 255, 127, 1],
            "steelblue": [70, 130, 180, 1],
            "tan": [210, 180, 140, 1],
            "teal": [0, 128, 128, 1],
            "thistle": [216, 191, 216, 1],
            "tomato": [255, 99, 71, 1],
            "transparent": [0, 0, 0, 0],
            "turquoise": [64, 224, 208, 1],
            "violet": [238, 130, 238, 1],
            "wheat": [245, 222, 179, 1],
            "white": [255, 255, 255, 1],
            "whitesmoke": [245, 245, 245, 1],
            "yellow": [255, 255, 0, 1],
            "yellowgreen": [154, 205, 50, 1],
            "rebeccapurple": [102, 51, 153, 1]
        }
    }

    /**
     * Get the bootstrap colors
     * @returns {Object}
     */
    static get bootstrap() {
        return {
            "primary": [0, 123, 255, 1],
            "secondary": [108, 117, 125, 1],
            "success": [40, 167, 69, 1],
            "info": [23, 162, 184, 1],
            "warning": [255, 193, 7, 1],
            "danger": [220, 53, 69, 1],
            "light": [248, 249, 250, 1],
            "dark": [52, 58, 64, 1],
            // colors-extended.css
            "indigo": Color.fromHex('#4b0082').rgba.values,
            "indigo-light": Color.fromHex('#ca80ff').rgba.values,
            "indigo-dark": Color.fromHex('#1e0033').rgba.values,

            "teal": Color.fromHex('#1fc794').rgba.values,
            "teal-light": Color.fromHex('#e9fcf6').rgba.values,
            "teal-dark": Color.fromHex('#158463').rgba.values,

            "orange": Color.fromHex('#ff6600').rgba.values,
            "orange-light": Color.fromHex('#ffd1b3').rgba.values,
            "orange-dark": Color.fromHex('#b34700').rgba.values,

            "pink": Color.fromHex('#ff33cc').rgba.values,
            "pink-light": Color.fromHex('#ffccf2').rgba.values,
            "pink-dark": Color.fromHex('#e600ac').rgba.values,

            "maroon": Color.fromHex('#800000').rgba.values,
            "maroon-light": Color.fromHex('#ff8080').rgba.values,
            "maroon-dark": Color.fromHex('#330000').rgba.values,

            "navy": Color.fromHex('#000066').rgba.values,
            "navy-light": Color.fromHex('#6666ff').rgba.values,
            "navy-dark": Color.fromHex('#00001a').rgba.values,

            "yellow": Color.fromHex('#ffff00').rgba.values,
            "yellow-light": Color.fromHex('#ffffb3').rgba.values,
            "yellow-dark": Color.fromHex('#b3b300').rgba.values,

            "lime": Color.fromHex('#00ff00').rgba.values,
            "lime-light": Color.fromHex('#b3ffb3').rgba.values,
            "lime-dark": Color.fromHex('#00b300').rgba.values,

            "gray": Color.fromHex('#808080').rgba.values,
            "gray-light": Color.fromHex('#e6e6e6').rgba.values,
            "gray-dark": Color.fromHex('#595959').rgba.values,

            "brown": Color.fromHex('#993300').rgba.values,
            "brown-light": Color.fromHex('#ffbb99').rgba.values,
            "brown-dark": Color.fromHex('#4d1a00').rgba.values,

            "grape": Color.fromHex('#b9135b').rgba.values,
            "grape-light": Color.fromHex('#f5a3c6').rgba.values,
            "grape-dark": Color.fromHex('#730c39').rgba.values,

            "vermillion": Color.fromHex('#e34234').rgba.values,
            "vermillion-light": Color.fromHex('#f6c1bc').rgba.values,
            "vermillion-dark": Color.fromHex('#b42518').rgba.values,

            "steel": Color.fromHex('#878f99').rgba.values,
            "steel-light": Color.fromHex('#a2b9bc').rgba.values,
            "steel-dark": Color.fromHex('#6b5b95').rgba.values,

            "green": Color.fromHex('#006600').rgba.values,
            "green-light": Color.fromHex('#66ff66').rgba.values,
            "green-dark": Color.fromHex('#003300').rgba.values
        }
    }

    /**
     * @returns {Object} The closest color name and its distance
     */
    get closestName() {
        const { colors } = Color;
        const [r, g, b] = this.rgb.values;

        return Object.entries(colors).reduce((closest, [name, rgb]) => {
            const [r2, g2, b2] = rgb;
            const distance = Math.sqrt(
                Math.pow(r - r2, 2) +
                Math.pow(g - g2, 2) +
                Math.pow(b - b2, 2)
            );

            if (distance < closest.distance) {
                return {
                    name,
                    distance,
                    color: new Color(...rgb)
                };
            }

            return closest;
        }, {
            name: null,
            distance: Infinity,
            color: null
        });
    }

    /**
     * @returns {Object} The closest bootstrap color and its distance
     */
    get closestBootstrap() {
        const { bootstrap } = Color;
        const [r, g, b] = this.rgb.values;

        return Object.entries(bootstrap).reduce((closest, [name, rgb]) => {
            const [r2, g2, b2] = rgb;
            const distance = Math.sqrt(
                Math.pow(r - r2, 2) +
                Math.pow(g - g2, 2) +
                Math.pow(b - b2, 2)
            );

            if (distance < closest.distance) {
                return {
                    name,
                    distance,
                    color: new Color(...rgb)
                };
            }

            return closest;
        }, {
            name: null,
            distance: Infinity,
            color: null
        });
    }

    /**
     * @returns {Color} A copy of this color with no dependencies
     */
    clone() {
        return new Color(...this.rgba.values);
    }

    /**
     * Get a color from the bootstrap color palette
     * @param {String} name bootstrap color name 
     * @returns {Color} A color from bootstrap
     */
    static fromBootstrap(name) {
        if (!Color.bootstrap[name]) {
            throw new Error(`Invalid bootstrap color name: ${name}`);
        }

        return new Color(...Color.bootstrap[name]);
    }

    /**
     * Generate a random color with high contrast to the given colors
     * @param  {...Color} colors Colors to generate a random color with high contrast to 
     * @returns 
     */
    static generateRandomWithContrast(...colors) {
        const hsls = colors.map(c => c.hsl.values[0]);
        const intervals = hsls.reduce((intervals, hue, i) => {
            const next = hsls[i + 1];
            if (next) {
                intervals.push({
                    diff: Math.abs(hue - next),
                    hues: [hue, next]
                });
            }

            return intervals;
        }, []);

        const max = Math.max(...intervals.map(i => i.diff));
        const interval = intervals.find(i => i.diff === max);

        const [hue1, hue2] = interval.hues;
        const hue = Math.random() * (hue2 - hue1) + hue1;

        const color = Color.fromHSL(hue, 0.5, 0.5);
        return color;

        // let color = Color.random();

        // let attempts = 0;
        // while (!colors.every(c => color.detectContrast(c) >= 1)) {
        //     color = Color.random();

        //     attempts++;
        //     if (attempts > 100) {
        //         throw new Error('Could not find a color with enough contrast in 100 attempts');
        //     }
        // }

        // return color;
    }

    /**
     * 
     * @param {Number} num Number of colors to generate 
     * @param {Boolean} gradient Whether to return a gradient or an array of colors
     * @returns {Color[]} An array of colors that are complimentary to this color
     */
    compliment(num, gradient = false) {
        num = Math.floor(num);
        if (num < 2) {
            throw new Error('Must have at least 2 colors');
        }
        const interval = 1 / num;
        const hsl = this.hsl.values;
        const hues = new Array(num - 1).fill(0).map((_, i) => {
            return (hsl[0] + (i + 1) * interval) % 1;
        });

        const g = [this, ...hues.map(h => Color.fromHSL(h, hsl[1], hsl[2]))];

        return gradient ? new Gradient(...g) : g;
    }

    /**
     * @returns {Color[]} An array of colors that are analogous to this color
     */
    analogous() {
        const hsl = this.hsl.values;
        const hues = [hsl[0] - (30 / 360), hsl[0] + (30 / 360)];

        return [this, ...hues.map(h => Color.fromHSL(h, hsl[1], hsl[2]))];
    }



    /**
     * Returns a color proportional between this color and the given color
     * @param {Color} toColor 
     * @param {Number} distance 
     * @returns {Color} A color between this color and the given color
     */
    interpolate(toColor, distance) {
        if (isNaN(distance)) {
            throw new Error('Distance must be a number');
        }

        if (!(toColor instanceof Color)) {
            throw new Error('Color must be a Color instance');
        }

        if (distance < 0 || distance > 1) {
            throw new Error('Distance must be between 0 and 1');
        }

        const [r1, g1, b1] = this.rgb.values;
        const [r2, g2, b2] = toColor.rgb.values;

        const r = r1 + (r2 - r1) * distance;
        const g = g1 + (g2 - g1) * distance;
        const b = b1 + (b2 - b1) * distance;

        return new Color(r, g, b);
    }
}
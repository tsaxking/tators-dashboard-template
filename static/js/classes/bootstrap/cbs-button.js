CustomBootstrap.Button = class Button extends CustomBootstrap.Element {
    /**
     * 
     * @param {Object} options
     * @param {String} options.content The content of the button
     * @param {String} options.type The type of the button (default: button)
     * @param {String[]} options.classes The classes to add to the button
     * @param {Object} options.attributes The attributes to add to the button
     * @param {Function} options.onclick The onclick function of the button
     * @param {Object} parameters The parameters to use for read/write operations
     */
    constructor({
        content = '',
        type = 'button',
        classes = [],
        attributes = {},
        onclick = () => {}
    }, parameters = {}) {
        super();
        /**
         * @type {Object} The options of the button
         * @property {String} content The content of the button
         * @property {String} type The type of the button (default: button)
         * @property {String[]} classes The classes to add to the button
         * @property {Object} attributes The attributes to add to the button
         * @property {Function} onclick The onclick function of the button
         */
        this.options = {
            content,
            type,
            classes,
            attributes,
            onclick
        };

        /**
         * @type {Object} The parameters to use for read/write operations
         */
        this.parameters = parameters;
        this.render();
    }

    /**
     * Generates the button
     */
    render() {
        /**
         * @type {HTMLElement} The HTML element of the button
         */
        this.el = document.createElement('button');
        this.el.classList.add('btn', ...this.options.classes);
        this.el.type = this.options.type;

        if (this.options.content) {
            switch (typeof this.options.content) {
                case 'string' || 'number':
                    this.el.innerHTML = this.options.content;
                    break;
                case 'object':
                    if (this.options.content && this.options.content.querySelector) {
                        this.el.appendChild(this.options.content);
                    }
                    break;
                default:
                    console.warn('Unable to parse content. Received:', this.options.content);
                    break;
            }
        }

        this.generate();
    }

    /**
     * Disables the button
     */
    disable() {
        this.el.disabled = true;
    }

    /**
     * Enables the button
     */
    enable() {
        this.el.disabled = false;
    }
}
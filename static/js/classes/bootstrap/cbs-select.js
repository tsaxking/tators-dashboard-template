CustomBootstrap.Option = class SelectOption extends CustomBootstrap.Element {
    constructor(text, value, selected = false, properties = null, options = {}) {
        const el = document.createElement('option');
        super(el);
        /**
         * @type {Any} Any properties to be stored with the option
         */
        this.properties = properties;

        /**
         * @type {String | Number} Text of the option
         */
        this.text = text;

        /**
         * @type {String | Number} Value of the option
         */
        this.value = value;

        /**
         * @type {Boolean} Whether the option is selected or not
         */
        this.selected = selected;

        /**
         * @type {Object} Any other options to add to the option
         */
        this.options = options;

        /**
         * @type {HTMLOptionElement} The option element
         */
        this.el = el;
        this.el.value = value;
        this.el.innerHTML = text;
        this.el.selected = selected;

        if (this.options.disabled) this.disable();
        if (this.options.classes) this.el.classList.add(...this.options.classes);
    }

    /**
     * Disables the option
     */
    disable() {
        this.el.disabled = true;
    }

    /**
     * Enables the option
     */
    enable() {
        this.el.disabled = false;
    }

    /**
     * @type {Boolean} Whether the option is disabled or not
     */
    get isDisabled() {
        return this.el.disabled;
    }

    clone() {
        return new CustomBootstrap.Option(this.text, this.value, this.selected, this.properties);
    }
}
CustomBootstrap.Select = class extends CustomBootstrap.Element {
    /**
     * Builds a bootstrap select element
     * @param {HTMLSelectElement} el HTML Select Element 
     */
    constructor(el, options = {}) {
        if (!(el instanceof HTMLSelectElement)) throw new Error('el must be an HTMLSelectElement, received ' + el.constructor.name);
        super(el);
        /**
         * @type {HTMLSelectElement}
         */
        this.el = el;
        this.el.classList.add('form-select');

        /**
         * @type {Array<{CustomBootstrap.Option}>}
         */
        this.options = [];

        /**
         * @type {Array<{event: string, callback: Function}>}
         */
        this.eventListeners = [];

        /**
         * @type {CustomBootstrap.Select} The option that was selected before the current one
         */
        this.saved = null;

        /**
         * @type {Object} Any other options to add to the select
         */
        this.customOptions = options;
    }

    /**
     * 
     * @param {String | Number} text Inner Text of the option 
     * @param {String | Number} value Value of the option 
     * @param {Boolean | Number} selected Whether the option is selected or not (default: false) 
     * @param {Any} properties Any other properties to add to the option
     */
    addOption(text, value, selected = false, properties = null, options) {
        if (typeof text === 'number') text = text.toString();
        if (typeof value === 'number') value = value.toString();
        if (typeof selected === 'number') selected = !!selected;
        if (typeof text !== 'string') throw new Error('text must be a string, received ' + typeof text);
        if (typeof value !== 'string') throw new Error('value must be a string, received ' + typeof value);
        if (typeof selected !== 'boolean') throw new Error('selected must be a boolean, received ' + typeof selected);

        const option = new CustomBootstrap.Option(text, value, selected, properties, options);
        this.el.appendChild(option.el);
        this.options.push(option);

        return option;
    }

    /**
     * 
     * @param {String | Number} value 
     */
    removeOption(value) {
        if (typeof value === 'number') value = value.toString();
        if (typeof value !== 'string') throw new Error('value must be a string, received ' + typeof value);
        this.el.querySelector(`option[value="${value}"]`).remove();

        this.options = this.options.filter(o => o.value !== value);
    }

    get value() {
        const { value } = this.el;
        return this.options.find(o => o.value === value);
    }

    get selectedValue() {
        return this.value.value;
    }

    set value(value) {
        this.el.value = value;
    }

    disableOptions(...values) {
        values.forEach(v => this.disableOption(v));
    }

    enableOptions(...values) {
        values.forEach(v => this.enableOption(v));
    }

    enableAll() {
        this.options.forEach(o => {
            this.enableOption(o.value);
        });
    }

    disableAll() {
        this.options.forEach(o => o.disable());
    }

    disableOption(value) {
        const option = this.options.find(o => o.value === value);
        if (option) {
            option.disable();

            if (this.customOptions.hideDisabled) {
                option.hide();
            }
        }
    }

    enableOption(value) {
        const option = this.options.find(o => o.value === value);
        if (option) {
            option.enable();
            option.show();
        }
    }

    isDisabled(value) {
        return this.el.querySelector(`option[value="${value}"]`).disabled;
    }

    disable() {
        this.el.disabled = true;
    }

    enable() {
        this.el.disabled = false;
    }

    clearOptions() {
        this.el.innerHTML = '';
        this.options = [];
    }

    async select(value, fireChange = true) {
        if (typeof value === 'number') value = value.toString();
        if (typeof value !== 'string') throw new Error('value must be a string, received ' + typeof value);
        if (typeof fireChange !== 'boolean') throw new Error('fireChange must be a boolean, received ' + typeof fireChange);

        this.value = value;

        if (fireChange) {
            // const event = new Event('change');
            // this.el.dispatchEvent(event);
            return await this.trigger('change');
        }
    }

    save() {
        this.saved = new CustomBootstrap.Select(document.createElement('select'));
        this.saved.options = this.options.map(o => o.clone());
    }
    
    restore() {
        if (!this.saved) return;
        this.el.innerHTML = '';
        this.options = [];
        this.saved.options.forEach(o => {
            this.addOption(o.text, o.value, o.selected, o.properties);
        });
    }
}
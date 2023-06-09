CustomBootstrap.Checkbox = class extends CustomBootstrap.Element {
    /**
     *  Creates a new checkbox
     * @param {String | Number} text Text of the option 
     * @param {String | Number} value Value of the option 
     * @param {Boolean} selected Whether the option is selected or not
     * @param {Any} properties Any parameters to be stored with the option 
     */
    constructor(text, value, selected = false, properties = null) {
        if (typeof text !== 'string' && typeof text !== 'number') {
            if (text && text.querySelector) {
                throw new Error('Text was an HTML element, did you mean to use the CustomBootstrap.CheckboxGroup constructor?');
            }
            throw new Error('Text must be a string or number, received ' + typeof text + ' ' + text);
        }
        if (typeof value !== 'string' && typeof value !== 'number') throw new Error('Value must be a string or number, received ' + typeof value + ' ' + value);
        if (typeof selected !== 'boolean') throw new Error('Selected must be a boolean, received ' + typeof selected + ' ' + selected);

        super(document.createElement('div'));

        this.el.classList.add('form-check');

        this.input = document.createElement('input');
        this.input.classList.add('form-check-input');
        this.input.type = 'checkbox';
        this.input.value = value;

        this.label = document.createElement('label');
        this.label.classList.add('form-check-label');
        this.label.innerText = text;

        this.el.appendChild(this.input);
        this.el.appendChild(this.label);

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
    }

    get selected() {
        return this.input.checked;
    }

    /**
     *  Selects the option
     * @param {Boolean} trigger Whether to trigger the select event or not
     */
    select(trigger = true) {
        this.input.checked = true;

        if (trigger) this.trigger('select');
    }

    /**
     *  Deselects the option
     * @param {Boolean} trigger Whether to trigger the deselect event or not 
     */
    deselect(trigger = true) {
        this.input.checked = false;

        if (trigger) this.trigger('deselect');
    }

    /**
     *  Toggles the option
     * @param {Boolean} trigger Whether to trigger the select or deselect event or not
     */
    toggle(trigger = true) {
        if (this.selected) this.deselect(trigger);
        else this.select(trigger);
    }

    /**
     * Disables the option
     */
    disable() {
        this.input.disabled = true;
    }

    /**
     * Enables the option
     */
    enable() {
        this.input.disabled = false;
    }

    clone() {
        return new CustomBootstrap.Checkbox(this.text, this.value, this.selected, this.properties);
    }
}
CustomBootstrap.CheckboxGroup = class extends CustomBootstrap.Element {
    /**
     * 
     * @param {HTMLDivElement} el The HTML element of the checkbox group (optional)
     */
    constructor(el) {
        if (!el || !el.querySelector) throw new Error('Did not receive a valid element');
        if (!(el instanceof HTMLDivElement)) throw new Error('Element must be a div, received ' + el.tagName);
        super(el);

        /**
         * @type {HTMLDivElement} Element of the group
         */
        this.el = el;

        /**
         * @type {Array<CustomBootstrap.Checkbox>} Array of options in the group
         */
        this.options = [];

        /**
         * @type {CustomBootstrap.CheckboxGroup} Saved option
         */
        this.saved = [];
    }

    /**
     * Adds an option to the group
     * @param {String | Number} value Value of the option
     * @param {String | Number} text Text of the option
     * @param {Boolean} selected Whether the option is selected or not
     * @param {Any} properties Any properties to be stored with the option
     * @param {Object} options Options for the option
     * @param {Function} options.onselect Function to be called when the option is selected
     * @param {Function} options.ondeselect Function to be called when the option is deselected
     * @returns {Boolean} Whether the option was added or not
     */
    addOption(text, value, selected = false, properties = null, options = {}) {
        const option = new CustomBootstrap.Checkbox(text, value, selected, properties);

        if (this.options.some(v => v.value === option.value)) return false;

        this.options.push(option);
        this.el.appendChild(option.el);

        if (options) {
            if (options.onselect && typeof options.onselect === 'function') option.on('select', options.onselect);
            if (options.ondeselect && typeof options.ondeselect === 'function') option.on('deselect', options.ondeselect);
        }

        return option;
    }

    /**
     *  Removes an option from the group
     * @param {String | Number} value Value of the option to remove 
     * @returns {Boolean} Whether the option was removed or not
     */
    removeOption(value) {
        const option = this.options.find(option => option.value === value);
        if (!option) return false;

        this.options.splice(this.options.indexOf(option), 1);
        option.el.remove();
        return true;
    }

    /**
     * Removes all options from the group
     */
    clearOptions() {
        this.options.forEach(option => option.el.remove());
        this.options = [];
    }

    /**
     * @returns {Array<String | Number>} Array of values of selected options
     */
    get value() {
        return this.options.filter(option => option.selected);
    }

    /**
     * @returns {Array<String | Number>} Array of values of selected options
     */
    get selectedValue() {
        return this.value.map(o => o.value);
    }

    isSelected(value) {
        return this.options.some(option => option.value === value && option.selected);
    }

    /**
     * Selects all options
     * @param {String | Number} value Whether to select or deselect all options 
     * @returns {Boolean} Whether the operation was successful or not
     */
    select(value) {
        const option = this.options.find(option => option.value === value);
        if (!option) return false;

        return option.select();
    }

    /**
     *  Deselects all options
     * @param {String | Number} value Whether to select or deselect all options
     * @returns {Boolean} Whether the operation was successful or not
     */
    deselect(value) {
        const option = this.options.find(option => option.value === value);
        if (!option) return false;

        return option.deselect();
    }

    /**
     *  Toggles all options
     * @param {String | Number} value Whether to select or deselect all options 
     * @returns {Boolean} Whether the operation was successful or not
     */
    toggle(value) {
        const option = this.options.find(option => option.value === value);
        if (!option) return false;

        return option.toggle();
    }

    /**
     * Selects all options
     */
    selectAll() {
        this.options.forEach(option => option.select());
    }

    /**
     * Deselects all options
     */
    deselectAll() {
        this.options.forEach(option => option.deselect());
    }

    /**
     * Toggles all options
     */
    toggleAll() {
        this.options.forEach(option => option.toggle());
    }

    /**
     * Disables all options
     */
    disable() {
        this.options.forEach(option => option.disable());
    }

    /**
     * Enables all options
     */
    enable() {
        this.options.forEach(option => option.enable());
    }

    /**
     *  Disables an option
     * @param {String | Number} value Value of the option to disable 
     * @returns {Boolean} Whether the option was disabled or not
     */
    disableOption(value) {
        const option = this.options.find(option => option.value === value);
        if (!option) return false;

        return option.disable();
    }

    /**
     *  Enables an option
     * @param {String | Number} value Value of the option to enable 
     * @returns {Boolean} Whether the option was enabled or not
     */
    enableOption(value) {
        const option = this.options.find(option => option.value === value);
        if (!option) return;

        option.enable();
    }

    /**
     * Saves the current state of the group
     */
    save() {
        this.saved = new CustomBootstrap.CheckboxGroup(document.createElement('div'));
        this.saved.options = this.options.map(o => o.clone());
    }

    /**
     * Restores the group to the saved state
     */
    restore() {
        this.options.forEach(option => option.deselect(false));
        this.savedOption.forEach(option => option.select(false));
    }
}
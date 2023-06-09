CustomBootstrap.Radio = class extends CustomBootstrap.Checkbox {    /**
     *  Creates a new radio button
     * @param {String | Number} text Text of the option 
     * @param {String | Number} value Value of the option 
     * @param {Boolean} selected Whether the option is selected or not
     * @param {Any} parameters Any parameters to be stored with the option 
     */
    constructor(text, value, selected = false, parameters = {}) {
        if (text && text.querySelector) {
            throw new Error('Text was an HTML element, did you mean to use the CustomBootstrap.CheckboxGroup constructor?');
        }
        super(value, text, selected, parameters);

        this.input.type = 'radio';
    }
}
CustomBootstrap.RadioGroup = class extends CustomBootstrap.CheckboxGroup {
    /**
     * 
     * @param {HTMLDivElement} el The element to use as the group 
     */
    constructor(el) {
        super(el);

        this.el.classList.add('btn-group-toggle');
        this.el.setAttribute('data-toggle', 'buttons');

        delete this.toggle; // Remove toggle method from parent class

        /**
         * @type {CustomBootstrap.RadioGroup} The options in the group
         */
        this.saved = null;
    }

    /**
     * Adds an option to the group
     * @param {String | Number} value Value of the option 
     * @param {String | Number} text Text of the option 
     * @param {Boolean} selected Whether the option is selected or not 
     * @param {Any} parameters Any parameters to be stored with the option 
     * @returns {CustomBootstrap.Radio} The option that was added
     */
    addOption(text, value, selected = false, parameters = {}) {
        const option = new CustomBootstrap.Radio(text, value, selected, parameters);

        if (this.options.some(o => o.selected)) option.deselect();
        if (this.options.some(o => o.value === option.value)) throw new Error('Cannot add option with duplicate value (' + option.value + ')');

        option.el.classList.add('btn', 'btn-secondary');
        option.el.setAttribute('data-toggle', 'button');

        this.options.push(option);
        this.el.appendChild(option.el);

        return option;
    }

    /**
     *  Selects the option
     * @param {String | Number} value The value of the option to select
     * @returns {Boolean} Whether the option was selected or not 
     */
    select(value) {
        const option = this.options.find(o => o.value === value);
        if (!option) return false;
        this.options.forEach(o => o.deselect());
        return option.select();
    }

    /**
     *  Deselects the option
     * @param {String | Number} value The value of the option to deselect 
     * @returns {Boolean} Whether the option was deselected or not
     */
    deselect(value) {
        const option = this.options.find(o => o.value === value);
        if (option) return option.deselect();
        return false;
    }

    get value() {
        return this.options.find(o => o.selected);
    }

    get selectedValue() {
        return this.value.value;
    }

    /**
     * Saves the current state of the group
     */
    save() {
        this.saved = new CustomBootstrap.RadioGroup(this.el.cloneNode(true));
        this.saved.options = this.options.map(o => o.clone());
    }

    restore() {
        if (!this.saved) return false;
        this.el.innerHTML = '';
        this.options = [];
        this.saved.options.forEach(o => this.addOption(o.value, o.text, o.selected, o.parameters));
        return true;
    }
}
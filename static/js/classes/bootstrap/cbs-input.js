CustomBootstrap.Input = class Input extends CustomBootstrap.Element {
    /**
     * 
     * @param {String} type The type of input to create
     * @param {Object} options Options
     * @param {String} options.placeholder Placeholder text
     * @param {String} options.value input value
     * @param {String} options.name input name
     * @param {Boolean} options.required Whether the input is required or not
     * @param {Object[] | String[]} options.datalist The datalist options
     * @param {String} options.datalist[].label The label of the option
     */
    constructor(type = 'text', options = {}) {
        super();
        /**
         * @type {String} The type of input
         */
        this.type = type;
        switch (type) {
            case 'text':
                /**
                 * @type {HTMLInputElement} The input element
                 */
                this.el = document.createElement('input');
                this.el.type = 'text';
                this.el.classList.add('form-control');
                break;
            case 'textarea':
                /**
                 * @type {HTMLTextAreaElement} The textarea element
                 */
                this.el = document.createElement('textarea');
                this.el.classList.add('form-control');
                break;
            case 'password':
                /**
                 * @type {HTMLInputElement} The input element
                 */
                this.el = document.createElement('input');
                this.el.type = 'password';
                this.el.classList.add('form-control');
                break;
            case 'file':
                /**
                 * @type {HTMLInputElement} The input element
                 */
                this.el = document.createElement('input');
                this.el.type = 'file';
                this.el.classList.add('form-control-file');
                break;
            default:
                throw new Error('Invalid input type');
        }

        if (options.placeholder) this.el.placeholder = options.placeholder;
        if (options.value) this.el.value = options.value;
        if (options.name) this.el.name = options.name;
        if (options.required) this.el.required = true;

        if (options.datalist) {
            /**
             * @type {HTMLDataListElement} The datalist element
             */
            this.datalist = document.createElement('datalist');
            this.datalist.id = 'datalist-' + Math.random().toString(36) + '-' + Date.now();
            options.datalist.options.forEach((option) => {
                if (typeof option === 'string') option = { value: option, label: option };
                option.el = document.createElement('option');
                option.el.value = option.label;
                this.datalist.appendChild(option.el);
            });
            this.el.setAttribute('list', this.datalist.id);
        }

        /**
         * @type {Object} The options of the input
         */
        this.options = options;
    }

    /**
     * @type {String} The value of the input
     * @type {FileList} The files of the input if the type is file
     * @type {Any} The value that an option represents if the input has a datalist
     * @readonly
     */
    get value() {
        if (this.type === 'file') return this.el.files;
        if (this.options.datalist) {
            const { value } = this.el;
            const { options } = this.options.datalist;
            const option = options.find((option) => option.label === value);
            return option ? option.value : value;
        }
        else return this.el.value;
    }

    /**
     * @type {String} The value of the input
     */
    set value(value) {
        this.el.value = value;
    }
    
    /**
     * @type {String} The placeholder of the input
     */
    disable() {
        this.el.disabled = true;
    }

    /**
     * @type {String} The placeholder of the input
     */
    enable() {
        this.el.disabled = false;
    }
}
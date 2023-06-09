CustomBootstrap.ButtonGroup = class extends CustomBootstrap.Element {
    /**
     * 
     * @param {HTMLElement} el The HTML element of the button group (optional)
     */
    constructor(el) {
        super();
        if (el) el.innerHTML = '';
        /**
         * @type {HTMLElement} The HTML element of the button group
         */
        this.el = el || document.createElement('div');
        this.el.classList.add('btn-group');

        /**
         * @type {CustomBootstrap.Button[]} The buttons in the group
         */
        this.buttons = [];
    }

    /**
     * Adds a button to the group
     * @param {...CustomBootstrap.Button} button CustomBootstrap.Button to add to the group 
     */
    addButton(...button) {
        this.buttons.push(...button);
        button.forEach(b => this.el.appendChild(b.el));
    }

    /**
     * Removes a button from the group
     * @param {CustomBootstrap.Button} button CustomBootstrap.Button to remove from the group
     */
    removeButton(button) {
        this.buttons.splice(this.buttons.indexOf(button), 1);
        this.el.removeChild(button.el);
    }
}
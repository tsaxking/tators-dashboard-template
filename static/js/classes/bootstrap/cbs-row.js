CustomBootstrap.Row = class extends CustomBootstrap.Element {
    constructor(options = {
        columns: [],
        classes: [],
        attributes: {}
    }) {
        super();
        this.options = options;
        this.render();
    }

    render() {
        this.el = document.createElement('div');
        this.el.classList.add('row', ...this.options.classes);
        Object.entries(this.options.attributes).forEach(([key, value]) => {
            this.el.setAttribute(key, value);
        });
        this.options.columns.forEach(column => {
            this.el.appendChild(column.el);
        });
    }
}
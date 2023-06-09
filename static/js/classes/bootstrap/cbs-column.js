CustomBootstrap.Column = class extends CustomBootstrap.Element {
    constructor(options = {
        classes: [],
        attributes: {},
        width: '100%',
        height: '100%',
        content: ''
    }) {
        super();
        this.options = options;
        this.render();
    }

    render() {
        this.el = document.createElement('div');
        this.el.classList.add('col', ...this.options.classes);
        this.el.style.width = this.options.width;
        this.el.style.height = this.options.height;
        Object.entries(this.options.attributes).forEach(([key, value]) => {
            this.el.setAttribute(key, value);
        });
        this.el.innerHTML = this.options.content;
    }
}
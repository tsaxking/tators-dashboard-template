CustomBootstrap.Card = class Card extends CustomBootstrap.Element {
    /**
     * 
     * @param {Object} options
     * @param {String} options.body The body of the card
     * @param {String} options.footer The footer of the card
     * @param {String} options.header The header of the card
     * @param {Object} parameters The parameters to use for read/write operations
     */
    constructor({
        body = '',
        footer = '',
        header = '',
        width = '100%',
        height = '100%',
        id = '',
        classes = [],
        attributes = {},
        minimize = false
    } = {}, parameters = {}) {
        super();
        this.options = {
            body,
            footer,
            header,
            width,
            height,
            id,
            classes,
            attributes,
            minimize
        };

        /**
         * @type {Object} The sub elements of the card
         * @property {HTMLElement} body The body of the card
         * @property {HTMLElement} footer The footer of the card
         * @property {HTMLElement} header The header of the card
         */
        this.subElements = {};
        this.parameters = parameters;

        this.render();
    }

    render() {
        let {
            body,
            footer,
            header,
            width,
            height,
            id,
            classes,
            attributes,
            minimize
        } = this.options;

        /**
         * @type {HTMLElement} The HTML element of the card
         */
        this.el = document.createElement('div');
        this.el.classList.add('card',...classes);
        this.el.style.width = width;
        this.el.style.height = height;
        this.el.id = id;
        Object.entries(attributes).forEach(([key, value]) => {
            this.el.setAttribute(key, value);
        });
        if (header) {
            this.subElements.header = document.createElement('div');
            this.subElements.header.classList.add('card-header');
            if (minimize) {
                this.subElements.minimize = document.createElement('button');
                this.subElements.minimize.classList.add('btn', 'btn-sm', 'btn-outline-secondary', 'float-right');
                this.subElements.minimize.innerText = 'Minimize';
                this.subElements.minimize.addEventListener('click', () => {
                    this.subElements.body.classList.toggle('d-none');
                    this.subElements.footer.classList.toggle('d-none');
                    this.subElements.minimize.classList.toggle('rotate-180');
                });
                this.subElements.header.appendChild(this.subElements.minimize);
            }

            switch (typeof header) {
                case 'string' || 'number':
                    this.subElements.header.innerHTML = header;
                    break;
                case 'object':
                    if (header && header.querySelector) {
                        this.subElements.header.appendChild(header);
                    }
                    break;
                default:
                    console.warn('Unable to parse header. Received:', header);
                    break;
            }

            this.el.appendChild(this.subElements.header);
        }


        if (body) {
            this.subElements.body = document.createElement('div');
            this.subElements.body.classList.add('card-body');
            // CustomBootstrap.addContent(this.subElements.body, body, this.parameters, 'card');

            switch (typeof body) {
                case 'string' || 'number':
                    this.subElements.body.innerHTML = body;
                    break;
                case 'object':
                    if (body && body.querySelector) {
                        this.subElements.header.appendChild(body);
                    }
                    break;
                default:
                    console.warn('Unable to parse body. Received:', body);
                    break;
            }

            this.el.appendChild(this.subElements.body);
        }

        if (footer) {
            this.subElements.footer = document.createElement('div');
            this.subElements.footer.classList.add('card-footer');
            // CustomBootstrap.addContent(this.subElements.footer, footer, this.parameters, 'card');

            switch (typeof footer) {
                case 'string' || 'number':
                    this.subElements.footer.innerHTML = footer;
                    break;
                case 'object':
                    if (footer && footer.querySelector) {
                        this.subElements.header.appendChild(footer);
                    }
                    break;
                default:
                    console.warn('Unable to parse footer. Received:', footer);
                    break;
            }

            this.el.appendChild(this.subElements.footer);
        }

        this.generate();
    }
}
CustomBootstrap.modals = [];

CustomBootstrap.numModals = 0;
CustomBootstrap.Modal = class Modal extends CustomBootstrap.Element {
    /**
     * 
     * @param {Object} options modal options
     * @param {CustomBootstrap.Button[]} options.buttons Footer buttons
     * @param {Object} parameters 
     */
    constructor({
        title = 'Custom Bootstrap Modal',
        body = '',
        footer = '',
        size = 'md',
        buttons = [],
        color = 'light'
    } = {}, parameters = {}) {
        super();

        if (!footer) {
            const closeButton = new CustomBootstrap.Button({
                content: 'Close',
                classes: ['btn-secondary']
            });

            closeButton.on('click', () => {
                this.hide();
            });

            buttons.push(closeButton);
        }

        this.options = {
            title,
            body,
            footer,
            size,
            buttons,
            color
        };
        this.parameters = parameters;
        this.render();

        CustomBootstrap.numModals++;
    }

    render() {
        let {
            title = '',
            body = '',
            footer = '',
            size = 'md',
            buttons = [],
            color // TODO: add color to cbs-modals
        } = this.options;

        this.el = document.createElement('div');
        this.el.id = 'cbs-modal-' + CustomBootstrap.numModals;
        this.el.classList.add('modal', 'fade');
        this.el.setAttribute('tabindex', '-1');
        this.el.setAttribute('role', 'dialog');
        this.el.setAttribute('aria-labelledby', 'modalLabel-' + CustomBootstrap.numModals);
        this.el.setAttribute('aria-hidden', 'true');

        this.el.innerHTML = `
            <div class="modal-dialog modal-${size}" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalLabel-${CustomBootstrap.numModals}"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                    </div>
                    <div class="modal-footer">
                    </div>
                </div>
            </div>
        `;

        if (footer && buttons.length) {
            throw new Error('You can\'t use both footer and buttons options');
        }

        this.subElements = {
            title: this.el.querySelector('.modal-title'),
            body: this.el.querySelector('.modal-body'),
            footer: this.el.querySelector('.modal-footer')
        }

        if (buttons.length) {
            buttons.forEach(button => {
                this.subElements.footer.appendChild(button.el);
            });
        }

        if (title) {
            switch (typeof title) {
                case 'string' || 'number':
                    this.subElements.title.innerHTML = title;
                    break;
                case 'object':
                    if (title && title.querySelector) {
                        this.subElements.title.appendChild(title);
                    }
                    break;
                default:
                    console.warn('Unable to parse title. Received:', title);
                    break;
            }
        }

        if (body) {
            switch (typeof body) {
                case 'string' || 'number':
                    this.subElements.body.innerHTML = body;
                    break;
                case 'object':
                    if (body && body.querySelector) {
                        this.subElements.body.appendChild(body);
                    }
                    break;
                default:
                    console.warn('Unable to parse body. Received:', body);
                    break;
            }
        }

        if (footer) {
            switch (typeof footer) {
                case 'string' || 'number':
                    this.subElements.footer.innerHTML = footer;
                    break;
                case 'object':
                    if (footer && footer.querySelector) {
                        this.subElements.footer.appendChild(footer);
                    }
                    break;
                default:
                    console.warn('Unable to parse footer. Received:', footer);
                    break;
            }
        }

        CustomBootstrap.modals.push(this);
        this.generate();
        document.body.append(this.el);
        // console.log(this.el.innerHTML);
    }


    destroy() {
        this.hide();
        this.el.remove();
    }

    show() {
        $(this.el).modal('show');
    }

    hide() {
        $(this.el).modal('hide');
    }
}
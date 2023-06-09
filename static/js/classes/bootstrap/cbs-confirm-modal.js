/**
 * 
 * @param {String} message Confirm message 
 * @param {Object} options Options
 * @param {Function} options.password Function to check if the password is correct
 * @param {String} options.enterText Text to enter to confirm 
 * @returns {Promise<Boolean>} Whether the user confirmed or not
 */
CustomBootstrap.confirm = (message, options = {}) => {
    return new Promise((res, rej) => {
        const shake = (el) => {
            el.classList.add('animate__animated', 'animate__shakeX');
            el.addEventListener('animationend', () => {
                el.classList.remove('animate__animated', 'animate__shakeX', 'animate__fast');
            });
        }

        const confirm = new CustomBootstrap.ConfirmModal(message, options);

        confirm.modal.el.addEventListener('hidden.bs.modal', () => {
            confirm.modal.el.remove();
            res(false);
        });

        confirm.modal.el.querySelector('.confirm-btn').addEventListener('click', async() => {
            const { password } = confirm.options;

            if (password) {
                if (typeof password !== 'function') throw new Error('password must be a function');
                if (confirm.modal.el.querySelector('input').value !== await password()) {
                    return shake(confirm.modal.el);
                }
            }

            if (confirm.options.enterText) {
                if (confirm.modal.el.querySelector('input').value !== confirm.options.enterText) {
                    return shake(confirm.modal.el);
                }
            }

            res(true);
            $(confirm.modal.el).modal('hide');
        });

        confirm.modal.el.querySelector('.cancel-btn').addEventListener('click', () => {
            res(false);
            $(confirm.modal.el).modal('hide');
        });

        confirm.modal.show();

        confirm.modal.el.querySelector('.confirm-btn').focus();
    });
}
CustomBootstrap.ConfirmModal = class {
    /**
     * 
     * @param {String} message Confirm message 
     * @param {Object} options Options
     * @param {String} options.title Title of the modal
     * @param {String} options.confirmText Text of the confirm button
     * @param {String} options.cancelText Text of the cancel button
     * @param {String} options.confirmClass Class of the confirm button
     * @param {String} options.cancelClass Class of the cancel button
     * @param {Function} options.password Function to check if the password is correct
     * @param {String} options.enterText Text to enter to confirm
     * @param {Array} options.buttons Array of buttons to add to the modal
     */
    constructor(message, {
        title = '<span class="no-select">Confirm</span>',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        password = null,
        enterText = null,
        buttons = []
    } = {}) {
        this.message = message;
        this.options = {
            title,
            confirmText,
            cancelText,
            password,
            enterText,
            buttons
        };

        this.render();
    }

    render() {
        const {
            title,
            confirmText,
            cancelText,
            password,
            enterText
        } = this.options;

        const body = document.createElement('div');
        const p = document.createElement('p');
        p.innerHTML = this.message;
        body.append(p);

        if (password) {
            if (typeof password.test !== 'function') throw new Error('password.test must be a function');
            const input = document.createElement('input');
            input.type = 'password';
            input.classList.add('form-control');
            input.placeholder = 'Password';
            body.append(input);
        }

        if (enterText) {
            const input = document.createElement('input');
            input.type = 'text';
            input.classList.add('form-control');
            input.placeholder = 'Type: ' + enterText;
            body.append(input);
        }

        const confirm = new CustomBootstrap.Button({
            content: 'Confirm',
            classes: [
                'btn-primary'
            ]
        });

        this.modal = new CustomBootstrap.Modal({
            title,
            body,
            buttons: [
                confirm
            ]
        });

        if (password) {
            const test = async () => {
                const { value } = this.modal.el.querySelector('button.confirm-btn');
                res(password.test(value));
            }
            confirm.on('click', test);

            this.modal.el.querySelector('input').addEventListener('keyup', (e) => {
                if (e.key === 'Enter') test();
            });
        }
    }
}
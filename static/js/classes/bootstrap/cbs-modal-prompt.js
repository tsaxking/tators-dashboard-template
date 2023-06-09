CustomBootstrap.prompt = (title, {
    type = 'text',
    placeholder = ''
} = {}) => {
    options = {
        type,
        placeholder
    }

    return new Promise((res, rej) => {
        const input = document.createElement('input');
        input.classList.add('form-control');
        input.type = options.type || 'text';
        input.placeholder = options.placeholder || '';
        const modal = new CustomBootstrap.Modal({
            title,
            body: input,
            buttons: [
                new CustomBootstrap.Button({
                    content: 'Cancel',
                    classes: [
                        'btn-secondary'
                    ],
                    onclick: () => {
                        modal.destroy();
                        res(false);
                    }
                }),
                new CustomBootstrap.Button({
                    content: 'Submit',
                    classes: [
                        'btn-primary'
                    ],
                    onclick: () => {
                        modal.destroy();
                        res(input.value);
                    }
                })
            ]
        });

        modal.on('hidden.bs.modal', () => {
            res(false);
        });

        modal.show();
    });
}
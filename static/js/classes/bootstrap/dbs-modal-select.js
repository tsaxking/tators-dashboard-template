CustomBootstrap.modalSelect = (title, options) => {
    return new Promise((res, rej) => {
        const select = new CustomBootstrap.Select(document.createElement('select'));
        options.forEach(option => {
            select.addOption(option, option);
        });
        const modal = new CustomBootstrap.Modal({
            title,
            body: select.el,
            buttons: [
                new CustomBootstrap.Button({
                    content: 'Cancel',
                    color: 'secondary',
                    onclick: () => {
                        modal.destroy();
                        res(false);
                    }
                }),
                new CustomBootstrap.Button({
                    content: 'Select',
                    color: 'primary',
                    onclick: () => {
                        modal.destroy();
                        res(select.el.value);
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
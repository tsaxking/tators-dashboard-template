/**
 * Alert modal
 * @param {String} message Alert message
 * @param {Object} options Options
 * @param {String} options.color Color of the alert (default: danger)
 * @returns 
 */
CustomBootstrap.alert = (message, {
    color = 'danger'
} = {}) => {
    return new Promise((res, rej) => {
        const alert = new CustomBootstrap.Modal({
            title: 'Alert',
            body: message,
            color
        });

        alert.on('hidden.bs.modal', () => {
            alert.el.remove();
            res(true);
        });

        alert.show();
    });
}
class CustomNotification {
    constructor(title, msg, color, options) {
        this.title = title;
        this.msg = msg;
        this.color = color;
        this.options = options;
    }

    create() {
        this.el = createNotificationEl(this.title, this.msg, this.color, this.options);
    }

    static createNew(title, msg, color, options) {
        const n = new CustomNotification(title, msg, color, options);
        n.create();
    }

    remove() {
        this.el.remove();
    }
}



document.addEventListener('DOMContentLoaded', () => {
    // VVVVVVVVV Creates notification container VVVVVVVVV
    let notificationEl = document.createElement('div');
    notificationEl.setAttribute('aria-live', 'polite');
    notificationEl.setAttribute('aria-atomic', 'true');
    notificationEl.style.minWidth = 'min-content';
    notificationEl.style.minHeight = 'min-content';
    notificationEl.style.position = 'fixed';
    notificationEl.style.top = '56px';
    notificationEl.style.right = '0px';
    notificationEl.classList.add('text-light');

    let innerNotificationEl = document.createElement('div');
    innerNotificationEl.style.position = 'absolute';
    innerNotificationEl.style.top = '0';
    innerNotificationEl.style.right = '0';
    innerNotificationEl.id = 'notifications';

    notificationEl.appendChild(innerNotificationEl);

    document.querySelector('main').appendChild(notificationEl);
});



let num = 0;

// Makes toast
function createNotificationEl(title, msg, color) {
    let toast = document.createElement('div');
    toast.classList.add('toast');
    toast.classList.add(`bg-${color}`);
    toast.classList.add('notification');
    toast.id = 'notification-' + num;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    let header = document.createElement('div');
    header.classList.add('toast-header');
    header.classList.add('bg-dark');
    header.classList.add('d-flex');
    header.classList.add('justify-content-between');

    let strong = document.createElement('strong');
    strong.classList.add('mr-auto');
    strong.classList.add(`text-${color}`);
    strong.innerText = title ? title : 'Team Tators';
    header.appendChild(strong);

    let small = document.createElement('small');
    small.classList.add('text-muted');
    small.innerText = (new Date(Date.now())).toDateString();
    header.appendChild(small);

    let button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('ml-2');
    button.classList.add('mb-1');
    button.classList.add('bg-dark');
    button.classList.add('border-0');
    button.classList.add('text-light');
    button.setAttribute('data-dismiss', 'toast');


    let span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = '&times;';
    button.appendChild(span);
    header.appendChild(button);
    toast.appendChild(header);

    let body = document.createElement('div');
    body.classList.add('toast-body');
    body.innerText = msg;
    toast.appendChild(body);

    return toast;
}

/**
 * 
 * @param {String} title title, defaults to 'Team Tators'
 * @param {String} msg content of body
 * @param {String} color bs color
 * @param {Number} length in seconds 
 */
function createNotification(title, msg, color, options) {
    let length, permanent = false;

    if (options) {
        length = options.length;
        permanent = options.permanent;
    }

    let notification = createNotificationEl(title, msg, color);

    let removed = false;
    const timeout = setTimeout(() => {
        removed = true;
        removeNotification(notification);
    }, length ? length * 1000 : 1000 * 5);

    notification.querySelector('button').addEventListener('click', () => {
        if (!removed) {
            removeNotification(notification);
            clearTimeout(timeout);
        }
    });

    document.querySelector('#notifications').appendChild(notification);

    // Shows toast using bs api
    $(`#notification-${num}`).toast({
        animation: true,
        autohide: !permanent,
        delay: length ? length * 1000 : 1000 * 5
    });
    $(`#notification-${num}`).toast('show');
    $(`#${notification.id}`).on('hidden.bs.toast', () => {
        notification.remove();
    });
    num++;

    return notification;
}

function removeNotification(notification) {
    $(`#${notification.id}`).toast('hide');
}

function pushNotification(title, message) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        // alert("This browser does not support desktop notification");
        return;
    }
    // Let's check if the user is okay to get some notification
    if (window.Notification.permission === "granted") {
        // If it's okay let's create a notification
        var options = {
            body: message,
            dir: "ltr"
        };
        var notification = new window.Notification(title ? title : "Team Tators", options);
        console.log(notification);
        return;
    }
    // Otherwise, we need to ask the user for permission
    // Note, Chrome does not implement the permission static property
    // So we have to check for NOT 'denied' instead of 'default'
    if (Notification.permission !== 'denied') {
        Notification.requestPermission(function(permission) {
            // Whatever the user answers, we make sure we store the information
            if (!('permission' in Notification)) {
                Notification.permission = permission;
            }
            // If the user is okay, let's create a notification
            if (permission === "granted") {
                var options = {
                    body: message,
                    dir: "ltr"
                };
                var notification = new Notification(title ? title : "Team Tators", options);
            }
        });
        return;
    }

    alert(`${title ? title : "Team Tators"}: ${message}`);

    // At last, if the user already denied any notification, and you
    // want to be respectful there is no need to bother them anymore.
}

// TODO: run on deployment
// pushNotification('Team Tators: init', 'Notifications are working!');
function disableButton(btn) {
    btn.setAttribute('disabled', true);
}

function enableButton(btn) {
    btn.removeAttribute('disabled');
}

function createButton(html, classes, listeners, attributes) {
    const btn = document.createElement('btn');
    btn.classList.add('btn');
    if (classes) {
        classes.forEach(c => {
            btn.classList.add(c);
        });
    }

    btn.innerHTML = html;

    if (listeners) {
        listeners.forEach(l => {
            btn.addEventListener(l.type, l.action);
        });
    }

    if (attributes) {
        attributes.forEach(a => {
            btn.setAttribute(a.attribute, a.value);
        });
    }

    return btn;
}
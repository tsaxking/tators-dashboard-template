// PRIORITY_0
class CustomBootstrap {
    static replaceAllInEl(el, parameters, elType) {
        // replaces every instance of {{param}} with the value of parameters[param]
        // runs recursively on all children of el
        // returns el
        if (!el) return el;

        const type = typeof el;

        if (el.querySelector) {
            el.querySelectorAll('[data-cbs-replace]').forEach(el => {
                const span = document.createElement('span');
                span.innerHTML = parameters[el.dataset.cbsReplace];
                el.parentNode.replaceChild(span, el);
            });
        } else if (type === 'string' || type === 'number' || type === 'boolean') {
            Object.entries(parameters).forEach(([key, value]) => {
                el = el.replace(
                    new RegExp(`{{${key}}}`, 'g'),
                    `<span data-${elType}-param="${elType}-${key}">${value}</span>`
                );
            });
        }

        return el;
    }

    static addContent(el, content, parameters = {}, elType) {
        if (!content) return el;
        content = this.replaceAllInEl(content, parameters, elType);
        if (typeof content === 'string') {
            el.innerHTML = content;
        } else if (el.querySelector) {
            el.appendChild(content);
        }

        return el;
    }
}

CustomBootstrap.Element = class {
    constructor(el) {
        /**
         * @type {HTMLElement}
         */
        this.el = el || null;

        /**
         * @type {Array<{event: string, callback: Function, options: Object}>} All event listeners added to this.el
         */
        this.listeners = [];

        /**
         * @type {Object} all events and their respective functions
         */
        this.events = {};

        /**
         * @type {StateStack} StateStack for this
         */
        this.stack = new StateStack();
    }

    /**
     * Adds an event listener to this.el
     * @param {String} event Event name
     * @param {Function} callback Callback function
     * @param {Object} options Options object
     * @param {Boolean} async Whether to run the callback asynchronously with the other event listeners, or synchronously (default is to run synchrounously)
     */
    on(event, callback, options, async = false) {
        if (!this.el) throw new Error('No element to add event listener to');
        if (typeof event !== 'string') throw new Error('event must be a string, received ' + typeof event);
        if (typeof callback !== 'function') throw new Error('callback must be a function, received ' + typeof callback);
        if (options && typeof options !== 'object') throw new Error('options must be an object, received ' + typeof options);

        // custom event listeners
        switch (event.toLowerCase()) {
            // statestack
            case 'state.change':
                this.stack.onChange = callback;
                return;
            case 'state.reject':
                this.stack.onReject = callback;
                return;
            case 'state.clear':
                this.stack.onClear = callback;
                return;
        }

        const errCallback = async (e) => {
            let success = true;
            const listeners = this.listeners.filter(l => l.event === event);

            listeners.filter(l => l.async).forEach(l => l.callback(e));

            for (const listener of listeners.filter(l => !l.async)) {
                try {
                    await listener.callback(e);
                } catch (err) {
                    success = false;
                    console.error(err);
                }
            }
            return success;
        }

        if (!this.has(event)) {
            this.el.addEventListener(event, errCallback, options);
            this.events[event] = errCallback;
        };

        this.listeners.push({
            event,
            callback,
            options,
            async
        });
    }

    /**
     *  Removes an event listener from this.el
     * @param {String} event 
     * @param {Function} callback 
     * @param {Object} options 
     * @returns {Void}
     * 
     * If no event is provided, removes all event listeners
     * If no callback is provided, removes all event listeners with the provided event
     * If no options is provided, removes all event listeners with the provided event and callback
     * 
     * @example
     * // remove all event listeners
     * this.off();
     * // remove all event listeners with the event 'click'
     * this.off('click');
     * // remove all event listeners with the event 'click' and callback 'this.onClick'
     * this.off('click', this.onClick);
     * // remove all event listeners with the event 'click', callback 'this.onClick', and options { once: true }
     * this.off('click', this.onClick, { once: true });
     */
    off(event, callback, options) {
        if (!this.el) throw new Error('No element to remove event listener from');

        if (!event) {
            this.listeners = [];
            delete this.events[event];
            return;
        }

        if (typeof event !== 'string') throw new Error('event must be a string, received ' + typeof event);

        if (!callback) {
            this.listeners = this.listeners.filter(listener => listener.event !== event);
            return;
        }

        if (typeof callback !== 'function') throw new Error('callback must be a function, received ' + typeof callback);

        if (!options) {
            this.listeners = this.listeners.filter(listener => listener.event !== event || listener.callback !== callback);
            return;
        }

        if (typeof options !== 'object') throw new Error('options must be an object, received ' + typeof options);

        this.el.removeEventListener(event, callback, options);
        this.listeners = this.listeners.filter(listener => listener.event !== event || listener.callback !== callback || listener.options !== options);
    }

    /**
     * 
     * @param {String} event Event name 
     * @returns {Boolean} Whether or not this.el has an event listener with the provided event
     */
    has(event) {
        return this.listeners.some(listener => listener.event === event);
    }

    /**
     * Fires an event on this.el
     * @param {String} event Event name 
     * @param {Object} options Options object
     */
    async trigger(event, options) {
        if (!this.el) throw new Error('No element to fire event on');
        if (typeof event !== 'string') throw new Error('event must be a string, received ' + typeof event);
        return new Promise((res, rej) => {
            if (this.events[event]) {
                this.events[event](options).then(res).catch(rej);
            } else {
                rej('No event listener for event: ' + event);
            }
        });
    }











    
    /**
     * Builds the element
     */
    generate() {
        const { parameters } = this;
        if (!parameters || !Object.keys(parameters).length) return;

        const isShallow = (el) => {
            return !el.children.length
        }

        if (this.el) {
            // find all data-cbs-replace attributes and replace them with a div with the same data-cbs-replace attribute
            this.el.querySelectorAll('[data-cbs-replace]').forEach(e => {
                const replacement = document.createElement('div');
                replacement.dataset['cbs-' + this.constructor.name] = e.dataset['cbs-replace'];
                e.replaceWith(replacement);
            });
            const matches = Array.from(this.el.querySelectorAll('*')).filter(el => el.innerHTML.match(/{{.*}}/));
            matches.forEach(match => {
                if (isShallow(match)) {
                    const params = match.innerHTML.match(/{{\w*}}/g);
                    params.forEach(param => {
                        const key = param.replace(/{{|}}/g, '');
                        const value = `<span data-cbs-${this.constructor.name}="${key}"></span>`
                        if (value) {
                            match.innerHTML = match.innerHTML.replace(param, value);
                        }
                    });
                }
            });
        }

        Object.entries(parameters).forEach(([param, value]) => {
            this.write(param, value);
        });
    }

    read(param, asHtml = false) {
        const arr = Array.from(this.el.querySelectorAll(`[data-cbs-${this.constructor.name}="${param}"]`));
        if (asHtml) return arr.map(el => el.children[0] || el);
        return arr.map(el => el.innerHTML);
    }

    write(param, value) {
        this.el.querySelectorAll(`[data-cbs-${this.constructor.name}="${param}"]`).forEach(el => {
            if (value) {
                if (typeof value === 'string' || typeof value === 'number') {
                    el.innerHTML = value;
                } else if (value.querySelector) {
                    try {
                        // remove all children
                        while (el.firstChild) {
                            el.removeChild(el.firstChild);
                        }
                        el.appendChild(value);
                    } catch {
                        console.error('Unable to append child, it may be a text node, or the node may be already appended to another element');
                    }
                } else {
                    console.warn('Unable to place html. Received: ', value);
                }
            }
        });

        this.parameters[param] = value;
    }







    /**
     * Hides the element (adds d-none class)
     */
    hide() {
        this.el.classList.add('d-none');
    }

    /**
     * Shows the element (removes d-none class)
     */
    show() {
        this.el.classList.remove('d-none');
    }

    /**
     * Tests if the element is hidden (has the d-none class)
     */
    get isHidden() {
        return this.el.classList.contains('d-none');
    }

    /**
     * Toggles the d-none class
     */
    toggleHide() {
        this.el.classList.toggle('d-none');
    }

    destroy() {
        this.el.remove();
    }





    // states
    /**
     * Adds a state to the element
     */
    addState() {
        this.stack.addState(this.clone());
    }

    /**
     * Clones this 
     * @param {Boolean} listeners Whether or not to clone all listeners (default: true)
     * @returns {CustomBootstrap.Element} A clone of this
     */
    clone(listeners = true) {
        // this will probably need to be changed for every extension of this class

        const clone = new this.constructor(this.el.cloneNode(true));

        // clones all listeners too
        if (listeners) this.listeners.forEach(listener => {
            clone.on(listener.event, listener.callback, listener.options);
        });

        return clone;
    }
}
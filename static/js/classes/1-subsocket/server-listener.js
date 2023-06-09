class ServerListener {
    /**
     * 
     * @param {String} event 
     */
    constructor(event, socket) {
        if (typeof event !== "string") throw new Error("event must be a string");

        /**
         * @type {String} The event name
         */
        this.event = event;

        /**
         * @type {ServerListener.Listener[]} The listeners
         */
        this.listeners = [];

        /**
         * @type {WebSocket} The websocket
         */
        this.socket = socket;
    }

    /**
     * 
     * @param {Any} criteria 
     * @param  {...any} args 
     */
    onUpdate(criteria, ...args) {
        this.listeners.forEach(listener => listener.onUpdate(criteria, ...args));
    }

    /**
     * @callback CriteriaTest
     * @param {Any} criteria
     * @returns {Boolean}
     */

    /**
     * @callback ListenerCallback
     * @param {Any} data
     */

    /**
     * Creates a ServerListener.Listener
     * @param {ListenerCallback} callback 
     * @param {CriteriaTest} criteriaTest
     */
    on(callback, criteriaTest) {
        if (typeof callback !== "function") throw new Error("callback must be a function");
        if (!criteriaTest) criteriaTest = () => true;
        if (typeof criteriaTest !== "function") throw new Error("criteriaTest must be a function");

        const listener = new ServerListener.Listener(criteriaTest, callback, this);
        this.listeners.push(listener);

        return listener;
    }

    /**
     * Removes all listeners
     */
    allOff() {
        this.listeners = [];
    }

    /**
     * Removes a listener
     * @param {ServerListener.Listener} listener 
     */
    off(listener) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }

    /**
     * Removes all listeners that meets a specific criteria
     * @param {Any} criteria 
     */
    offCriteria(criteria) {
        this.listeners = this.listeners.filter(listener => !listener.criteriaTest(criteria));
    }

    /**
     * 
     * @param {Any} data 
     * @param {undefined | Array} criteria
     */
    update(data, criteria = []) {
        this.socket.emit(this.event, criteria, data);
    }
}



ServerListener.Listener = class Listener {
    /**
     * @callback CriteriaTest
     * @param {Any} criteria
     * @returns {Boolean}
     */

    /**
     * @callback ListenerCallback
     * @param {Any} data
     * @param {Any} criteria
     */

    /**
     * 
     * @param {CriteriaTest} criteriaTest
     * @param {ListenerCallback} callback
     * @param {ServerListener} listener
     */
    constructor(criteriaTest, callback, listener) {
        if (typeof criteriaTest !== "function") throw new Error("criteriaTest must be a function");
        if (typeof callback !== "function") throw new Error("callback must be a function");
        if (!(listener instanceof ServerListener)) throw new Error("listener must be a ServerListener");

        /**
         * @type {String} The required criteria
         */
        this.criteriaTest = criteriaTest;

        /**
         * @type {Function} The callback function
         */
        this.callback = callback;

        /**
         * @type {ServerListener} The listener
         */
        this.listener = listener;
    }

    onUpdate(criteria, newData) {
        if (this.criteriaTest(criteria)) this.callback(newData, criteria);
    }

    off() {
        this.listener.listeners.splice(this.listener.listeners.indexOf(this), 1);
    }
}
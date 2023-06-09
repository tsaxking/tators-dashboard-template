/**
 * Socket state manager
 */
class SocketStateBuilder {
    /**
     *  Creates a new SocketStateBuilder
     * @param {String} title Title of the state 
     * @param {SocketIOClient.Socket} socket Socket to use
     */
    constructor(title, socket) {
        /**
         * @type {string} Title of the state
         */
        this.title = title;
        /**
         * @type {SocketIOClient.Socket} Socket to use
         */
        this.socket = socket;
        /**
         * @type {Array<event: String, callback: Function>} Listeners to remove on destroy
         */
        this.listeners = [];
    }

    /**
     * 
     * @param {String} event event name 
     * @param {Function} callback callback function
     */
    on(event, callback) {
        this.socket.on(`${this.title}:${event}`, callback);
        this.listeners.push({ event, callback });
    }

    /**
     *  Removes an event listener from the socket
     * @param {String} event event name 
     * @param {Function} callback callback function
     * @returns {Void}
     * 
     * If no event is provided, removes all event listeners
     * If no callback is provided, removes all event listeners with the provided event name
     */
    off(event, callback) {
        if (!event) {
            this.listeners.forEach(l => this.socket.off(`${this.title}:${l.event}`, l.callback));
            this.listeners = [];
            return;
        }
        if (event && typeof event !== 'string') throw new Error('event must be a string, received ' + typeof event);

        if (!callback) {
            this.listeners.filter(l => l.event === event).forEach(l => this.socket.off(`${this.title}:${l.event}`, l.callback));
            this.listeners = this.listeners.filter(l => l.event !== event);
            return;
        }

        if (typeof callback !== 'function') throw new Error('callback must be a function, received ' + typeof callback);

        this.socket.off(`${this.title}:${event}`, callback);
        this.listeners = this.listeners.filter(l => l.event !== event || l.callback !== callback);
    }
}
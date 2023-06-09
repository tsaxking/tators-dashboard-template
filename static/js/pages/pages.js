class Query {
    /**
     * @type {Object} query object
     */
    #query = {};

    /**
     * 
     * @param {String} query URL Query String
     */
    constructor(query) {
        if (query && query.length) this.parse(query);
    }

    /**
     * Parses the search query into this object
     * @param {String} query Parses a search query into an object
     */
    parse(query) {
        if (!query || !query.length) return;
        if (typeof query !== 'string') throw new Error('query must be a string, received ' + typeof query);
        const params = query.replace('?', '').split('&');
        params.forEach(param => {
            const [key, value] = param.split('=');
            this.set(key, value);
        });
    }

    /**
     * @returns {Boolean} Whether or not this query exists
     */
    get exists() {
        return Object.keys(this.#query).length;
    }

    /**
     * 
     * @param {String} key Key of query
     * @returns {String} value of query
     */
    get(key) {
        if (typeof key !== 'string') throw new Error('Key must be a string');
        return this.#query[key];
    }

    /**
     * 
     * @param {String} key Key to set 
     * @param {String} value Value to set
     */
    set(key, value) {
        if (typeof key !== 'string') throw new Error('key must be a string, received ' + typeof key);
        if (typeof value !== 'string') throw new Error('value must be a string, received ' + typeof value);
        this.#query[key] = value;
    }

    /**
     * @param {String} key Key to remove
     */
    remove(key) {
        if (typeof key !== 'string') throw new Error('key must be a string, received ' + typeof key);
        delete this.#query[key];
    }

    /**
     * Deletes all of query
     */
    clear() {
        this.#query = {};
    }

    /**
     * 
     * @returns {String} Builds the query string
     */
    toString() {
        return Object.keys(this.#query).length ? '?' + Object.keys(this.#query).map(key => `${key}=${this.#query[key]}`).join('&') : '';
    }
}

class Page {
    constructor(link, main = async() => {
        console.warn('No main function defined for this page');
        return async() => {
            console.warn('No leave function defined for this page');
        };
    }) {
        if (typeof main === 'function') {
            /**
             * @type {Function} main
             * @returns {Function} leave
             */
            this.main = main;
        } else throw new Error('main must be a function');

        // main must be async
        if (!this.main.constructor.name === 'AsyncFunction') throw new Error('main must be async');

        // set all object properties from link
        Object.keys(link).forEach(key => {
            this[key] = link[key];
        });

        // offcanvas link
        /**
         * @type {HTMLAnchorElement} link
         */
        this.link = document.querySelector(`.nav-link[href="${this.pathname}"]`);

        // sets link click event
        this.link.addEventListener('click', async(e) => {
            e.preventDefault();
            this.load();
        });

        /**
         * @type {HTMLElement} html
         */
        this.html = document.querySelector(`.page#${this.pathname.replace('/', '').replace(new RegExp('/', 'g'), '--')}`);

        this.body = this.html.querySelector('.page-body');

        /**
         * @type {Function} querySelector
         * @param {String} selector
         * @returns {HTMLElement}
         */
        this.querySelector = this.html.querySelector.bind(this.html);

        /**
         * @type {Function} querySelectorAll
         * @param {String} selector
         * @returns {NodeList}
         */
        this.querySelectorAll = this.html.querySelectorAll.bind(this.html);

        /**
         * @type {Function} addEventListener
         * @param {String} type
         * @param {Function} listener
         * @param {Boolean} options
         */
        this.addEventListener = this.html.addEventListener.bind(this.html);

        /**
         * @type {Function} removeEventListener
         * @param {String} type
         * @param {Function} listener
         * @param {Boolean} options
         * @returns {Boolean}
         */
        this.removeEventListener = this.html.removeEventListener.bind(this.html);

        /**
         * @type {Function} dispatchEvent
         * @param {Event} event
         * @returns {Boolean}
         */
        this.dispatchEvent = this.html.dispatchEvent.bind(this.html);

        /**
         * @type {Object} parameters
         * @private
         */
        this.parameters = {};

        this.query = new Query();
    }


    async load(pushState = true) {
        if (currentPage && currentPage.leave) currentPage.leave({
            page: currentPage,
            html: currentPage.html
        });
        this.setInfo(); // sets page info
        this.open(); // opens page and sets link to active
        window.scrollTo(0, 0); // scrolls to top
        navigateTo(
            this.link.href + this.query.toString(),
            pushState,
            false
        ); // adds page to history
        currentPage = this;
        const leave = await this.main(this); // runs main function

        if (typeof leave === 'function') {
            /**
             * @type {Function} function to run when leaving this page
             */
            this.leave = leave;
        } else this.leave = async() => {
            console.warn('No leave function defined for this page');
        }
    }

    setInfo() {
        const { name, keywords, description, screenInfo } = this;

        // sets background color
        if (previousMainColor) document.querySelector('body').classList.remove(`bg-${previousMainColor}`)
        document.querySelector('body').classList.add(`bg-${screenInfo.color}`);
        previousMainColor = screenInfo.color;

        // sets page information
        document.title = 'Team Tators: ' + name;
        document.querySelector('[name="keywords"]').setAttribute('content', keywords.toString());
        document.querySelector('[name="description"]').setAttribute('content', description);
    }

    open() {
        // hide all pages
        document.querySelectorAll('.page').forEach(el => {
            hideElement(el);
        });

        showElement(this.html);

        // deactivate all links
        document.querySelectorAll('.nav-link').forEach(_l => {
            _l.classList.remove('active');
        });

        // activate this link
        this.link.classList.add('active');

        // if mobile, close sidebar
        $('#side-bar-nav').offcanvas('hide');

        // scroll to top
        window.scrollTo(0, 0);
    }


    /**
     * @type {Object} parameters
     * @public
     */
    clearParameters() {
        this.parameters = {};
    }

    /**
     * 
     * @param {String} key 
     * @param {String} value
     * @public 
     */
    setParameter(key, value) {
        if (typeof key !== 'string') throw new Error('key must be a string, received ' + typeof key);
        this.parameters[key] = value;
    }

    fullscreen() {
        if (document.fullscreenElement) {
            throw new Error('Already in fullscreen');
        } else {
            this.html.requestFullscreen();
            hideElement(document.querySelector('#top-navbar'));
            hideElement(document.querySelector('#side-bar-nav'));
            currentPage.html.classList.add('overflow-auto');

            const fsBtn = document.createElement('button');
            fsBtn.classList.add('btn', 'btn-primary', 'btn-lg', 'position-fixed', 'top-0', 'end-0');
            fsBtn.id = 'fullscreen-button';

            fsBtn.innerHTML = `
                Close Fullscreen
            `;
            fsBtn.addEventListener('click', () => {
                Page.exitFullscreen();
            });

            this.html.appendChild(fsBtn);
        }
    }

    static exitFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            showElement(document.querySelector('#top-navbar'));
            showElement(document.querySelector('#side-bar-nav'));

            document.querySelectorAll('.page').forEach(el => {
                el.classList.remove('overflow-auto');
            });

            document.querySelector('#fullscreen-button').remove();
        } else {
            throw new Error('Not in fullscreen');
        }
    }
}

function navigateTo(url, pushState, reload) {
    if (url == location.pathname && !reload) return; // if already on page or reloading, do nothing
    if (pushState) history.pushState({}, '', url); // add page to history
}

window.addEventListener('popstate', (e) => { // when back or forward button is pressed
    e.preventDefault(); // prevent page from reloading
    openPage(location.pathname, false); // open page from history
});

function openPage(url, pushState = true) {
    const page = pageList.find(p => p.pathname == url);
    if (page) page.load(pushState);
}
window.scrollTo(0, 0);

let pageList,
    allPages = {};
let previousMainColor;
document.addEventListener('DOMContentLoaded', async() => {
    const links = await requestFromServer({
        url: '/get-links',
        method: 'POST'
    });

    pageList = links.map(l => {
        const p = new Page(l, mainFunctions[l.name]);
        allPages[p.pathname.replace(new RegExp('/', 'g'), '-').split('-').join('')] = p;
        return p;
    });

    const selectNow = async() => await selectYear.select(new Date().getFullYear(), true);

    const query = new Query(location.search);

    const eventKey = query.get('eventKey');
    if (eventKey) {
        const year = eventKey.slice(0, 4);
        try {
            await selectYear.select(year, true);
            await selectEvent.select(eventKey, true);
        } catch {
            await selectNow();
        }
    } else {
        await selectNow();
    }

    const page = pageList.find(p => p.pathname == location.pathname);

    if (page) {
        page.query.parse(location.search);
        page.load();
    }
    else pageList[0].load();

    try { // if no loading screen, don't do this
        // loading screen
        const loadingScreen = document.querySelector('#loading-page');
        // add animations
        loadingScreen.classList.add('animate__animated');
        loadingScreen.classList.add('animate__fadeOut');

        // remove loading screen after animation
        loadingScreen.addEventListener('animationend', () => {
            loadingScreen.remove();
        });
    } catch {}
});
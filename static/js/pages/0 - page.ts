enum PageEvent {
    OPEN = 'open',
    CLOSE = 'close',
    LOAD = 'load'
}

type SocketListener = {
    event: string;
    fn: Function;
}

class Page {
    static pages: {
        [key: string]: Page;
    } = {};
    private static addPage(page: Page) {
        if (Page.pages[page.name]) 
            return console.error(
                new Error(`Page ${page.name} already exists`));
        Page.pages[page.name] = page;
    }
    static current?: Page;
    static history: Page[] = [];



    el: HTMLElement|null;
    link: HTMLAnchorElement|null;
    sockets: SocketListener[] = [];

    constructor(public readonly name: string) {
        Page.addPage(this);
        this.el = document.querySelector(`#${this.name.toLowerCase().replaceAll(' ', '-')}`);
        this.link = document.querySelector(`a[data-target="#${this.name.toLowerCase().replaceAll(' ', '-')}"]`);

        if (this.link && this.el) {
            this.link.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        }
    }

    open() {
        if (Page.current === this) return;


        for (const listener of this.sockets) {
            socket.on(listener.event, listener.fn);
        }

        socket.emit('page-open', this.name);
        this.link?.classList.add('active');
        this.el?.classList.remove('d-none');
        Page.current?.close();
        Page.current = this;
        Page.history.push(this);

        history.pushState({ page: this.name }, this.name, `/${this.name.toLowerCase().replaceAll(' ', '-')}`);
        window.scrollTo(0, 0);
    }

    close() {
        for (const listener of this.sockets) {
            socket.off(listener.event, listener.fn);
        }

        this.link?.classList.remove('active');
        this.el?.classList.add('d-none');
    }

    async fetch(path: string, body?: any, options?: RequestOptions): Promise<any> {
        if (!path.startsWith('/')) path = `/${path}`;
        return new Promise((res, rej) => {
            ServerRequest.new(`/api/${this.name.toLowerCase()}${path}`, body, options)
                .then(res)
                .catch(rej);
        });
    }

    async stream(path: string, files: FileList, options?: StreamOptions) {
        if (!path.startsWith('/')) path = `/${path}`;
        return fileStream(`/api/${this.name.toLowerCase()}${path}`, files, options);
    }




    on(event: string, fn: Function) {
        this.sockets.push({ event, fn });
    }
} 


window.onpopstate = (e) => {
    e.preventDefault();
    const page = Page.pages[e.state.page];
    if (page) page.open();
    // open first page if no page is found
    else Object.values(Page.pages)[0]?.open();
}

socket.on('page-open', (page: string) => {
    const p = Page.pages[page];
    if (p) p.open();
});
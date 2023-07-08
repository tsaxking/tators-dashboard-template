type RequestOptions = {
    headers?: {
        [key: string]: string;
    };
};



class ServerRequest {
    static readonly all: ServerRequest[] = [];



    static get last(): ServerRequest|undefined {
        return this.all[this.all.length - 1];
    }

    static get errors(): ServerRequest[] {
        return this.all.filter((r) => r.error);
    }

    static get successes(): ServerRequest[] {
        return this.all.filter((r) => !r.error);
    }

    static get averageDuration(): number {
        return this.totalDuration / this.all.length;
    }

    static get totalDuration(): number {
        return this.all.reduce((a, b) => a + (b.duration || 0), 0);
    }

    static get totalErrors(): number {
        return this.errors.length;
    }





    static async new(url: string, body: any, options?: RequestOptions): Promise<any> {
        try {
            JSON.stringify(body);
        } catch {
            throw new Error('Body must be able to be parsed as JSON');
        }

        const r = new ServerRequest(url, body, options);
        return r.send();
    }

    public response?: any;
    public initTime: number = Date.now();
    public error?: Error;
    public sent: boolean = false;
    public duration?: number;

    constructor(
        public readonly url: string,
        public readonly body: any,
        public readonly options?: RequestOptions
    ) {
        ServerRequest.all.push(this);
    }



    async send(): Promise<any> {
        return new Promise((res, rej) => {
            const start = Date.now();
            this.sent = true;
            fetch(this.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.options?.headers
                },
                body: JSON.stringify(this.body)
            })
                .then((r) => r.json())
                .then((data) => {
                    this.duration = Date.now() - start;
                    this.response = data;
                    res(data);
                })
                .catch((e) => {
                    this.duration = Date.now() - start;
                    this.error = new Error(e);
                    rej(e);
                });
        });
    }
}
class CustomRequest {
    constructor({
        url,
        method = 'POST',
        func,
        headers,
        body,
        params,
        noHeaders,
        receive = 'JSON',
        cached = false
    }) {
        this.url = url;
        this.method = method;
        this.func = func;
        this.headers = headers;
        this.body = body;
        this.params = params;
        this.noHeaders = noHeaders;
        this.receive = receive;
        this.cached = cached;

        this.requestStart = Date.now();
        this.originalUrl = url;
        if (!url) {
            console.error('Error: No URL provided, no request sent');
            return;
        }

        if ((method.toUpperCase() == "GET" || method.toUpperCase() == "HEAD") && body != undefined) {
            console.error('Cannot have body in GET or HEAD request, no request sent');
            return;
        }

        let _headers = {};
        if (body && !noHeaders) _headers = {...headers,
            "Content-Type": "application/json"
        };

        this.headers = _headers;
        this.headers['Accept'] = "application/json";

        // iterates through params and puts them on the urlString as an encodedURI Variable
        if (params) {
            url += '?'
            Object.keys(params).forEach(param => {
                url += encodeURI(`${param}=${params[param]}&`);
            });
            url = url.slice(0, url.length - 1);
        }

        // console.log(`${method} Request: ${url}`);
    }

    async send() {
        const data = await requestFromServer({
            url: this.url,
            method: this.method,
            headers: this.headers,
            body: this.body,
            receive: this.receive,
            cached: this.cached
        });

        if (this.func) {
            if (this.func.constructor.name == 'AsyncFunction') {
                return await this.func(data);
            } else {
                return this.func(data);
            }
        }

        if (data.msg) {
            const n = new CustomNotification(data.title, data.msg, data.color, data.options);
            n.create();
        }

        return data;
    }

    static async sendNew(obj) {
        const request = new CustomRequest(obj);
        return await request.send();
    }
}


let requestTimes = [],
    totalLoadTime = 0;
async function requestFromServer({
    url,
    method = 'POST',
    func,
    headers,
    body,
    params,
    noHeaders,
    receive = 'JSON',
    cached = false
}) {
    const requestStart = Date.now();
    const originalUrl = url;
    if (!url) {
        console.error('Error: No URL provided, no request sent');
        return;
    }
    if ((method.toUpperCase() == "GET" || method.toUpperCase() == "HEAD") && body != undefined) {
        console.error('Cannot have body in GET or HEAD request, no request sent');
        return;
    }

    let _headers = {};
    if (body && !noHeaders) _headers = {...headers,
        "Content-Type": "application/json"
    };
    headers = _headers
    headers['Accept'] = "application/json";

    // iterates through params and puts them on the urlString as an encodedURI Variable
    if (params) {
        url += '?'
        Object.keys(params).forEach(param => {
            url += encodeURI(`${param}=${params[param]}&`);
        });
        url = url.slice(0, url.length - 1);
    }
    // console.log(`${method} Request: ${url}`);
    let options = {
        method: method.toUpperCase(),
        body: JSON.stringify({
            ...body,
            date: requestStart
        }),
        headers: headers
    }

    let prevRequest = requestTimes.find(r => {
        let _params = true;
        if (r.params) {
            _params = JSON.stringify(r.params) == JSON.stringify(params);
        }
        let _body = true;
        if (r.body) {
            _body = JSON.stringify(r.body) == JSON.stringify(body);
        }
        return (r.url == url && r.method == method && _body && _params);
    });

    if (prevRequest && cached) {
        console.log(`Request found in cache, returning cached response`);
        return prevRequest.response;
    }



    return fetch(url, options).then(res => {
        if (receive == 'JSON') return res.json();
        if (receive == 'TEXT') return res.text();
        if (receive == 'BLOB') return res.blob();
    }).then(async(data) => {
        // console.log(data);

        if (data.status == 'epic-failure') return;

        // Creates notification
        const { status, title, msg, url, wait, clearCart, notificationLength, permanent } = data;
        if (msg) {
            createNotification(title, msg, status, {
                length: notificationLength,
                permanent
            });
        }

        if (url) setTimeout(() => {
            location.pathname = url;
        }, wait ? wait * 1000 : 0);

        if (func) {
            if (func.constructor.name == 'AsyncFunction') await func(data);
            else func(data);
        }
        if (clearCart) window.localStorage.removeItem('cart'); // specific to my code
        const requestEnd = Date.now();
        const requestDelta = requestEnd - requestStart;
        // console.log(`Time for ${method} - ${originalUrl}: ${requestDelta}`);
        totalLoadTime += requestDelta;
        // console.log(`Total Load Time: ${totalLoadTime}`);
        requestTimes.push({
            url: originalUrl,
            start: requestStart,
            end: requestEnd,
            delta: requestDelta,
            totalTime: totalLoadTime,
            body,
            params,
            response: data
        });
        return data;
    });
}

async function multiRequest(...requests) {
    return await Promise.all(requests.map(requestFromServer));
}
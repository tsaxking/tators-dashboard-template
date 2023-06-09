




import express, { NextFunction } from 'express';
import { Server } from 'socket.io';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import ObjectsToCsv from 'objects-to-csv';
import { getClientIp } from 'request-ip';
import { Session } from './server-functions/structure/sessions';
import builder from './server-functions/page-builder';
import { emailValidation } from './server-functions/middleware/spam-detection';
import { Worker, isMainThread, workerData, parentPort } from 'worker_threads';

require('dotenv').config();
const { PORT, DOMAIN } = process.env;

const [,, env, ...args] = workerData?.args || process.argv;


const app = express();

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('a user connected');
    const s = Session.addSocket(socket);
    if (!s) return;
    // your socket code here

    // ▄▀▀ ▄▀▄ ▄▀▀ █▄▀ ██▀ ▀█▀ ▄▀▀ 
    // ▄█▀ ▀▄▀ ▀▄▄ █ █ █▄▄  █  ▄█▀ 





























    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use('/static', express.static(path.resolve(__dirname, './static')));
app.use('/uploads', express.static(path.resolve(__dirname, './uploads')));

type ExtendedRequest = Request & { io: Server, start: number, ip?: string|null, session: Session };

app.use((req, res, next) => {
    (req as unknown as ExtendedRequest).io = io;
    (req as unknown as ExtendedRequest).start = Date.now();
    (req as unknown as ExtendedRequest).ip = getClientIp(req);
    next();
});

function stripHtml(body) {
    let files;

    if (body.files) {
        files = JSON.parse(JSON.stringify(body.files));
        delete body.files;
    }

    let str = JSON.stringify(body);
    str = str.replace(/<[^<>]+>/g, '');

    const obj = JSON.parse(str);
    obj.files = files;

    return obj;
}

// logs body of post request
app.post('/*', (req, res, next) => {
    req.body = stripHtml(req.body);
    next();
});

app.use(Session.middleware as NextFunction);



// production/testing/development middleware


app.use((req, res, next) => {
    switch (env) {
        case 'prod':
            (() => {
                // This code will only run in production


            })();
            break;
        case 'test':
            (() => {
                // this code will only run in testing
                // you could add features like auto-reloading, automatic sign-in, etc.


            })();
            break;
        case 'dev':
            (() => {
                // this code will only run in development
                // you could add features like auto-reloading, automatic sign-in, etc.


            })();
            break;
    }

    next();
});


// spam detection
// app.post('/*', detectSpam(['message', 'name', 'email'], {
//     onSpam: (req, res, next) => {
//         res.json({ error: 'spam' });
//     },
//     onerror: (req, res, next) => {
//         res.json({ error: 'error' });
//     }
// } as Options));

app.post('/*', emailValidation(['email', 'confirmEmail'], {
    onspam: (req, res, next) => {
        res.json({ error: 'spam' });
    },
    onerror: (req, res, next) => {
        res.json({ error: 'error' });
    }
}));





// █▀▄ ██▀ ▄▀▄ █ █ ██▀ ▄▀▀ ▀█▀ ▄▀▀ 
// █▀▄ █▄▄ ▀▄█ ▀▄█ █▄▄ ▄█▀  █  ▄█▀ 

// this can be used to build pages on the fly and send them to the client
// app.use(builder);






































































type Log = {
    date: number,
    duration: number,
    ip?: string|null,
    method: string,
    url: string,
    status: number,
    userAgent?: string,
    body: string,
    params: string,
    query: string
}


let logCache: Log[] = [];

// sends logs to client every 10 seconds
setInterval(() => {
    if (logCache.length) {
        io.to('logs').emit('request-logs', logCache);
        logCache = [];
    }
}, 1000 * 10);

app.use((req, res, next) => {
    const csvObj: Log = {
        date: Date.now(),
        duration: Date.now() - (req as unknown as ExtendedRequest).start,
        ip: (req as unknown as ExtendedRequest).session.ip,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        userAgent: req.headers['user-agent'],
        body: req.method == 'post' ? JSON.stringify((() => {
            let { body } = req;
            body = JSON.parse(JSON.stringify(body));
            delete body.password;
            delete body.confirmPassword;
            delete body.files;
            return body;
        })()) : '',
        params: JSON.stringify(req.params),
        query: JSON.stringify(req.query)
    };

    logCache.push(csvObj);

    new ObjectsToCsv([csvObj]).toDisk('./logs.csv', { append: true });
});



const clearLogs = () => {
    fs.writeFileSync('./logs.csv', '');
    logCache = [];
}

const timeTo12AM = 1000 * 60 * 60 * 24 - Date.now() % (1000 * 60 * 60 * 24);
console.log('Clearing logs in', timeTo12AM / 1000 / 60, 'minutes');
setTimeout(() => {
    clearLogs();
    setInterval(clearLogs, 1000 * 60 * 60 * 24);
}, timeTo12AM);


server.listen(PORT, () => {
    console.log('------------------------------------------------');
    console.log(`Listening on port \x1b[35m${DOMAIN}...\x1b[0m`);
});

parentPort?.on('message', (msg) => {
    switch(msg) {
        case 'clear-logs':
            clearLogs();
            break;
        case 'stop':
            console.log('Closing server...');
            process.exit(0);
            break;
    }
});
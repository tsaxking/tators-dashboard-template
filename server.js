"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http = __importStar(require("http"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const objects_to_csv_1 = __importDefault(require("objects-to-csv"));
const request_ip_1 = require("request-ip");
const sessions_1 = require("./server-functions/structure/sessions");
const spam_detection_1 = require("./server-functions/middleware/spam-detection");
const worker_threads_1 = require("worker_threads");
require('dotenv').config();
const { PORT, DOMAIN } = process.env;
const [, , env, ...args] = worker_threads_1.workerData?.args || process.argv;
const app = (0, express_1.default)();
const server = http.createServer(app);
const io = new socket_io_1.Server(server);
io.on('connection', (socket) => {
    console.log('a user connected');
    const s = sessions_1.Session.addSocket(socket);
    if (!s)
        return;
    // your socket code here
    // ▄▀▀ ▄▀▄ ▄▀▀ █▄▀ ██▀ ▀█▀ ▄▀▀ 
    // ▄█▀ ▀▄▀ ▀▄▄ █ █ █▄▄  █  ▄█▀ 
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json({ limit: '50mb' }));
app.use('/static', express_1.default.static(path.resolve(__dirname, './static')));
app.use('/uploads', express_1.default.static(path.resolve(__dirname, './uploads')));
app.use((req, res, next) => {
    req.io = io;
    req.start = Date.now();
    req.ip = (0, request_ip_1.getClientIp)(req);
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
app.use(sessions_1.Session.middleware);
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
app.post('/*', (0, spam_detection_1.emailValidation)(['email', 'confirmEmail'], {
    onspam: (req, res, next) => {
        res.json({ error: 'spam' });
    },
    onerror: (req, res, next) => {
        res.json({ error: 'error' });
    }
}));
let logCache = [];
// sends logs to client every 10 seconds
setInterval(() => {
    if (logCache.length) {
        io.to('logs').emit('request-logs', logCache);
        logCache = [];
    }
}, 1000 * 10);
app.use((req, res, next) => {
    const csvObj = {
        date: Date.now(),
        duration: Date.now() - req.start,
        ip: req.session.ip,
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
    new objects_to_csv_1.default([csvObj]).toDisk('./logs.csv', { append: true });
});
const clearLogs = () => {
    fs.writeFileSync('./logs.csv', '');
    logCache = [];
};
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
worker_threads_1.parentPort?.on('message', (msg) => {
    switch (msg) {
        case 'clear-logs':
            clearLogs();
            break;
        case 'stop':
            console.log('Closing server...');
            process.exit(0);
            break;
    }
});

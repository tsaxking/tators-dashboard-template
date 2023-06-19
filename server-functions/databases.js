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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAIN = exports.DB = void 0;
const sqlite3 = __importStar(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const files_1 = require("./files");
var QueryType;
(function (QueryType) {
    QueryType["exec"] = "exec";
    QueryType["get"] = "get";
    QueryType["all"] = "all";
    QueryType["each"] = "each";
    QueryType["run"] = "run";
})(QueryType || (QueryType = {}));
class Query {
    type;
    query;
    params;
    resolve;
    reject;
    constructor(type, query, resolve, reject, params) {
        this.type = type;
        this.query = query;
        this.params = params || [];
        this.resolve = resolve;
        this.reject = reject;
    }
}
class DB {
    filename;
    db;
    queue;
    queueRunning;
    path;
    constructor(filename) {
        this.filename = filename;
        this.queue = [];
        this.queueRunning = false;
        this.path = path.join(__dirname, '..', 'db', './' + filename + '.db');
        if (!fs.existsSync(path.join(__dirname, '..', 'db'))) {
            fs.mkdirSync(path.join(__dirname, '..', 'db'));
        }
        if (!fs.existsSync(this.path)) {
            fs.writeFileSync(this.path, '');
        }
        this.init();
    }
    async init() {
        if (this.db)
            return;
        this.db = await (0, sqlite_1.open)({
            filename: this.path,
            driver: sqlite3.Database
        });
    }
    async runQueue(query) {
        this.queue.push(query);
        if (this.queueRunning)
            return;
        this.queueRunning = true;
        while (this.queue.length > 0) {
            const query = this.queue[0];
            if (!query)
                continue;
            try {
                const d = await this.runQuery(query);
                query.resolve(d);
            }
            catch (err) {
                query.reject(err);
            }
            this.queue.shift();
        }
        this.queueRunning = false;
    }
    async runQuery(query) {
        await this.init();
        let data;
        switch (query.type) {
            case QueryType.exec:
                data = await this.db?.exec(query.query, query.params);
                break;
            case QueryType.get:
                data = await this.db?.get(query.query, query.params);
                break;
            case QueryType.all:
                data = await this.db?.all(query.query, query.params);
                break;
            case QueryType.each:
                data = await this.db?.each(query.query, query.params);
                break;
            case QueryType.run:
                data = await this.db?.run(query.query, query.params);
                break;
        }
        return data;
    }
    async run(query, params) {
        return new Promise((resolve, reject) => {
            this.runQueue(new Query(QueryType.run, query, resolve, reject, params));
        });
    }
    async exec(query, params) {
        return new Promise((resolve, reject) => {
            this.runQueue(new Query(QueryType.exec, query, resolve, reject, params));
        });
    }
    async get(query, params) {
        return new Promise((resolve, reject) => {
            this.runQueue(new Query(QueryType.get, query, resolve, reject, params));
        });
    }
    async all(query, params) {
        return new Promise((resolve, reject) => {
            this.runQueue(new Query(QueryType.all, query, resolve, reject, params));
        });
    }
    async each(query, params) {
        return new Promise((resolve, reject) => {
            this.runQueue(new Query(QueryType.each, query, resolve, reject, params));
        });
    }
    async info() {
        const tableData = await (0, files_1.getJSON)('/tables');
        const query = `
            SELECT name
            FROM sqlite_schema
            WHERE 
                type ='table' AND 
                name NOT LIKE 'sqlite_%';
        `;
        const tables = await exports.MAIN.all(query);
        return Promise.all(tables.map(async ({ name }) => {
            const data = await exports.MAIN.all(`PRAGMA table_info(${name})`);
            return {
                table: name,
                data: tableData[name],
                columns: data.map(d => {
                    return {
                        name: d.name,
                        type: d.type,
                        jsType: tableData[name]?.columns[d.name]?.type,
                        description: tableData[name]?.columns[d.name]?.description,
                        notnull: d.notnull
                    };
                })
            };
        }));
    }
}
exports.DB = DB;
exports.MAIN = new DB('main');

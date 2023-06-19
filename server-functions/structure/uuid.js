"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuid = void 0;
const random_org_1 = __importDefault(require("random-org"));
const databases_1 = require("../databases");
const dotenv_1 = require("dotenv");
const uuid_1 = require("uuid");
(0, dotenv_1.config)();
const getIds = async (n) => {
    const tableQuery = `
        CREATE TABLE IF NOT EXISTS ids (
            id TEXT PRIMARY KEY,
            used INTEGER DEFAULT 0
        )
    `;
    await databases_1.MAIN.run(tableQuery);
    const uuids = new random_org_1.default({
        apiKey: process.env.RANDOM_ORG_API_KEY || ''
    });
    uuids.generateUUIDs({
        n
    }).then(res => {
        getIds(n);
        const { data } = res.random;
        ids = [...ids, ...data];
        const insertQuery = `
            INSERT INTO ids (
                id,
                used
            ) VALUES (
                ?, ?
            )
        `;
        Promise.all(data.map(id => {
            return databases_1.MAIN.run(insertQuery, [id, 0]);
        }));
    })
        .catch(_ => console.log('Quota Filled Today, or other error'));
};
let ids = [];
(async () => {
    const getQuery = `
        SELECT * 
        FROM ids
    `;
    ids = await databases_1.MAIN.all(getQuery) || [];
})();
const getId = () => {
    if (ids.length) {
        const id = ids[0];
        const setUsedQuery = `
            UPDATE ids
            SET used = 1
            WHERE id = ?
        `;
        databases_1.MAIN.run(setUsedQuery, [id]);
        3;
        return id;
    }
    return (0, uuid_1.v4)();
};
const uuid = (options) => {
    // random string, only letters
    let id;
    id = getId();
    if (options?.letters) {
        id = id.replace(/0-9/g, (num) => {
            return String.fromCharCode(parseInt(num) + 65);
        });
    }
    if (options?.length) {
        if (options.length < 1)
            throw new Error('Length must be greater than 0');
        if (options.length > 32)
            throw new Error('Length must be less than 32');
        while (id.length < options.length) {
            const i = getId();
            id += i;
        }
        id = id.slice(0, options.length);
    }
    return id;
};
exports.uuid = uuid;

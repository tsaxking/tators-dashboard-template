"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestFromTBA = void 0;
const databases_1 = require("../databases");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = require("dotenv");
const event_1 = require("./FIRST/event");
(0, dotenv_1.config)();
const { TBA_KEY } = process.env;
async function requestFromTBA(pathname, newData = false, update = true) {
    try {
        // if (pathname.includes('--')) return analyzeURL(pathname);
        const hasRequestQuery = `
            SELECT *
            FROM tbaRequests
            WHERE url = ?
        `;
        const hasRequest = await databases_1.MAIN.get(hasRequestQuery, [pathname]);
        if (hasRequest && !newData) {
            // console.log(`Returning stored response: ${pathname}`);
            return JSON.parse(hasRequest.response);
        }
        // console.log(`Requesting from The Blue Alliance: ${pathname}`);
        const { data } = await axios_1.default.get('https://www.thebluealliance.com/api/v3' + pathname, {
            headers: {
                'X-TBA-Auth-Key': TBA_KEY
            }
        }).catch(e => e);
        if (!data) {
            return console.log('Error requesting from TBA (no data)', pathname);
        }
        if (data['Error']) {
            return console.log('Error requesting from TBA: ' + data['Error'], pathname);
        }
        if (hasRequest && update) {
            const updateQuery = `
                UPDATE tbaRequests
                SET response = ?,
                    requestInfo = ?
                WHERE url = ?
            `;
            await databases_1.MAIN.run(updateQuery, [
                JSON.stringify(data),
                JSON.stringify({
                    lastUpdated: Date.now(),
                    update: hasRequest.update
                }),
                pathname
            ]);
        }
        else if (!hasRequest) {
            const insertQuery = `
                INSERT INTO tbaRequests (
                    url,
                    response,
                    requestInfo
                )
                VALUES (
                    ?,?,?
                )
            `;
            await databases_1.MAIN.run(insertQuery, [
                pathname,
                JSON.stringify(data),
                JSON.stringify({
                    lastUpdated: Date.now(),
                    update
                })
            ]);
        }
        return data;
    }
    catch {
        // console.error(e);
    }
}
exports.requestFromTBA = requestFromTBA;
class TBA {
    static async getEvent(eventKey) {
        const e = await requestFromTBA(`/event/${eventKey}`);
        return new event_1.FIRSTEvent(e);
    }
}
exports.default = TBA;

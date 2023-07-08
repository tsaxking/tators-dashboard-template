import { MAIN } from "../databases";
import axios from 'axios';
import { config } from 'dotenv';
import { FIRSTEvent } from "./FIRST/event";

config();

const { TBA_KEY } = process.env;


export async function requestFromTBA(pathname: string, newData: boolean = false, update: boolean = true) {
    try {
        // if (pathname.includes('--')) return analyzeURL(pathname);

        const hasRequestQuery = `
            SELECT *
            FROM tbaRequests
            WHERE url = ?
        `;

        const hasRequest = await MAIN.get(hasRequestQuery, [pathname]);
        if (hasRequest && !newData) {
            // console.log(`Returning stored response: ${pathname}`);
            return JSON.parse(hasRequest.response);
        }
        // console.log(`Requesting from The Blue Alliance: ${pathname}`);

        const { data } = await axios.get(
            'https://www.thebluealliance.com/api/v3' + pathname, {
                headers: {
                    'X-TBA-Auth-Key': TBA_KEY
                }
            }
        ).catch(e => e);

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

            await MAIN.run(updateQuery, [
                JSON.stringify(data),
                JSON.stringify({
                    lastUpdated: Date.now(),
                    update: hasRequest.update
                }),
                pathname
            ]);
        } else if (!hasRequest) {
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

            await MAIN.run(insertQuery, [
                pathname,
                JSON.stringify(data),
                JSON.stringify({
                    lastUpdated: Date.now(),
                    update
                })
            ]);
        }

        return data;
    } catch {
        // console.error(e);
    }
}






export default class TBA {
    static async getEvent(eventKey: string) {
        const e = await requestFromTBA(`/event/${eventKey}`);

        return new FIRSTEvent(e);
    }
    /**
    * 
    * @param {String} eventKey in the format of YYYYkey (2022idbo)
    */
    static async getEventInfo(eventKey: string, newData?: boolean) {
        const [ matches, teams, info ] = await Promise.all([
            requestFromTBA(`/event/${eventKey}/matches`, newData),
            requestFromTBA(`/event/${eventKey}/teams`, newData),
            requestFromTBA(`/event/${eventKey}`, newData),
        ]);

        return {
            matches,
            teams,
            info,
        }
    }

    /**
     * 
     * @param {Number} year
     * @param {Number} teamNumber 
     * @returns {Array} of strings of all of the team's event keys 
     */
    static async getAllEvents(year: number, teamNumber: number, newData?: boolean): Promise<string[]> {
        return await requestFromTBA(`/team/frc${teamNumber}/events/${year}/keys`, newData);
    }
}
import Random from 'random-org';
import { MAIN } from '../databases';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as fsPromises from 'fs/promises';
import * as fs from 'fs';




config();

const {
    ID_GENERATION_KEY,
    ID_GENERATION_LINK
} = process.env;


const getIds = async (n: number = 10): Promise<string[]> => {
    if (ID_GENERATION_KEY && ID_GENERATION_LINK) {
        ids.push(...(await axios.post(ID_GENERATION_LINK + '/uuid', {
            apiKey: ID_GENERATION_KEY,
            n
        })).data as string[]);

        fsPromises.writeFile('./ids.txt', JSON.stringify(ids, null, 2));

        return ids;
    }
    return new Array(Math.round(n)).fill('').map(() => uuidv4());
}

let ids: string[] = [];
(async () => {
    if (fs.existsSync('./ids.txt')) {
        ids = JSON.parse(await fsPromises
            .readFile('./ids.txt', 'utf-8')) as string[];
    } else {
        ids = await getIds(10);
    }
})();


type uuidOptions = {
    letters?: boolean;
    length?: number;
};


const getId = (): string => {
    if (ids.length) {
        const id = ids.shift();
        if (!id) return uuidv4();

        if (ids.length < 5) {
            getIds(10).then((newIds) => {
                ids.push(...newIds);
            });
        }

        return id;
    }

    return uuidv4();
}



/**
 * Returns a unique id
 * @param {uuidOptions} options 
 * @returns {string} unique id
 */
export const uuid = (options?: uuidOptions) => {
    // random string, only letters
    let id: string;
    id = getId();

    if (options?.letters) {
        id = id.replace(/0-9/g, (num) => {
            return String.fromCharCode(parseInt(num) + 65);
        });
    }

    if (options?.length) {
        if (options.length < 1) throw new Error('Length must be greater than 0');
        if (options.length > 32) throw new Error('Length must be less than 32');

        while (id.length < options.length) {
            const i = getId();
            id += i;
        }

        id = id.slice(0, options.length);
    }

    return id;
}

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
exports.serverUpdate = exports.initDB = void 0;
const worker_threads_1 = require("worker_threads");
const databases_1 = require("../server-functions/databases");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const dotenv_1 = require("dotenv");
const typescript_1 = __importDefault(require("typescript"));
(0, dotenv_1.config)();
const start = Date.now();
const args = worker_threads_1.workerData?.args || process.argv.slice(2);
console.log('Update args:', args);
console.log('\x1b[41mThis may take a few seconds, please wait...\x1b[0m');
const runTs = async (filePath) => {
    return new Promise(async (res, rej) => {
        const tsConfig = await getJSON(path.resolve(__dirname, filePath, './tsconfig.json'));
        const program = typescript_1.default.createProgram([filePath], {
            ...tsConfig.compilerOptions,
            noEmitOnError: true
        });
        const emitResult = program.emit();
        const allDiagnostics = typescript_1.default.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
        allDiagnostics.forEach(diagnostic => {
            if (diagnostic.file) {
                const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                const message = typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            }
            else {
                console.log(typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
            }
        });
        const exitCode = emitResult.emitSkipped ? 1 : 0;
        if (exitCode !== 0) {
            console.error(new Error('There was an error compiling the project'));
        }
        res(null);
    });
};
const getJSON = (file) => {
    let p;
    if (file.includes('/') || file.includes('\\')) {
        p = file;
    }
    else
        p = path.resolve(__dirname, '../jsons', file + '.json');
    p = path.resolve(__dirname, p);
    if (!fs.existsSync(p)) {
        return false;
    }
    let content = fs.readFileSync(p, 'utf8');
    // remove all /* */ comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    // remove all // comments
    content = content.replace(/\/\/ .*/g, '');
    try {
        return JSON.parse(content);
    }
    catch (e) {
        console.error('Error parsing JSON file: ' + file, e);
        return false;
    }
};
// make files and folders if they don't exist
const folders = [
    '../history'
];
for (const folder of folders) {
    const p = path.resolve(__dirname, folder);
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p);
    }
}
if (!fs.existsSync(path.resolve(__dirname, '../history/manifest.txt'))) {
    fs.writeFileSync(path.resolve(__dirname, '../history/manifest.txt'), JSON.stringify({
        lastUpdate: Date.now(),
        updates: []
    }, null, 4));
}
async function initDB() {
    console.log('Checking to see if database exists...');
    if (fs.existsSync(path.resolve(__dirname, '../db/main.db'))) {
        return console.log('Database exists! :)');
    }
    console.log('Database does not exist, creating...');
    fs.writeFileSync(path.resolve(__dirname, '../db/main.db'), '');
    const db = new databases_1.DB('main');
    await db.init();
}
exports.initDB = initDB;
var TableStatus;
(function (TableStatus) {
    TableStatus[TableStatus["EXISTS"] = 0] = "EXISTS";
    TableStatus[TableStatus["DOES_NOT_EXIST"] = 1] = "DOES_NOT_EXIST";
    TableStatus[TableStatus["ERROR"] = 2] = "ERROR";
    TableStatus[TableStatus["NO_COLUMNS"] = 3] = "NO_COLUMNS";
    TableStatus[TableStatus["SUCCESS"] = 4] = "SUCCESS";
})(TableStatus || (TableStatus = {}));
async function tableTest() {
    console.log('Checking to see if all tables exist...');
    const tables = getJSON('tables');
    return Promise.all(Object.entries(tables).map(async ([tableName, table]) => {
        const result = await createTable(tableName, table);
        return {
            [tableName]: result
        };
    }));
}
async function createTable(tableName, table) {
    const { columns, rows, description } = table;
    const MAIN = new databases_1.DB('main');
    const makeTableQuery = `
        CREATE TABLE IF NOT EXISTS "${tableName}" (
            rowId INTEGER PRIMARY KEY AUTOINCREMENT,
            ${Object.entries(table.columns).map(([columnName, { init }]) => `"${columnName}" ${init}`).join(',\n')}
        );
    `;
    await MAIN.run(makeTableQuery);
    if (!columns)
        return TableStatus.NO_COLUMNS;
    await Promise.all(Object.entries(columns).map(async ([columnName, { init }]) => {
        const query = `
            SELECT "${columnName} "
            FROM "${tableName}"
        `;
        try {
            await MAIN.all(query);
        }
        catch {
            console.log(`Column ${columnName} does not exist in table ${tableName}, creating column`);
            const query = `
                ALTER TABLE "${tableName}"
                ADD COLUMN "${columnName}" ${init}
            `;
            await MAIN.run(query);
        }
    }));
    if (!rows)
        return TableStatus.SUCCESS;
    await Promise.all(rows.map(async (row) => {
        const primaryKey = Object.keys(columns).find(columnName => columns[columnName].primaryKey);
        if (!primaryKey) {
            console.log(`Table ${tableName} does not have a primary key, cannot insert row`);
            return;
        }
        const query = `
            SELECT ${primaryKey}
            FROM "${tableName}"
            WHERE "${primaryKey}" = ?
        `;
        const result = await MAIN.get(query, [row[primaryKey]]);
        if (result) {
            console.log(`Row with primary key ${row[primaryKey]} already exists in table ${tableName}, checking for updates...`);
            if (!Object.keys(row).every(columnName => row[columnName] === result[columnName])) {
                const deleteQuery = `
                    DELETE FROM "${tableName}"
                    WHERE "${primaryKey}" = ?
                `;
                await MAIN.run(deleteQuery, [row[primaryKey]]);
                const insertQuery = `
                    INSERT INTO "${tableName}" (${Object.keys(row).map(k => `"${k}"`).join(', ')})
                    VALUES (${Object.keys(row).map(() => '?').join(', ')})
                `;
                await MAIN.run(insertQuery, Object.keys(row).map(k => {
                    const { type } = columns[k];
                    if (type === 'json')
                        return JSON.stringify(row[k]);
                    return row[k];
                }));
                return;
            }
        }
        else {
            console.log(`Row with primary key ${row[primaryKey]} does not exist in table ${tableName}, inserting row...`);
            const query = `
                INSERT INTO "${tableName}" (${Object.keys(row).map(k => `"${k}"`).join(', ')})
                VALUES (${Object.keys(row).map(() => '?').join(', ')})
            `;
            await MAIN.run(query, Object.keys(row).map(k => {
                const { type } = columns[k];
                if (type === 'json')
                    return JSON.stringify(row[k]);
                return row[k];
            }));
        }
    }));
    return TableStatus.SUCCESS;
}
async function runUpdates(updates) {
    console.log('Checking for database updates...');
    const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../history/manifest.txt"), 'utf8'));
    const { lastUpdate, updates: doneUpdates } = manifest;
    console.log('Last update:', new Date(lastUpdate).toLocaleString());
    manifest.updates.push(...(await Promise.all(updates.map(async (update) => {
        const { name, description, test, execute } = update;
        const result = await test(new databases_1.DB('main'));
        if (result) {
            console.log(`Running update ${name}...`);
            try {
                await execute(new databases_1.DB('main'));
            }
            catch (e) {
                console.log(`Error running update ${name}:`, e);
                return;
            }
            return {
                name,
                date: Date.now()
            };
        }
    }))).filter(Boolean));
    fs.writeFileSync(path.resolve(__dirname, "../history/manifest.txt"), JSON.stringify(manifest, null, 4));
}
function makeBackup() {
    console.log('Backing up database...');
    const newDB = path.resolve(__dirname, './history', `${Date.now()}.db`);
    fs.copyFileSync(path.resolve(__dirname, '../database/main.db'), newDB);
}
// cannot use setTimeout because the integer may overflow
const daysTimeout = (cb, days) => {
    const day = 1000 * 60 * 60 * 24;
    let numDays = 0;
    const int = setInterval(() => {
        numDays++;
        if (numDays >= days) {
            cb();
            numDays = 0;
            clearInterval(int);
        }
    }, day);
};
function setBackupIntervals() {
    console.log('Setting backup intervals...');
    const files = fs.readdirSync(path.resolve(__dirname, '../history'));
    for (const file of files) {
        if (file === 'manifest.txt')
            continue;
        const p = path.resolve(__dirname, '../history', file);
        const now = new Date();
        const fileDate = new Date(parseInt(file.replace('.db', '')));
        const diff = now.getTime() - fileDate.getTime();
        const days = Math.floor(7 - (diff / (1000 * 60 * 60 * 24)));
        const deleteFile = () => {
            console.log('Deleting file:', p);
            fs.unlinkSync(p);
        };
        daysTimeout(deleteFile, days);
    }
}
const runFunction = async (fn) => {
    const now = Date.now();
    try {
        await fn();
    }
    catch (e) {
        console.log('Error running function:', fn.name);
        console.error(e);
        return;
    }
    console.log('Finished running function:', fn.name, 'in', Date.now() - now, 'ms');
};
const serverUpdate = async () => {
    try {
        await runTs(path.resolve(__dirname, './updates'));
    }
    catch (e) { }
    const updates = fs.readdirSync(path.resolve(__dirname, './updates')).map(file => {
        if (file.endsWith('.js')) {
            file = file.replace('.js', '');
            console.log('Imported update:', file);
            return require('./tests' + file);
        }
    }).filter(Boolean);
    function updateTests() {
        return runUpdates(updates);
    }
    await runFunction(initDB);
    await runFunction(tableTest);
    await runFunction(updateTests);
    if (args.includes('all') || args.includes('backup')) {
        await runFunction(makeBackup);
    }
    await runFunction(setBackupIntervals);
    return console.log('Finished running server update');
};
exports.serverUpdate = serverUpdate;
if (args.includes('main')) {
    (0, exports.serverUpdate)()
        .then(() => {
        worker_threads_1.parentPort?.postMessage('update-complete');
    })
        .catch(e => {
        console.log('Error running server update:', e);
        worker_threads_1.parentPort?.postMessage('update-error');
    });
}

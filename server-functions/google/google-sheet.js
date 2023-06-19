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
const path = __importStar(require("path"));
const local_auth_1 = require("@google-cloud/local-auth");
const googleapis_1 = require("googleapis");
const fs = __importStar(require("fs"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
];
const TOKEN_PATH = path.resolve(__dirname, '../../jsons/token.json');
const CREDENTIALS_PATH = path.resolve(__dirname, '../../jsons/credentials.json');
async function loadSavedCredentialsIfExist() {
    try {
        const credentials = require(TOKEN_PATH);
        return credentials;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}
async function saveCredentials(client) {
    const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
    const keys = JSON.parse(content);
    if (!keys)
        throw new Error('No keys found in credentials.json');
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFileSync(TOKEN_PATH, payload);
}
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client)
        return client;
    client = await (0, local_auth_1.authenticate)({
        keyfilePath: CREDENTIALS_PATH,
        scopes: SCOPES
    });
    if (client.credentials)
        await saveCredentials(client);
    return client;
}
async function upload(data, sheet) {
    const auth = await authorize();
    const ssid = process.env.SHEET_ID;
    const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.clear({
        spreadsheetId: ssid,
        range: sheet
    });
    console.log('Uploading', data.length, 'rows to', sheet + '...');
    await sheets.spreadsheets.values.update({
        spreadsheetId: ssid,
        range: getSheetDataRange(sheet, data.length, Math.max(...data.map(d => d.length))),
        valueInputOption: 'RAW',
        requestBody: {
            values: data
        }
    });
}
function getSheetDataRange(sheet, rows, cols) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // turn cols into A => Z, AA => ZZ, etc
    let col = '';
    while (cols > 0) {
        col = alphabet[(cols - 1) % alphabet.length] + col;
        cols = Math.floor((cols - 1) / alphabet.length);
    }
    return `${sheet}!A1:${col}${rows}`;
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountStatus = void 0;
const databases_1 = require("../databases");
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("./uuid");
const roles_1 = __importDefault(require("./roles"));
const status_1 = require("./status");
const deep_email_validator_1 = require("deep-email-validator");
const email_1 = require("./email");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["success"] = "success";
    AccountStatus["invalidUsername"] = "invalidUsername";
    AccountStatus["invalidPassword"] = "invalidPassword";
    AccountStatus["invalidEmail"] = "invalidEmail";
    AccountStatus["invalidName"] = "invalidName";
    AccountStatus["usernameTaken"] = "usernameTaken";
    AccountStatus["emailTaken"] = "emailTaken";
    AccountStatus["notFound"] = "notFound";
    AccountStatus["created"] = "created";
    // verification
    AccountStatus["alreadyVerified"] = "alreadyVerified";
    AccountStatus["notVerified"] = "notVerified";
    // login
    AccountStatus["incorrectPassword"] = "incorrectPassword";
    AccountStatus["incorrectUsername"] = "incorrectUsername";
    AccountStatus["incorrectEmail"] = "incorrectEmail";
    // roles
    AccountStatus["hasRole"] = "hasRole";
    AccountStatus["noRole"] = "noRole";
    // password change
    AccountStatus["passwordChangeSuccess"] = "passwordChangeSuccess";
    AccountStatus["passwordChangeInvalid"] = "passwordChangeInvalid";
    AccountStatus["passwordChangeExpired"] = "passwordChangeExpired";
    AccountStatus["passwordChangeUsed"] = "passwordChangeUsed";
})(AccountStatus = exports.AccountStatus || (exports.AccountStatus = {}));
class Account {
    static cachedAccounts = {};
    static async fromRole(role) {
        const query = `
            SELECT * FROM Accounts
            WHERE roles LIKE ?
        `;
        const data = await databases_1.MAIN.all(query, [`%${role}%`]);
        return data.map((a) => new Account(a));
    }
    static async fromUsername(username) {
        if (Account.cachedAccounts[username])
            return Account.cachedAccounts[username];
        const query = `
            SELECT * FROM Accounts
            WHERE username = ?
        `;
        let data = await databases_1.MAIN.get(query, [username]);
        if (!data)
            return null;
        const a = new Account(data);
        Account.cachedAccounts[username] = a;
        return a;
    }
    static async fromEmail(email) {
        // find in cache
        for (const username in Account.cachedAccounts) {
            const account = Account.cachedAccounts[username];
            if (account.email === email)
                return account;
        }
        // find in database
        const query = `
            SELECT * FROM Accounts
            WHERE email = ?
        `;
        let data = await databases_1.MAIN.get(query, [email]);
        if (!data)
            return null;
        const a = new Account(data);
        Account.cachedAccounts[a.username] = a;
        return a;
    }
    static async fromPasswordChangeKey(key) {
        // find in cache
        for (const username in Account.cachedAccounts) {
            const account = Account.cachedAccounts[username];
            if (account.passwordChange === key)
                return account;
        }
        const query = `
            SELECT * FROM Accounts
            WHERE passwordChange = ?
        `;
        let data = await databases_1.MAIN.get(query, [key]);
        if (!data)
            return null;
        const a = new Account(data);
        Account.cachedAccounts[a.username] = a;
        return a;
    }
    static async verifiedAccounts() {
        const query = `
            SELECT * FROM Accounts
            WHERE verified = 1
        `;
        const data = await databases_1.MAIN.all(query);
        return data.map((a) => new Account(a));
    }
    static async unverifiedAccounts() {
        const query = `
            SELECT * FROM Accounts
            WHERE verified = 0
        `;
        const data = await databases_1.MAIN.all(query);
        return data.map((a) => new Account(a));
    }
    static allowPermissions(...permission) {
        const fn = (req, res, next) => {
            const { session } = req;
            const { account } = session;
            if (!account) {
                const s = status_1.Status.from('account.notLoggedIn', req);
                return s.send(res);
            }
            account.getPermissions()
                .then((permissions) => {
                if (permissions.permissions.every((p) => permission.includes(p))) {
                    return next();
                }
                else {
                    const s = status_1.Status.from('permissions.invalid', req);
                    return s.send(res);
                }
            })
                .catch((err) => {
                const s = status_1.Status.from('permissions.error', req, err);
                return s.send(res);
            });
        };
        return fn;
    }
    static allowRoles(...role) {
        const fn = (req, res, next) => {
            const { session } = req;
            const { account } = session;
            if (!account) {
                return status_1.Status.from('account.notLoggedIn', req).send(res);
            }
            const { roles } = account;
            if (role.every(r => roles.includes(r))) {
                return next();
            }
            else {
                const s = status_1.Status.from('roles.invalid', req);
                return s.send(res);
            }
        };
        return fn;
    }
    static async all() {
        const query = `
            SELECT * FROM Accounts
        `;
        const data = await databases_1.MAIN.all(query);
        return data.map((a) => new Account(a));
    }
    // █▄ ▄█ ▄▀▄ █▄ █ ▄▀▄ ▄▀  █ █▄ █ ▄▀     ▄▀▄ ▄▀▀ ▄▀▀ ▄▀▄ █ █ █▄ █ ▀█▀ ▄▀▀ 
    // █ ▀ █ █▀█ █ ▀█ █▀█ ▀▄█ █ █ ▀█ ▀▄█    █▀█ ▀▄▄ ▀▄▄ ▀▄▀ ▀▄█ █ ▀█  █  ▄█▀ 
    static newHash(password) {
        const salt = crypto_1.default
            .randomBytes(32)
            .toString('hex');
        const key = Account.hash(password, salt);
        return { salt, key };
    }
    static hash(password, salt) {
        return crypto_1.default
            .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
            .toString('hex');
    }
    static valid(str) {
        const allowedCharacters = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
            'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
            'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            '_', '-', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
            '+', '=', '{', '}', '[', ']', ':', ';', '"', "'", '<', '>',
            '?', '/', '|', ',', '.', '~', '`'
        ];
        return str
            .toLowerCase()
            .split('')
            .every(char => allowedCharacters.includes(char));
    }
    static async create(username, password, email, name) {
        if (await Account.fromUsername(username))
            return AccountStatus.usernameTaken;
        if (await Account.fromEmail(email))
            return AccountStatus.emailTaken;
        const { valid } = Account;
        if (!valid(username))
            return AccountStatus.invalidUsername;
        if (!valid(password))
            return AccountStatus.invalidPassword;
        if (!valid(email))
            return AccountStatus.invalidEmail;
        if (!valid(name))
            return AccountStatus.invalidName;
        const emailValid = await (0, deep_email_validator_1.validate)({ email })
            .then((results) => !!results.valid)
            .catch(() => false);
        if (!emailValid)
            return AccountStatus.invalidEmail;
        const { salt, key } = Account.newHash(password);
        const query = `
            INSERT INTO Accounts (
                username,
                key,
                salt,
                info,
                roles,
                name,
                email,
                verified
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?
            )
        `;
        await databases_1.MAIN.run(query, [
            username,
            key,
            salt,
            JSON.stringify({}),
            JSON.stringify([]),
            name,
            email,
            0
        ]);
        return AccountStatus.created;
    }
    static async verify(username) {
        const account = await Account.fromUsername(username);
        if (!account)
            return AccountStatus.notFound;
        return account.verify();
    }
    static async unVerify(username) {
        const account = await Account.fromUsername(username);
        if (!account)
            return AccountStatus.notFound;
        return account.unVerify();
    }
    // static async reject(username: string): Promise<AccountStatus> {}
    static async delete(username) {
        const account = await Account.fromUsername(username);
        if (!account)
            return AccountStatus.notFound;
        const query = `
            DELETE FROM Accounts
            WHERE username = ?
        `;
        await databases_1.MAIN.run(query, [username]);
        return AccountStatus.success;
    }
    static async addRole(username, ...role) {
        const account = await Account.fromUsername(username);
        if (!account)
            return AccountStatus.invalidUsername;
        return account.addRole(...role);
    }
    static async removeRole(username, ...role) {
        const account = await Account.fromUsername(username);
        if (!account)
            return AccountStatus.invalidUsername;
        return account.removeRole(...role);
    }
    username;
    key;
    salt;
    info;
    roles;
    name;
    email;
    verified;
    passwordChange;
    tatorBucks;
    discordLink;
    constructor(obj) {
        this.username = obj.username;
        this.key = obj.key;
        this.salt = obj.salt;
        this.info = JSON.parse(obj.info);
        this.roles = JSON.parse(obj.roles);
        this.name = obj.name;
        this.email = obj.email;
        this.verified = !!obj.verified;
        this.passwordChange = obj.passwordChange;
        this.tatorBucks = obj.tatorBucks;
        this.discordLink = JSON.parse(obj.discordLink);
    }
    get safe() {
        return {
            username: this.username,
            name: this.name,
            email: this.email,
            verified: this.verified,
            tatorBucks: this.tatorBucks,
            discordLink: this.discordLink
        };
    }
    async addRole(...role) {
        const query = `
            UPDATE Accounts
            SET roles = ?
            WHERE username = ?
        `;
        this.roles.push(...role);
        this.roles = this.roles.filter((r, i) => this.roles.indexOf(r) === i); // Remove duplicates
        await databases_1.MAIN.run(query, [JSON.stringify(this.roles), this.username]);
        return AccountStatus.success;
    }
    async removeRole(...role) {
        const query = `
            UPDATE Accounts
            SET roles = ?
            WHERE username = ?
        `;
        this.roles = this.roles.filter(r => !role.includes(r));
        await databases_1.MAIN.run(query, [JSON.stringify(this.roles), this.username]);
        return AccountStatus.success;
    }
    async verify() {
        if (this.verified)
            return AccountStatus.alreadyVerified;
        const query = `
            UPDATE Accounts
            SET verified = ?
            WHERE username = ?
        `;
        await databases_1.MAIN.run(query, [1, this.username]);
        const e = new email_1.Email(this.email, 'Account Verified', email_1.EmailType.link, {
            constructor: {
                title: 'Account Verified',
                message: 'Please click the link below to go to the login page',
                link: `${process.env.DOMAIN}/account/sign-in`,
                linkText: 'Sign In'
            }
        });
        this.verified = true;
        return AccountStatus.success;
    }
    async unVerify() {
        if (!this.verified)
            return AccountStatus.notVerified;
        const query = `
            UPDATE Accounts
            SET verified = ?
            WHERE username = ?
        `;
        await databases_1.MAIN.run(query, [0, this.username]);
        this.verified = false;
        return AccountStatus.success;
    }
    testPassword(password) {
        const hash = Account.hash(password, this.salt);
        return hash === this.key;
    }
    async requestPasswordChange() {
        const key = (0, uuid_1.uuid)();
        this.passwordChange = key;
        const query = `
            UPDATE Accounts
            SET passwordChange = ?
            WHERE username = ?
        `;
        await databases_1.MAIN.run(query, [key, this.username]);
        return key;
    }
    async changePassword(key, password) {
        if (key !== this.passwordChange)
            return AccountStatus.passwordChangeInvalid;
        const { salt, key: newKey } = Account.newHash(password);
        const query = `
            UPDATE Accounts
            SET key = ?, salt = ?, passwordChange = ?
            WHERE username = ?
        `;
        await databases_1.MAIN.run(query, [newKey, salt, null, this.username]);
        this.key = newKey;
        this.salt = salt;
        this.passwordChange = null;
        return AccountStatus.success;
    }
    async getPermissions() {
        const roles = await Promise.all(this.roles.map(r => roles_1.default.fromName(r)));
        let perms = roles.reduce((acc, role) => {
            acc.permissions.push(...role.permissions);
            acc.rank = Math.min(acc.rank, role.rank);
            return acc;
        }, {
            permissions: [],
            rank: Infinity
        });
        perms.permissions = perms.permissions
            .filter((p, i) => perms.permissions.indexOf(p) === i); // Remove duplicates
        return perms;
    }
}
exports.default = Account;
;

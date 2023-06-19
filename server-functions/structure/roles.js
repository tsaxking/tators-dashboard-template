"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databases_1 = require("../databases");
class Role {
    static async fromName(name) {
        const getQuery = `
            SELECT * 
            FROM roles
            WHERE name = ?
        `;
        const data = await databases_1.MAIN.get(getQuery, [name]);
        return new Role(data);
    }
    static async all() {
        const getQuery = `
            SELECT * 
            FROM roles
        `;
        const data = await databases_1.MAIN.all(getQuery);
        return data.map(d => new Role(d)).sort((a, b) => a.rank - b.rank);
    }
    name;
    permissions;
    description;
    rank;
    constructor(role) {
        this.name = role.name;
        this.permissions = JSON.parse(role.permissions);
        this.description = role.description;
        this.rank = role.rank;
    }
}
exports.default = Role;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conn = void 0;
exports.queryRows = queryRows;
exports.execute = execute;
const client_1 = require("@libsql/client");
const compat_1 = require("@tursodatabase/serverless/compat");
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
    throw new Error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your environment");
}
exports.conn = url.startsWith("libsql://")
    ? (0, client_1.createClient)({ url, authToken })
    : url.startsWith("turso://")
        ? (0, compat_1.createClient)({ url, authToken })
        : (() => { throw new Error("TURSO_DATABASE_URL must start with libsql:// or turso://"); })();
async function queryRows(sql, args = []) {
    const result = await exports.conn.execute({ sql, args });
    return result.rows;
}
function execute(sql, args = []) {
    return exports.conn.execute({ sql, args });
}
//# sourceMappingURL=dbconnect.js.map
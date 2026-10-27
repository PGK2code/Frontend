"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const dbconnect_1 = require("../dbconnect");
async function initializeDatabase() {
    const schemaPath = (0, node_path_1.resolve)(__dirname, "../../sql/schema.sql");
    const schema = await (0, promises_1.readFile)(schemaPath, "utf8");
    await dbconnect_1.conn.executeMultiple(schema);
    const result = await dbconnect_1.conn.execute("SELECT (SELECT COUNT(*) FROM customers) AS customers, (SELECT COUNT(*) FROM foods) AS foods");
    console.log("Turso schema initialized:", result.rows[0]);
    dbconnect_1.conn.close();
}
void initializeDatabase().catch(error => {
    console.error("Could not initialize the Turso schema.", error);
    dbconnect_1.conn.close();
    process.exitCode = 1;
});
//# sourceMappingURL=init-db.js.map
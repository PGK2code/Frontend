"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const dbconnect_1 = require("./dbconnect");
const port = Number(process.env.PORT || 3000);
async function start() {
    await dbconnect_1.conn.execute("SELECT 1");
    http_1.default.createServer(app_1.app).listen(port, "0.0.0.0", () => {
        console.log(`Lunch Delivery API is listening on port ${port}`);
    });
}
void start().catch(error => {
    console.error("Could not connect to Turso. Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.", error);
    process.exitCode = 1;
});
//# sourceMappingURL=server.js.map
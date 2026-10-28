"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const dbconnect_1 = require("../dbconnect");
exports.router = express_1.default.Router();
exports.router.get("/", async (_req, res) => {
    try {
        const rows = await (0, dbconnect_1.queryRows)("SELECT food_id, name, price FROM foods ORDER BY food_id");
        res.json(rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database operation failed" });
    }
});
//# sourceMappingURL=foods.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const customers_1 = require("./controller/customers");
const orders_1 = require("./controller/orders");
const foods_1 = require("./controller/foods");
const works_1 = require("./controller/works");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.get("/", (_req, res) => {
    res.json({ name: "Lunch Delivery API", status: "ok", endpoints: ["/customers", "/orders", "/foods", "/works"] });
});
exports.app.use("/customers", customers_1.router);
exports.app.use("/orders", orders_1.router);
exports.app.use("/foods", foods_1.router);
exports.app.use("/works", works_1.router);
exports.app.use((_req, res) => res.status(404).json({ error: "Endpoint not found" }));
exports.app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const platform_browser_1 = require("@angular/platform-browser");
const router_1 = require("@angular/router");
const http_1 = require("@angular/common/http");
const app_1 = require("./app/app");
const app_routes_1 = require("./app/app.routes");
(0, platform_browser_1.bootstrapApplication)(app_1.App, {
    providers: [(0, router_1.provideRouter)(app_routes_1.routes), (0, http_1.provideHttpClient)()],
}).catch(console.error);
//# sourceMappingURL=main.js.map
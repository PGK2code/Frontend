"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
const api_1 = require("./services/api");
@(0, core_1.Component)({
    selector: 'app-root',
    imports: [router_1.RouterOutlet, router_1.RouterLink, router_1.RouterLinkActive],
    templateUrl: './app.html',
})
class App {
    api = (0, core_1.inject)(api_1.ApiService);
}
exports.App = App;
//# sourceMappingURL=app.js.map
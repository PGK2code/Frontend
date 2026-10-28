"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardPage = void 0;
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
const router_1 = require("@angular/router");
const api_1 = require("../../services/api");
@(0, core_1.Component)({
    selector: 'app-dashboard',
    imports: [common_1.CommonModule, router_1.RouterLink],
    templateUrl: './dashboard.html',
})
class DashboardPage {
    api = (0, core_1.inject)(api_1.ApiService);
    customers = (0, core_1.signal)([]);
    foods = (0, core_1.signal)([]);
    orders = (0, core_1.signal)([]);
    error = (0, core_1.signal)('');
    boxCount() {
        return this.orders().reduce((sum, item) => sum + item.total_boxes, 0);
    }
    sales() {
        return this.orders().reduce((sum, item) => sum + item.total_sales, 0);
    }
    constructor() {
        void this.load();
    }
    async load() {
        try {
            const [c, f, o] = await Promise.all([this.api.customers(), this.api.foods(), this.api.orders()]);
            this.customers.set(c);
            this.foods.set(f);
            this.orders.set(o);
            this.error.set('');
        }
        catch (e) {
            this.error.set(e.message);
        }
    }
}
exports.DashboardPage = DashboardPage;
//# sourceMappingURL=dashboard.js.map
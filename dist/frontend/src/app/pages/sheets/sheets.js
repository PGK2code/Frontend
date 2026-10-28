"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sheets = void 0;
const common_1 = require("@angular/common");
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
const api_1 = require("../../services/api");
const delivery_planning_1 = require("../../services/delivery-planning");
@(0, core_1.Component)({
    selector: 'app-sheets',
    imports: [common_1.CommonModule, router_1.RouterLink],
    templateUrl: './sheets.html',
})
class Sheets {
    api = (0, core_1.inject)(api_1.ApiService);
    planner = (0, core_1.inject)(delivery_planning_1.DeliveryPlanningService);
    loading = (0, core_1.signal)(false);
    error = (0, core_1.signal)('');
    constructor() {
        void this.load();
    }
    async load() {
        this.loading.set(true);
        this.error.set('');
        try {
            this.planner.setOrders(await this.api.deliveryOrders());
        }
        catch (error) {
            this.error.set(error.message);
        }
        finally {
            this.loading.set(false);
        }
    }
    print() {
        window.print();
    }
}
exports.Sheets = Sheets;
//# sourceMappingURL=sheets.js.map
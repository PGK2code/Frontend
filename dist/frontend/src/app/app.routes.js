"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const dashboard_1 = require("./pages/dashboard/dashboard");
const customers_1 = require("./pages/customers/customers");
const orders_1 = require("./pages/orders/orders");
const routes_1 = require("./pages/routes/routes");
const sheets_1 = require("./pages/sheets/sheets");
exports.routes = [
    { path: '', component: dashboard_1.DashboardPage, title: 'ภาพรวม | ครัวเก้าแว่น' },
    {
        path: 'customers',
        component: customers_1.CustomersPage,
        title: 'ลูกค้า | ครัวเก้าแว่น',
    },
    { path: 'orders', component: orders_1.OrdersPage, title: 'ออเดอร์ | ครัวเก้าแว่น' },
    { path: 'sheets', component: sheets_1.Sheets, title: 'ตารางงาน | ครัวเก้าแว่น' },
    { path: 'routes', component: routes_1.RoutesPage, title: 'เส้นทางจัดส่ง | ครัวเก้าแว่น' },
    { path: '**', redirectTo: '' },
];
//# sourceMappingURL=app.routes.js.map
import { Customer, Food, Order } from '../../models/types';
export declare class DashboardPage {
    private api;
    customers: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<Customer[]>;
    foods: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<Food[]>;
    orders: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<Order[]>;
    error: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<string>;
    boxCount(): number;
    sales(): number;
    constructor();
    load(): Promise<void>;
}
//# sourceMappingURL=dashboard.d.ts.map
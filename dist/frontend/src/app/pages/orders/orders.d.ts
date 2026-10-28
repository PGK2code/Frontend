import { Customer, Food, Order } from '../../models/types';
export declare class OrdersPage {
    private api;
    orders: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<Order[]>;
    customers: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<Customer[]>;
    foods: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<Food[]>;
    notice: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<string>;
    isError: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<boolean>;
    busy: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<boolean>;
    creating: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<boolean>;
    customerId: number | null;
    foodId: number | null;
    quantity: number;
    constructor();
    load(): Promise<void>;
    loadOptions(): Promise<void>;
    queuedCount(): number;
    boxCount(): number;
    sales(): number;
    statusLabel(status: string): "รอจัดส่ง" | "จำลอง" | "จัดส่งแล้ว" | "ยกเลิก" | "รับจัดส่งแล้ว";
    selectedPrice(): number;
    openCreate(): void;
    closeCreate(): void;
    create(): Promise<void>;
    change(order: Order, item: Order['items'][number], step: number): Promise<void>;
    remove(order: Order): Promise<void>;
    simulate(): Promise<void>;
    clearSimulated(): Promise<void>;
    showError(message: string): void;
    showSuccess(message: string): void;
}
//# sourceMappingURL=orders.d.ts.map
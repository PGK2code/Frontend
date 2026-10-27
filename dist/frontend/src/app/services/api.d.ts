import { HttpClient } from '@angular/common/http';
import { Customer, Food, Order } from '../models/types';
export declare class ApiService {
    private http;
    readonly base: string;
    readonly online: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<boolean>;
    constructor(http: HttpClient);
    private request;
    customers(): Promise<Customer[]>;
    foods(): Promise<Food[]>;
    orders(): Promise<Order[]>;
    deliveryOrders(): Promise<{
        address: string | null;
        order_id: number;
        customer_id: number;
        customer_name: string;
        phone_number: string;
        latitude: number;
        longitude: number;
        order_date: string;
        total_boxes: number;
        delivery_queue: number | null;
        status: string;
        total_sales: number;
        items: import("../models/types").OrderItem[];
    }[]>;
    saveCustomer(data: Omit<Customer, 'customer_id'>, id?: number): Promise<{
        customer_id: number;
    }>;
    deleteCustomer(id: number): Promise<{
        message: string;
    }>;
    createOrder(customer_id: number, food_id: number, quantity: number): Promise<{
        order_id: number;
    }>;
    updateQuantity(id: number, food_id: number, quantity: number): Promise<unknown>;
    deleteOrder(id: number): Promise<unknown>;
    simulate(count: number): Promise<{
        created_count: number;
    }>;
    clearSimulated(): Promise<{
        deleted_count: number;
    }>;
}
//# sourceMappingURL=api.d.ts.map
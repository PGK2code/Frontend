import { Order } from '../models/types';
export interface RiderRoute {
    riderNumber: number;
    color: string;
    orders: Order[];
    totalBoxes: number;
}
export interface RiderRoadRoute {
    riderNumber: number;
    geometry: Array<[number, number]>;
    distanceKm: number;
    durationMinutes: number;
    error?: string;
}
export interface RiderFinancialSummary {
    revenue: number;
    foodCost: number;
    deliveryCost: number | null;
    profit: number | null;
}
export interface DeliveryPlan {
    routes: RiderRoute[];
    invalidOrders: Order[];
    orderCount: number;
    totalBoxes: number;
}
interface DeliveryDepot {
    depotLatitude: number;
    depotLongitude: number;
}
export declare class DeliveryPlanningService {
    readonly depot: DeliveryDepot;
    readonly orders: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<Order[]>;
    readonly plan: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<DeliveryPlan>;
    readonly roadRoutes: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<RiderRoadRoute[]>;
    private orderSignature;
    private calculationNumber;
    private roadRouteCache;
    private roadRouteRequest;
    setOrders(orders: Order[]): void;
    loadRoadRoutes(): Promise<void>;
    financialSummary(route: RiderRoute): RiderFinancialSummary;
    rebuildPlan(seed?: number): void;
    private fetchRoadRoute;
    private groupOrders;
    private orderStops;
    /**
     * คำนวณใหม่เฉพาะไรเดอร์ที่เลือก โดยไม่เปลี่ยนการแบ่งงานหรือเส้นทางของไรเดอร์คนอื่น
     * ทดลองลำดับจุดส่งทั้งหมด (สูงสุด 6 แบบ เพราะจำกัดไม่เกิน 3 ออเดอร์) แล้วเลือกแผนที่
     * ส่งทันก่อน จากนั้นระยะทางถนนสั้นกว่า
     */
    recalculateRiderRoute(riderNumber: number): Promise<{
        riderNumber: number;
        attempts: number;
        changed: boolean;
        feasible?: never;
        distanceKm?: never;
    } | {
        riderNumber: number;
        attempts: number;
        changed: boolean;
        feasible: boolean;
        distanceKm: number;
    }>;
    /**
     * ทดลองหลายแผนและเก็บแผนที่ดีที่สุดจากระยะทางถนนจริงของ OSRM
     * ลำดับความสำคัญ: ส่งทัน 12:30 ก่อน จากนั้นกำไรสูงสุด และระยะทางรวมต่ำสุด
     */
    recalculateBestPlan(attempts?: number): Promise<{
        feasible: boolean;
        profit: number;
        distanceKm: number;
        attempts: number;
        changed: boolean;
    } | null>;
    private distanceBetween;
}
export {};
//# sourceMappingURL=delivery-planning.d.ts.map
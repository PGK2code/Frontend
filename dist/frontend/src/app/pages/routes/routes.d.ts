import { AfterViewInit, OnDestroy } from '@angular/core';
import { DeliveryPlanningService, RiderRoute } from '../../services/delivery-planning';
declare global {
    interface Window {
        L: any;
    }
}
export declare class RoutesPage implements AfterViewInit, OnDestroy {
    private api;
    private activatedRoute;
    private mapHost;
    private map;
    private routeLayers;
    private routeGeometryCache;
    private mapDrawVersion;
    readonly planner: DeliveryPlanningService;
    loading: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<boolean>;
    error: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<string>;
    mapError: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<string>;
    selectedRider: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<number>;
    mapMode: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<"all" | "selected">;
    constructor();
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    selectedRoute(): RiderRoute | undefined;
    visibleMapRoutes(): RiderRoute[];
    selectRoute(riderNumber: number): void;
    setMapMode(mode: 'all' | 'selected'): void;
    load(): Promise<void>;
    recalculate(): Promise<void>;
    recalculateSelectedRider(): Promise<void>;
    routeFinance(route: RiderRoute): import("../../services/delivery-planning").RiderFinancialSummary;
    routeRoadInfo(route: RiderRoute): import("../../services/delivery-planning").RiderRoadRoute | undefined;
    estimatedMinutes(route: RiderRoute): number | null;
    estimatedArrival(route: RiderRoute): string | null;
    allRoutesMeetDeadline(): boolean;
    allRoadRoutesReady(): boolean;
    overallDistanceKm(): number;
    financeRoutes(): RiderRoute[];
    overallFinance(): {
        revenue: number;
        foodCost: number;
        deliveryCost: number | null;
        profit: number | null;
        totalBoxes: number;
        orderCount: number;
        distanceKm: number | null;
    };
    private drawMap;
    private getRoadGeometry;
}
//# sourceMappingURL=routes.d.ts.map
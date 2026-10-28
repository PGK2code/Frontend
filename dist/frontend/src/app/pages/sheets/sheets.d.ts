import { DeliveryPlanningService } from '../../services/delivery-planning';
export declare class Sheets {
    private api;
    readonly planner: DeliveryPlanningService;
    loading: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<boolean>;
    error: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<string>;
    constructor();
    load(): Promise<void>;
    print(): void;
}
//# sourceMappingURL=sheets.d.ts.map
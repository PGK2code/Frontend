import { AfterViewInit, OnDestroy } from '@angular/core';
import { Customer } from '../../models/types';
declare global {
    interface Window {
        L: any;
    }
}
type CustomerDraft = {
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    latitude: number;
    longitude: number;
};
export declare class CustomersPage implements AfterViewInit, OnDestroy {
    private api;
    private mapHost;
    private map;
    private marker;
    customers: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<Customer[]>;
    query: string;
    editing: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<boolean>;
    editingId: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<number | null>;
    saving: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<boolean>;
    notice: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<string>;
    isError: import("@angular/core", { with: { "resolution-mode": "import" } }).WritableSignal<boolean>;
    draft: CustomerDraft;
    constructor();
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    filtered(): Customer[];
    mapLink(c: Customer): string;
    load(): Promise<void>;
    openCreate(): void;
    openEdit(c: Customer): void;
    close(): void;
    initMap(preserve?: boolean): void;
    setCoordinates(lat: number, lng: number): void;
    syncMarker(): void;
    locate(): void;
    save(): Promise<void>;
    remove(c: Customer): Promise<void>;
    showError(message: string): void;
    showSuccess(message: string): void;
}
export {};
//# sourceMappingURL=customers.d.ts.map
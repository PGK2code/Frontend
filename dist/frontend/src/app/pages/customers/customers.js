"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersPage = void 0;
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
const forms_1 = require("@angular/forms");
const api_1 = require("../../services/api");
const emptyDraft = () => ({
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    latitude: 16.2458,
    longitude: 103.2508,
});
@(0, core_1.Component)({
    selector: 'app-customers',
    imports: [common_1.CommonModule, forms_1.FormsModule],
    templateUrl: './customers.html',
})
class CustomersPage {
    api = (0, core_1.inject)(api_1.ApiService);
    mapHost = (0, core_1.viewChild)('mapHost');
    map;
    marker;
    customers = (0, core_1.signal)([]);
    query = '';
    editing = (0, core_1.signal)(false);
    editingId = (0, core_1.signal)(null);
    saving = (0, core_1.signal)(false);
    notice = (0, core_1.signal)('');
    isError = (0, core_1.signal)(false);
    draft = emptyDraft();
    constructor() {
        void this.load();
    }
    ngAfterViewInit() {
        this.initMap();
    }
    ngOnDestroy() {
        this.map?.remove();
    }
    filtered() {
        const q = this.query.trim().toLocaleLowerCase();
        return this.customers().filter((c) => !q || `${c.first_name} ${c.last_name} ${c.phone_number} ${c.address ?? ''}`.toLocaleLowerCase().includes(q));
    }
    mapLink(c) {
        return `https://www.openstreetmap.org/?mlat=${c.latitude}&mlon=${c.longitude}#map=17/${c.latitude}/${c.longitude}`;
    }
    async load() {
        try {
            this.customers.set(await this.api.customers());
        }
        catch (e) {
            this.showError(e.message);
        }
    }
    openCreate() {
        this.editingId.set(null);
        this.draft = emptyDraft();
        this.notice.set('');
        this.editing.set(true);
        setTimeout(() => this.initMap(), 0);
    }
    openEdit(c) {
        this.editingId.set(c.customer_id);
        this.draft = {
            first_name: c.first_name,
            last_name: c.last_name,
            phone_number: c.phone_number,
            address: c.address ?? '',
            latitude: Number(c.latitude),
            longitude: Number(c.longitude),
        };
        this.notice.set('');
        this.editing.set(true);
        setTimeout(() => this.initMap(true), 0);
    }
    close() {
        this.editing.set(false);
        this.map?.remove();
        this.map = undefined;
        this.marker = undefined;
    }
    initMap(preserve = false) {
        const host = this.mapHost()?.nativeElement;
        if (!this.editing() || !host)
            return;
        const L = window.L;
        if (!L)
            return;
        this.map?.remove();
        const center = preserve ? [this.draft.latitude, this.draft.longitude] : [16.2458, 103.2508];
        this.map = L.map(host).setView(center, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap',
        }).addTo(this.map);
        this.marker = L.marker([this.draft.latitude, this.draft.longitude], {
            draggable: true,
        }).addTo(this.map);
        this.marker.on('dragend', () => this.setCoordinates(this.marker.getLatLng().lat, this.marker.getLatLng().lng));
        this.map.on('click', (e) => {
            this.marker.setLatLng(e.latlng);
            this.setCoordinates(e.latlng.lat, e.latlng.lng);
        });
        setTimeout(() => this.map?.invalidateSize(), 80);
    }
    setCoordinates(lat, lng) {
        this.draft = {
            ...this.draft,
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
        };
    }
    syncMarker() {
        if (!this.map || !this.marker || !Number.isFinite(this.draft.latitude) || !Number.isFinite(this.draft.longitude))
            return;
        this.marker.setLatLng([this.draft.latitude, this.draft.longitude]);
        this.map.panTo([this.draft.latitude, this.draft.longitude]);
    }
    locate() {
        navigator.geolocation?.getCurrentPosition((p) => {
            this.setCoordinates(p.coords.latitude, p.coords.longitude);
            this.map?.setView([p.coords.latitude, p.coords.longitude], 16);
            this.marker?.setLatLng([p.coords.latitude, p.coords.longitude]);
        }, () => this.showError('ไม่สามารถอ่านตำแหน่งได้ กรุณาอนุญาตตำแหน่งหรือปักหมุดบนแผนที่'));
    }
    async save() {
        this.saving.set(true);
        try {
            await this.api.saveCustomer({ ...this.draft, address: this.draft.address.trim() || null }, this.editingId() ?? undefined);
            this.close();
            await this.load();
            this.showSuccess('บันทึกข้อมูลลูกค้าเรียบร้อย');
        }
        catch (e) {
            this.showError(e.message);
        }
        finally {
            this.saving.set(false);
        }
    }
    async remove(c) {
        if (!confirm(`ลบข้อมูล ${c.first_name} ${c.last_name}?`))
            return;
        try {
            await this.api.deleteCustomer(c.customer_id);
            await this.load();
            this.showSuccess('ลบข้อมูลลูกค้าเรียบร้อย');
        }
        catch (e) {
            this.showError(e.message);
        }
    }
    showError(message) {
        this.isError.set(true);
        this.notice.set(message);
    }
    showSuccess(message) {
        this.isError.set(false);
        this.notice.set(message);
    }
}
exports.CustomersPage = CustomersPage;
//# sourceMappingURL=customers.js.map
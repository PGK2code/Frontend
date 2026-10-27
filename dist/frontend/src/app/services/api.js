"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const core_1 = require("@angular/core");
const rxjs_1 = require("rxjs");
const environment_1 = require("../../environments/environment");
@(0, core_1.Injectable)({ providedIn: 'root' })
class ApiService {
    http;
    base = environment_1.environment.apiUrl;
    online = (0, core_1.signal)(false);
    constructor(http) {
        this.http = http;
    }
    async request(method, path, body) {
        try {
            const result = await (0, rxjs_1.firstValueFrom)(this.http.request(method, `${this.base}${path}`, { body }));
            this.online.set(true);
            return result;
        }
        catch (error) {
            this.online.set(false);
            const e = error;
            throw new Error(e.error?.error || e.message || 'เชื่อมต่อ API ไม่สำเร็จ');
        }
    }
    customers() {
        return this.request('GET', '/customers');
    }
    foods() {
        return this.request('GET', '/foods');
    }
    orders() {
        return this.request('GET', '/orders');
    }
    async deliveryOrders() {
        const [orders, customers] = await Promise.all([this.orders(), this.customers()]);
        const customerAddresses = new Map(customers.map((customer) => [customer.customer_id, customer.address]));
        // ส่วนของกอล์ฟ: เติมที่อยู่จากข้อมูลลูกค้า กรณี API ออเดอร์ยังไม่มี address
        return orders.map((order) => ({
            ...order,
            address: order.address?.trim() || customerAddresses.get(order.customer_id) || null,
        }));
    }
    saveCustomer(data, id) {
        return this.request(id ? 'PUT' : 'POST', id ? `/customers/${id}` : '/customers', data);
    }
    deleteCustomer(id) {
        return this.request('DELETE', `/customers/${id}`);
    }
    createOrder(customer_id, food_id, quantity) {
        return this.request('POST', '/orders', {
            customer_id,
            food_id,
            quantity,
        });
    }
    updateQuantity(id, food_id, quantity) {
        return this.request('PUT', `/orders/${id}/quantity`, { food_id, quantity });
    }
    deleteOrder(id) {
        return this.request('DELETE', `/orders/${id}`);
    }
    simulate(count) {
        return this.request('POST', '/orders/simulate', {
            count,
        });
    }
    clearSimulated() {
        return this.request('DELETE', '/orders/simulated');
    }
}
exports.ApiService = ApiService;
//# sourceMappingURL=api.js.map
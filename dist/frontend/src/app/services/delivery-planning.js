"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryPlanningService = void 0;
const core_1 = require("@angular/core");
const ROUTE_COLORS = ['#cf5a4c', '#36886b', '#4779bd', '#a264ae', '#d18a36', '#378c9b', '#bd5a86', '#788d43'];
const MAX_ORDERS_PER_RIDER = 3;
const DEPOT = {
    // พิกัดตั้งต้นโดยประมาณบริเวณมหาวิทยาลัยมหาสารคาม
    // ควรเปลี่ยนเป็นพิกัดร้านจริงก่อนใช้คำนวณค่าส่งจริง
    depotLatitude: 16.245,
    depotLongitude: 103.250,
};
const emptyPlan = () => ({
    routes: [],
    invalidOrders: [],
    orderCount: 0,
    totalBoxes: 0,
});
@(0, core_1.Injectable)({ providedIn: 'root' })
class DeliveryPlanningService {
    depot = DEPOT;
    orders = (0, core_1.signal)([]);
    plan = (0, core_1.signal)(emptyPlan());
    roadRoutes = (0, core_1.signal)([]);
    orderSignature = '';
    calculationNumber = 0;
    roadRouteCache = new Map();
    roadRouteRequest = 0;
    setOrders(orders) {
        const signature = JSON.stringify(orders);
        this.orders.set(orders);
        if (signature !== this.orderSignature) {
            this.orderSignature = signature;
            this.rebuildPlan();
        }
    }
    async loadRoadRoutes() {
        const request = ++this.roadRouteRequest;
        const depot = [this.depot.depotLatitude, this.depot.depotLongitude];
        const routes = this.plan().routes;
        this.roadRoutes.set([]);
        const results = await Promise.all(routes.map(async (route) => {
            try {
                const roadRoute = await this.fetchRoadRoute(route, depot);
                return { riderNumber: route.riderNumber, ...roadRoute };
            }
            catch (error) {
                console.error(`Could not calculate road route for rider ${route.riderNumber}.`, error);
                return {
                    riderNumber: route.riderNumber,
                    geometry: [],
                    distanceKm: 0,
                    durationMinutes: 0,
                    error: error instanceof Error ? error.message : 'Road route calculation failed',
                };
            }
        }));
        if (request === this.roadRouteRequest)
            this.roadRoutes.set(results);
    }
    financialSummary(route) {
        const revenue = route.orders.reduce((sum, order) => sum + Number(order.total_sales || 0), 0);
        const foodCost = route.totalBoxes * 40;
        const roadRoute = this.roadRoutes().find((entry) => entry.riderNumber === route.riderNumber);
        const deliveryCost = roadRoute && !roadRoute.error ? roadRoute.distanceKm * route.totalBoxes * 2 + 15 : null;
        return {
            revenue,
            foodCost,
            deliveryCost,
            profit: deliveryCost === null ? null : revenue - foodCost - deliveryCost,
        };
    }
    rebuildPlan(seed) {
        const planSeed = seed ?? this.calculationNumber++;
        const deliverableOrders = this.orders().filter((order) => order.status === 'queued' || order.status === 'simulated');
        const invalidOrders = deliverableOrders.filter((order) => !Number.isFinite(Number(order.latitude)) ||
            !Number.isFinite(Number(order.longitude)) ||
            Math.abs(Number(order.latitude)) > 90 ||
            Math.abs(Number(order.longitude)) > 180);
        const orders = deliverableOrders.filter((order) => !invalidOrders.includes(order));
        // แบ่งงานให้แต่ละไรเดอร์ไม่เกิน 3 ออเดอร์ แล้วเรียงจุดส่งให้ระยะทางไป-กลับสั้นที่สุด
        // ภายในกลุ่ม (ไม่แยกกลุ่มเพิ่มเพียงเพราะจุดส่งห่างกัน เพราะจะเพิ่มค่าส่งต่อรอบ)
        const groupedOrders = this.groupOrders(orders, orders.length, planSeed);
        const routeGroups = groupedOrders.map((group, index) => this.orderStops(group, DEPOT, planSeed + index));
        const routes = routeGroups.map((orderedStops, index) => {
            const totalBoxes = orderedStops.reduce((sum, order) => sum + order.total_boxes, 0);
            return {
                riderNumber: index + 1,
                color: ROUTE_COLORS[index % ROUTE_COLORS.length] ?? '#cf5a4c',
                orders: orderedStops,
                totalBoxes,
            };
        });
        const totalBoxes = routes.reduce((sum, route) => sum + route.totalBoxes, 0);
        this.plan.set({
            routes,
            invalidOrders,
            orderCount: orders.length,
            totalBoxes,
        });
        this.roadRouteRequest++;
        this.roadRoutes.set([]);
    }
    async fetchRoadRoute(route, depot) {
        const waypoints = [
            depot,
            ...route.orders.map((order) => [Number(order.latitude), Number(order.longitude)]),
            depot,
        ];
        const coordinates = waypoints.filter((point, index) => index === 0 ||
            point[0].toFixed(6) !== waypoints[index - 1]?.[0].toFixed(6) ||
            point[1].toFixed(6) !== waypoints[index - 1]?.[1].toFixed(6));
        if (coordinates.length < 2) {
            return { geometry: coordinates, distanceKm: 0, durationMinutes: 0 };
        }
        const cacheKey = coordinates.map(([latitude, longitude]) => `${latitude.toFixed(6)},${longitude.toFixed(6)}`).join(';');
        const cached = this.roadRouteCache.get(cacheKey);
        if (cached)
            return cached;
        const path = coordinates.map(([latitude, longitude]) => `${longitude},${latitude}`).join(';');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
            const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson&steps=false`, { signal: controller.signal });
            if (!response.ok)
                throw new Error(`OSRM returned HTTP ${response.status}`);
            const result = (await response.json());
            const roadRoute = result.routes?.[0];
            const routeCoordinates = roadRoute?.geometry?.coordinates;
            if (result.code !== 'Ok' ||
                !roadRoute ||
                !routeCoordinates?.length ||
                typeof roadRoute.distance !== 'number' ||
                !Number.isFinite(roadRoute.distance) ||
                typeof roadRoute.duration !== 'number' ||
                !Number.isFinite(roadRoute.duration)) {
                throw new Error(result.message || `OSRM returned ${result.code || 'no route'}`);
            }
            const roadGeometry = routeCoordinates.map(([longitude, latitude]) => [latitude, longitude]);
            const roadResult = {
                geometry: roadGeometry,
                distanceKm: roadRoute.distance / 1000,
                durationMinutes: roadRoute.duration / 60,
            };
            if (this.roadRouteCache.size >= 100)
                this.roadRouteCache.clear();
            this.roadRouteCache.set(cacheKey, roadResult);
            return roadResult;
        }
        finally {
            clearTimeout(timeout);
        }
    }
    // จัดกลุ่มจุดส่งใกล้กัน และจำกัดไม่เกิน 3 ออเดอร์ต่อไรเดอร์
    groupOrders(orders, maxRiders, seed) {
        if (!orders.length || !maxRiders)
            return [];
        const firstOrder = orders[seed % orders.length];
        if (!firstOrder)
            return [];
        const centers = [];
        const minimumRiders = Math.ceil(orders.length / MAX_ORDERS_PER_RIDER);
        const seededOrderIds = new Set([firstOrder.order_id]);
        centers.push({
            latitude: Number(firstOrder.latitude),
            longitude: Number(firstOrder.longitude),
        });
        while (centers.length < minimumRiders) {
            const next = orders
                .filter((order) => !seededOrderIds.has(order.order_id))
                .map((order) => ({
                latitude: Number(order.latitude),
                longitude: Number(order.longitude),
                order,
                distance: Math.min(...centers.map((center) => this.distanceBetween(Number(order.latitude), Number(order.longitude), center.latitude, center.longitude))),
            }))
                .sort((a, b) => b.distance - a.distance || ((a.order.order_id + seed) % orders.length) - ((b.order.order_id + seed) % orders.length))[0];
            if (!next)
                break;
            centers.push({ latitude: next.latitude, longitude: next.longitude });
            seededOrderIds.add(next.order.order_id);
        }
        let groups = Array.from({ length: centers.length }, () => []);
        for (let iteration = 0; iteration < 5; iteration++) {
            groups = Array.from({ length: centers.length }, () => []);
            const nearestDistance = (order) => Math.min(...centers.map((center) => this.distanceBetween(Number(order.latitude), Number(order.longitude), center.latitude, center.longitude)));
            const sortedOrders = [...orders].sort((a, b) => nearestDistance(b) - nearestDistance(a) || ((a.order_id + seed) % orders.length) - ((b.order_id + seed) % orders.length));
            for (const order of sortedOrders) {
                let chosenIndex = -1;
                let closest = Number.POSITIVE_INFINITY;
                centers.forEach((center, index) => {
                    if ((groups[index]?.length ?? 0) >= MAX_ORDERS_PER_RIDER)
                        return;
                    const distance = this.distanceBetween(Number(order.latitude), Number(order.longitude), center.latitude, center.longitude);
                    if (distance < closest) {
                        closest = distance;
                        chosenIndex = index;
                    }
                });
                if (chosenIndex >= 0)
                    groups[chosenIndex]?.push(order);
            }
            centers.forEach((center, index) => {
                const group = groups[index];
                if (!group?.length)
                    return;
                center.latitude = group.reduce((sum, order) => sum + Number(order.latitude), 0) / group.length;
                center.longitude = group.reduce((sum, order) => sum + Number(order.longitude), 0) / group.length;
            });
        }
        return groups.filter((group) => group.length);
    }
    orderStops(orders, settings, seed) {
        if (orders.length <= 1)
            return [...orders];
        // ออเดอร์ต่อไรเดอร์มีไม่เกิน 3 รายการ จึงลองทุกลำดับ (สูงสุด 6 แบบ)
        // แล้วเลือกเส้นทางไปจากครัว -> ลูกค้าทุกจุด -> กลับครัว ที่มีระยะเส้นตรงรวมสั้นที่สุด
        const permutations = (items) => {
            if (items.length <= 1)
                return [items];
            return items.flatMap((item, index) => permutations([...items.slice(0, index), ...items.slice(index + 1)]).map((tail) => [item, ...tail]));
        };
        const distance = (sequence) => {
            let total = 0;
            let latitude = settings.depotLatitude;
            let longitude = settings.depotLongitude;
            for (const order of sequence) {
                const nextLatitude = Number(order.latitude);
                const nextLongitude = Number(order.longitude);
                total += this.distanceBetween(latitude, longitude, nextLatitude, nextLongitude);
                latitude = nextLatitude;
                longitude = nextLongitude;
            }
            total += this.distanceBetween(latitude, longitude, settings.depotLatitude, settings.depotLongitude);
            return total;
        };
        const candidates = permutations([...orders]);
        candidates.sort((a, b) => {
            const difference = distance(a) - distance(b);
            if (Math.abs(difference) > 0.000001)
                return difference;
            // ใช้ seed เฉพาะกรณีระยะเท่ากัน เพื่อให้สามารถเสนอแผนทางเลือกได้โดยไม่สุ่มแผนที่แย่กว่า
            return ((a[0]?.order_id ?? 0) + seed) % orders.length - (((b[0]?.order_id ?? 0) + seed) % orders.length);
        });
        return candidates[0] ?? [...orders];
    }
    /**
     * คำนวณใหม่เฉพาะไรเดอร์ที่เลือก โดยไม่เปลี่ยนการแบ่งงานหรือเส้นทางของไรเดอร์คนอื่น
     * ทดลองลำดับจุดส่งทั้งหมด (สูงสุด 6 แบบ เพราะจำกัดไม่เกิน 3 ออเดอร์) แล้วเลือกแผนที่
     * ส่งทันก่อน จากนั้นระยะทางถนนสั้นกว่า
     */
    async recalculateRiderRoute(riderNumber) {
        const currentPlan = this.plan();
        const target = currentPlan.routes.find((route) => route.riderNumber === riderNumber);
        if (!target || target.orders.length <= 1) {
            await this.loadRoadRoutes();
            return { riderNumber, attempts: 1, changed: false };
        }
        const permutations = (items) => {
            if (items.length <= 1)
                return [items];
            return items.flatMap((item, index) => permutations([...items.slice(0, index), ...items.slice(index + 1)]).map((tail) => [item, ...tail]));
        };
        const depot = [this.depot.depotLatitude, this.depot.depotLongitude];
        let best = null;
        let bestAlternative = null;
        const candidates = permutations([...target.orders]);
        const currentSignature = target.orders.map((order) => order.order_id).join(',');
        // Prefer a genuinely different stop order on every click when an alternative exists.
        for (const orders of candidates) {
            const candidateRoute = { ...target, orders };
            try {
                const road = await this.fetchRoadRoute(candidateRoute, depot);
                const minutes = Math.max(road.durationMinutes, road.distanceKm / 30 * 60);
                const candidate = { orders, road, feasible: minutes <= 60 };
                const better = (a, b) => !b || (a.feasible && !b.feasible) ||
                    (a.feasible === b.feasible && a.road.distanceKm < b.road.distanceKm - 0.000001);
                if (better(candidate, best))
                    best = candidate;
                if (orders.map((order) => order.order_id).join(',') !== currentSignature && better(candidate, bestAlternative)) {
                    bestAlternative = candidate;
                }
            }
            catch (error) {
                console.warn(`Could not evaluate route order for rider ${riderNumber}.`, error);
            }
        }
        if (!best)
            throw new Error(`คำนวณเส้นทางของไรเดอร์ ${riderNumber} ไม่สำเร็จ กรุณาลองใหม่`);
        // If this rider has 2+ stops, rotate to the best alternative order instead of repeatedly
        // returning the same shortest order. For a single stop, geometry cannot be changed by reordering.
        best = bestAlternative ?? best;
        this.plan.set({
            ...currentPlan,
            routes: currentPlan.routes.map((route) => route.riderNumber === riderNumber ? { ...route, orders: best.orders } : route),
        });
        const updatedRoad = { riderNumber, ...best.road };
        this.roadRoutes.set([
            ...this.roadRoutes().filter((road) => road.riderNumber !== riderNumber),
            updatedRoad,
        ]);
        return { riderNumber, attempts: candidates.length, changed: true, feasible: best.feasible, distanceKm: best.road.distanceKm };
    }
    /**
     * ทดลองหลายแผนและเก็บแผนที่ดีที่สุดจากระยะทางถนนจริงของ OSRM
     * ลำดับความสำคัญ: ส่งทัน 12:30 ก่อน จากนั้นกำไรสูงสุด และระยะทางรวมต่ำสุด
     */
    async recalculateBestPlan(attempts = 5) {
        let best = null;
        let bestAlternative = null;
        const currentSignature = (plan) => plan.routes.map((route) => `${route.riderNumber}:${route.orders.map((order) => order.order_id).join(',')}`).join('|');
        const originalSignature = currentSignature(this.plan());
        const count = Math.max(1, Math.min(8, Math.floor(attempts)));
        for (let seed = 0; seed < count; seed++) {
            this.rebuildPlan(seed);
            await this.loadRoadRoutes();
            const routes = this.plan().routes;
            const roads = this.roadRoutes();
            let feasible = true;
            let profit = 0;
            let distance = 0;
            for (const route of routes) {
                const road = roads.find((item) => item.riderNumber === route.riderNumber);
                if (!road || road.error) {
                    feasible = false;
                    continue;
                }
                distance += road.distanceKm;
                const minutesAtRiderSpeed = (road.distanceKm / 30) * 60;
                const estimatedMinutes = Math.max(road.durationMinutes, minutesAtRiderSpeed);
                if (estimatedMinutes > 60)
                    feasible = false;
                const finance = this.financialSummary(route);
                if (finance.profit === null)
                    feasible = false;
                else
                    profit += finance.profit;
            }
            const candidate = {
                plan: this.plan(),
                roads: [...roads],
                feasible,
                profit,
                distance,
            };
            const isBetter = !best ||
                (candidate.feasible && !best.feasible) ||
                (candidate.feasible === best.feasible && candidate.profit > best.profit + 0.01) ||
                (candidate.feasible === best.feasible && Math.abs(candidate.profit - best.profit) <= 0.01 && candidate.distance < best.distance);
            if (isBetter)
                best = candidate;
            if (currentSignature(candidate.plan) !== originalSignature) {
                const alternativeIsBetter = !bestAlternative ||
                    (candidate.feasible && !bestAlternative.feasible) ||
                    (candidate.feasible === bestAlternative.feasible && candidate.profit > bestAlternative.profit + 0.01) ||
                    (candidate.feasible === bestAlternative.feasible && Math.abs(candidate.profit - bestAlternative.profit) <= 0.01 && candidate.distance < bestAlternative.distance);
                if (alternativeIsBetter)
                    bestAlternative = candidate;
            }
        }
        // Prefer a different plan when one was found; otherwise keep the best available plan.
        const chosen = bestAlternative ?? best;
        if (chosen) {
            this.plan.set(chosen.plan);
            this.roadRoutes.set(chosen.roads);
        }
        return chosen ? { feasible: chosen.feasible, profit: chosen.profit, distanceKm: chosen.distance, attempts: count, changed: !!bestAlternative } : null;
    }
    distanceBetween(lat1, lon1, lat2, lon2) {
        const radians = (degrees) => (degrees * Math.PI) / 180;
        const dLat = radians(lat2 - lat1);
        const dLon = radians(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
        return 6371 * 2 * Math.asin(Math.sqrt(a));
    }
}
exports.DeliveryPlanningService = DeliveryPlanningService;
//# sourceMappingURL=delivery-planning.js.map
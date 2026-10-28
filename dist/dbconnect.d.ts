export declare const conn: import("@tursodatabase/serverless/compat").Client;
export type DbRow = Record<string, unknown>;
export declare function queryRows<T extends object = DbRow>(sql: string, args?: any[]): Promise<T[]>;
export declare function execute(sql: string, args?: any[]): Promise<import("@tursodatabase/serverless/compat").ResultSet>;
//# sourceMappingURL=dbconnect.d.ts.map
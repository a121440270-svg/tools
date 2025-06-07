// server/database/orm.ts
function runAll<T>(stmt: any): Promise<T[]> {
    return stmt.all().then((res: unknown) => (res as T[]));
}
export function getDb() {
    return useDatabase("myDatabase");
}

export async function select<T>(table: string, where?: { [key: string]: any }): Promise<T[]> {
    const db = getDb();
    const whereClause = where
        ? 'WHERE ' + Object.keys(where).map(k => `${k} = ?`).join(' AND ')
        : '';
    const values = where ? Object.values(where) : [];
    let stmt = db.prepare(`SELECT * FROM ${table} ${whereClause}`);
    if (null != values && values.length > 0) {
        stmt = stmt.bind(...values);
    }
    return runAll<T>(stmt);
}

export async function insert<T>(table: string, data: Partial<T>) {
    const db = getDb();
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(', ');
    const stmt = db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`);
    await stmt.bind(...Object.values(data) as (string | number | boolean | null)[]).run();
}

export async function update<T>(table: string, data: Partial<T>, where: { [key: string]: any }) {
    const db = getDb();
    const setClause = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
    const stmt = db.prepare(`UPDATE ${table} SET ${setClause} WHERE ${whereClause}`);
    await stmt.bind(...Object.values(data) as (string | number | boolean | null)[]).run();
}

export async function remove(table: string, where: { [key: string]: any }) {
    const db = getDb();
    const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
    const stmt = db.prepare(`DELETE FROM ${table} WHERE ${whereClause}`);
    await stmt.bind(...Object.values(where)).run();
}

// server/database/orm.ts
function runAll<T>(stmt: any): Promise<T[]> {
    return stmt.all().then((res: unknown) => (res as T[]));
}
export function getDb() {
    return useDatabase("myDatabase");
}

export async function select<T>(table: string, where?: { [key: string]: any }): Promise<T[]> {
    const db = getDb();
    let whereClause = where
        ? 'WHERE ' + Object.keys(where).map(k => `${k} = ?`).join(' AND ')
        : '';
    const values = where ? Object.values(where) : [];
    if (null == values || values.length == 0) {
        whereClause=''
    }
    console.log(`SELECT * FROM ${table} ${whereClause}`);
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

// 建造者模式动态查询
type Clause = {
    type: 'AND' | 'OR';
    sql: string;
    params: any[];
  };
  
  export class QueryBuilder {
    private clauses: Clause[] = [];
    private joins: string[] = [];
    private groupByClause: string | null = null;
    private limitClause: string | null = null;
    private offsetClause: string | null = null;
  
    constructor(private table: string) {}
  
    where(column: string, op: string, value: any) {
      this.clauses.push({ type: 'AND', sql: `${column} ${op} ?`, params: [value] });
      return this;
    }
  
    orWhere(column: string, op: string, value: any) {
      this.clauses.push({ type: 'OR', sql: `${column} ${op} ?`, params: [value] });
      return this;
    }
  
    in(column: string, values: any[]) {
      const placeholders = values.map(() => '?').join(', ');
      this.clauses.push({ type: 'AND', sql: `${column} IN (${placeholders})`, params: values });
      return this;
    }
  
    join(table: string, onClause: string) {
      this.joins.push(`JOIN ${table} ON ${onClause}`);
      return this;
    }
  
    groupBy(column: string) {
      this.groupByClause = `GROUP BY ${column}`;
      return this;
    }
  
    limit(n: number) {
      this.limitClause = `LIMIT ${n}`;
      return this;
    }
  
    offset(n: number) {
      this.offsetClause = `OFFSET ${n}`;
      return this;
    }
  
    private buildQuery(): { sql: string; params: any[] } {
      let sql = `SELECT * FROM ${this.table}`;
      if (this.joins.length) sql += ' ' + this.joins.join(' ');
  
      if (this.clauses.length) {
        const clausesSql: string[] = [];
        const params: any[] = [];
  
        for (let i = 0; i < this.clauses.length; i++) {
          const { type, sql: clauseSql, params: clauseParams } = this.clauses[i];
          const prefix = i === 0 ? 'WHERE' : type;
          clausesSql.push(`${prefix} ${clauseSql}`);
          params.push(...clauseParams);
        }
  
        sql += ' ' + clausesSql.join(' ');
        return { sql: [sql, this.groupByClause, this.limitClause, this.offsetClause].filter(Boolean).join(' '), params };
      }
  
      sql = [sql, this.groupByClause, this.limitClause, this.offsetClause].filter(Boolean).join(' ');
      return { sql, params: [] };
    }
  
    async all<T>(): Promise<T[]> {
      const db = getDb();
      const { sql, params } = this.buildQuery();
  
      let stmt = db.prepare(sql);
      if (params.length > 0 && typeof stmt.bind === 'function') {
        stmt = stmt.bind(...params);
      }
      return runAll<T>(stmt);
      // return stmt.all?.() ?? stmt.all();
    }
  }
  
  export function selectCon(table: string) {
    return new QueryBuilder(table);
  }
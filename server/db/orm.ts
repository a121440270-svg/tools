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
    whereClause = ''
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
  private alias: string | null = null;
  private selectFields: string[] | null = null;
  private orderByClause: string | null = null;
  private isCount: boolean = false;
  private updateData: Record<string, any> | null = null;

  constructor(private table: string) { }

  fromAlias(alias: string) {
    this.alias = alias;
    return this;
  }

  where(column: string, op: string, value: any) {
    this.clauses.push({ type: 'AND', sql: `${column} ${op} ?`, params: [value] });
    return this;
  }

  orWhere(column: string, op: string, value: any) {
    this.clauses.push({ type: 'OR', sql: `${column} ${op} ?`, params: [value] });
    return this;
  }

  isNotNull(column: string) {
    this.clauses.push({ type: 'AND', sql: `${column} IS NOT NULL`, params: [] });
    return this;
  }

  isNull(column: string) {
    this.clauses.push({ type: 'AND', sql: `${column} IS NULL`, params: [] });
    return this;
  }

  in(column: string, values: any[]) {
    const placeholders = values.map(() => '?').join(', ');
    this.clauses.push({ type: 'AND', sql: `${column} IN (${placeholders})`, params: values });
    return this;
  }

  join(table: string, onClause: string, type: 'INNER' | 'LEFT' = 'INNER') {
    this.joins.push(`${type} JOIN ${table} ON ${onClause}`);
    return this;
  }

  andGroup(cb: (qb: QueryBuilder) => void) {
    const nested = new QueryBuilder(this.table);
    cb(nested);
    const { sql, params } = nested.buildClauseOnly();
    this.clauses.push({ type: 'AND', sql: `(${sql})`, params });
    return this;
  }

  orGroup(cb: (qb: QueryBuilder) => void) {
    const nested = new QueryBuilder(this.table);
    cb(nested);
    const { sql, params } = nested.buildClauseOnly();
    this.clauses.push({ type: 'OR', sql: `(${sql})`, params });
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
  // 选择字段
  select(fields: string[]) {
    this.selectFields = fields;
    return this;
  }

  // 排序
  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC') {
    this.orderByClause = `ORDER BY ${field} ${direction}`;
    return this;
  }

  // 计数
  count(field = '*') {
    this.isCount = true;
    this.selectFields = [`COUNT(${field}) as count`];
    return this;
  }

  // 更新
  update(data: Record<string, any>) {
    this.updateData = data;
    return this;
  }

  private buildClauseOnly(): { sql: string; params: any[] } {
    const parts: string[] = [];
    const params: any[] = [];

    for (let i = 0; i < this.clauses.length; i++) {
      const { type, sql, params: p } = this.clauses[i];
      const prefix = i === 0 ? '' : type;
      parts.push(`${prefix} ${sql}`.trim());
      params.push(...p);
    }

    return { sql: parts.join(' '), params };
  }

  private buildQuery(): { sql: string; params: any[] } {
    const tableAlias = this.alias ? `${this.table} ${this.alias}` : this.table;
    const selectClause = this.selectFields ? this.selectFields.join(', ') : '*';
    const base = this.updateData
      ? `UPDATE ${tableAlias}`
      : `SELECT ${selectClause} FROM ${tableAlias}`;
  
    let sql = base;
    if (this.joins.length) sql += ' ' + this.joins.join(' ');
  
    const { sql: whereSql, params } = this.buildClauseOnly();
    if (whereSql) {
      sql += this.updateData ? ` SET ${Object.keys(this.updateData!).map(k => `${k} = ?`).join(', ')} WHERE ${whereSql}` : ` WHERE ${whereSql}`;
    } else if (this.updateData) {
      sql += ` SET ${Object.keys(this.updateData!).map(k => `${k} = ?`).join(', ')}`;
    }
  
    if (!this.updateData) {
      if (this.groupByClause) sql += ` ${this.groupByClause}`;
      if (this.orderByClause) sql += ` ${this.orderByClause}`;
      if (this.limitClause) sql += ` ${this.limitClause}`;
      if (this.offsetClause) sql += ` ${this.offsetClause}`;
    }
  
    const finalParams = this.updateData
      ? [...Object.values(this.updateData), ...params]
      : params;
  
    return { sql, params: finalParams };
  }
  

  async all<T>(): Promise<T[]> {
    const db = getDb();
    const { sql, params } = this.buildQuery();
    let stmt = db.prepare(sql);
    if (params.length > 0 && typeof stmt.bind === 'function') {
      stmt = stmt.bind(...params);
    }
    return runAll<T>(stmt);
  }
}

export function selectCon(table: string) {
  return new QueryBuilder(table);
}

// 使用示例代码
// const { sql, params } = selectCon('tools')
//   .fromAlias('t')
//   .join('users u', 't.id = u.id')
//   .isNotNull('t.id')
//   .andGroup(q => {
//     q.where('t.name', 'LIKE', '%tt%')
//      .orWhere('t.description', '=', 'jj');
//   })
//   .in('t.id', [1, 2, 3])
//   .buildQuery();

// console.log(sql);
// console.log(params);

// ✅ 新增执行更新的方法
// ts
// Copy
// Edit
// async run(): Promise<void> {
//   const db = getDb();
//   const { sql, params } = this.buildQuery();
//   let stmt = db.prepare(sql);
//   if (params.length > 0) {
//     stmt = stmt.bind(...params);
//   }
//   await stmt.run();
// }
// ✅ 示例用法
// 查询 + 排序
// ts
// Copy
// Edit
// await selectCon('tools')
//   .select(['t.id', 't.name', 'u.username'])
//   .fromAlias('t')
//   .join('users u', 't.user_id = u.id')
//   .orderBy('t.id', 'DESC')
//   .all();
// 计数
// ts
// Copy
// Edit
// const [{ count }] = await selectCon('tools').count().all<{ count: number }>();
// 更新
// ts
// Copy
// Edit
// await selectCon('tools')
//   .where('id', '=', 1)
//   .update({ name: '新名称', description: '修改描述' })
//   .run();
import { Utils } from "~/server/utils";

/**
 * replaceInto: 如果指定属性组合存在则更新，否则插入
 * @param table 表名
 * @param data 数据对象，必须包含所有唯一属性字段
 * @param keys 唯一属性字段名数组，如 ['route', 'key', 'lang']
 */
export async function replaceInto<T>(table: string, data: Partial<T>, keys: string | string[] = 'id') {
  const record = data as Record<string, any>;
  const keyArr = Array.isArray(keys) ? keys : [keys];
  // 检查所有唯一属性是否存在
  for (const k of keyArr) {
    if (record[k] === undefined || record[k] === null) {
      throw new Error(`replaceInto 需要 data 包含判断重复的字段 ${k}`);
    }
  }
  // 生成 where 条件对象
  const where: Record<string, any> = {};
  keyArr.forEach(k => { where[k] = record[k]; });
  // 查询是否存在
  const exist = await select<T>(table, where);
  if (exist && exist.length > 0) {
    // 存在则更新（用所有唯一属性做 where 条件）
    await update<T>(table, data, where);
  } else {
    // 不存在则插入
    await insert<T>(table, data);
  }
}
// server/database/orm.ts
function runAll<T>(stmt: any): Promise<T[]> {
  return stmt.all().then((res: unknown) => (res as T[]));
}
function runOne<T>(stmt: any): Promise<T | null> {
  // prefer get() if available, otherwise fallback to all()[0]
  if (typeof stmt.get === 'function') {
    return stmt.get().then((res: unknown) => (res as T) || null).catch(() => null)
  }
  return stmt.all().then((res: unknown) => {
    const arr = res as T[]
    return (Array.isArray(arr) && arr.length > 0) ? arr[0] : null
  }).catch(() => null)
}
export function getDb() {
  return useDatabase("myDatabase");
}

export async function select<T>(table: string, where?: { [key: string]: any }): Promise<T[]> {
  const db = getDb();
  let clauseArr: string[] = [];
  let params: any[] = [];
  if (where) {
    for (const k in where) {
      if (where[k] === null) {
        clauseArr.push(`${k} IS NULL`);
      } else {
        clauseArr.push(`${k} = ?`);
        params.push(where[k]);
      }
    }
  }
  const whereClause = clauseArr.length > 0 ? 'WHERE ' + clauseArr.join(' AND ') : '';
  const sql = `SELECT * FROM ${table} ${whereClause}`;
  const fullSql = Utils.formatSqlWithParams(sql, params);
  console.log('SQL:', fullSql);
  let stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt = stmt.bind(...params);
  }
  return runAll<T>(stmt);
}

export async function insert<T>(table: string, data: Partial<T>) {
  const db = getDb();
  const keys = Object.keys(data);
  const placeholders = keys.map(() => '?').join(', ');
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`;
  const params = Object.values(data) as (string | number | boolean | null)[];
  const fullSql = Utils.formatSqlWithParams(sql, params);
  try {
    const stmt = db.prepare(sql);
    console.log('SQL:', fullSql);
    const result = await stmt.bind(...params).run();
    console.log('Insert result:', result);
    return result;
  } catch (err) {
    console.error('Insert error:', err);
    throw err;
  }
}

export async function update<T>(table: string, data: Partial<T>, where: { [key: string]: any }) {
  const db = getDb();
  const setClause = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
  const stmt = db.prepare(`UPDATE ${table} SET ${setClause} WHERE ${whereClause}`);
  console.log(`UPDATE ${table} SET ${setClause} WHERE ${whereClause}`);
  await stmt.bind(
    ...Object.values(data) as (string | number | boolean | null)[],
    ...Object.values(where)
  ).run();
}

export async function remove(table: string, where: { [key: string]: any }) {
  const db = getDb();
  const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
  console.log(`DELETE FROM ${table} WHERE ${whereClause}`);
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

  async one<T>(): Promise<T | null> {
    const db = getDb();
    const { sql, params } = this.buildQuery();
    let stmt = db.prepare(sql);
    if (params.length > 0 && typeof stmt.bind === 'function') {
      stmt = stmt.bind(...params);
    }
    return runOne<T>(stmt);
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
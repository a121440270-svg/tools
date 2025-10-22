// 通用工具类
export class Utils {
  /**
   * 格式化 SQL，将 ? 替换为参数值（仅用于调试日志，注意 SQL 注入风险）
   */
  static formatSqlWithParams(sql: string, params: any[]): string {
    const paramList = params.map(v => typeof v === 'string' ? `'${v}'` : v)
    let idx = 0
    return sql.replace(/\?/g, () => paramList[idx++] ?? '?')
  }
  /**
   * 将对象的所有 key 从 camelCase 转为 snake_case
   */
  static toSnakeCaseObject(obj: Record<string, any>, fieldMap?: Record<string, string>): Record<string, any> {
    const result: Record<string, any> = {}
    if (fieldMap) {
      for (const tsKey in obj) {
        const dbKey = fieldMap[tsKey] || tsKey.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  result[dbKey] = typeof obj[tsKey] === 'boolean' ? (obj[tsKey] ? 1 : 0) : obj[tsKey]
      }
    } else {
      for (const key in obj) {
        const snake = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  result[snake] = typeof obj[key] === 'boolean' ? (obj[key] ? 1 : 0) : obj[key]
      }
    }
    return result
  }

  /**
   * 将数据库对象的所有 key 从 snake_case 转为 camelCase，支持字段映射
   */
  static fromSnakeCaseObject(obj: Record<string, any>, fieldMap?: Record<string, string>): Record<string, any> {
    const result: Record<string, any> = {}
    if (fieldMap) {
      for (const tsKey in fieldMap) {
        const dbKey = fieldMap[tsKey]
        result[tsKey] = obj[dbKey]
      }
    } else {
      for (const key in obj) {
        // snake_case 转 camelCase
        const camel = key.replace(/_([a-z])/g, (_, l) => l.toUpperCase())
        result[camel] = obj[key]
      }
    }
    return result
  }
}


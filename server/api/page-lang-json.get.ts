import { defineEventHandler, getQuery } from 'h3'
import { select } from '../db/orm'

function setDeep(obj: any, path: string, value: any) {
  const keys = path.split('.')
  let cur = obj
  keys.forEach((k, idx) => {
    if (idx === keys.length - 1) {
      cur[k] = value
    } else {
      if (!cur[k]) cur[k] = {}
      cur = cur[k]
    }
  })
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  // 支持传 lang 参数
  const where = query.lang ? { lang: query.lang } : undefined
  const rows = await select('page_lang', where)
  const result = {}
  for (const row of rows as Array<{ key: string; value: any }>) {
    setDeep(result, row.key, row.value)
  }
  return result
})

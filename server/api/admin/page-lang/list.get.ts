import { defineEventHandler, getQuery } from 'h3'
import { selectCon } from '../../../db/orm'
import type { PageLang } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const pageSize = parseInt(query.pageSize as string) || 10
  const offset = (page - 1) * pageSize

  // 查询全部数据（动态SQL，支持模糊和lang筛选）
  const builder = selectCon('page_lang')
  if (query.key) builder.where('key', 'LIKE', `%${query.key}%`)
  if (query.route) builder.where('route', 'LIKE', `%${query.route}%`)
  if (query.lang) builder.where('lang', '=', query.lang)
  builder.limit(pageSize).offset(offset)
  const list = await builder.all<PageLang>()

  // 获取总数
  let countBuilder = selectCon('page_lang')
  if (query.key) countBuilder.where('key', 'LIKE', `%${query.key}%`)
  if (query.route) countBuilder.where('route', 'LIKE', `%${query.route}%`)
  if (query.lang) countBuilder.where('lang', '=', query.lang)
  countBuilder.count('id')
  const [{ count }] = await countBuilder.all<{ count: number }>()

  return {
    list,
    total: count
  }
})

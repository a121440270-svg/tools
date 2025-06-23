import { defineEventHandler, getQuery } from 'h3'
import { select } from '../../../db/orm'
import type { User } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const pageSize = parseInt(query.pageSize as string) || 20
  const where: any = {}
  if (query.email) where.email = query.email
  if (query.name) where.name = query.name
  if (query.is_active !== undefined && query.is_active !== '') where.is_active = Number(query.is_active)
  const all = await select<User>('users', where)
  const total = all.length
  const list = all.slice((page - 1) * pageSize, page * pageSize)
  return { list, total }
})

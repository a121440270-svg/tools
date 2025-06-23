import { defineEventHandler, readBody } from 'h3'
import { update } from '../../../db/orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, is_active } = body
  if (!id || typeof is_active !== 'number') {
    return { error: '参数错误' }
  }
  await update('users', { is_active }, { id })
  return { success: true }
})

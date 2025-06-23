import { defineEventHandler, readBody } from 'h3'
import { remove } from '../../../db/orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id } = body
  if (!id) {
    return { error: '参数错误' }
  }
  await remove('users', { id })
  return { success: true }
})

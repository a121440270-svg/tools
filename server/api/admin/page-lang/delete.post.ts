import { defineEventHandler, readBody } from 'h3'
import { remove } from '../../../db/orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id } = body
  await remove('page_lang', { id })
  return { success: true }
})

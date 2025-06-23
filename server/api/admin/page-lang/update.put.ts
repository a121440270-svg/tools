import { defineEventHandler, readBody } from 'h3'
import { update } from '../../../db/orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, ...data } = body
  await update('page_lang', data, { id })
  return { success: true }
})

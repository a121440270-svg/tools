import { defineEventHandler, readBody } from 'h3'
import { insert } from '../../../db/orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  await insert('page_lang', body)
  return { success: true }
})

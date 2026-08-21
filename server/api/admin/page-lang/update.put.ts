import { defineEventHandler, readBody } from 'h3'
import { update } from '../../../db/orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, ...data } = body

  if (!id) {
    return { success: false, message: 'missing id' }
  }

  if (!data || Object.keys(data).length === 0) {
    return { success: false, message: 'no fields to update' }
  }

  try {
    await update('page_lang', data, { id })
    return { success: true }
  } catch (err) {
    console.error('page-lang update error:', err)
    return { success: false, message: String(err) }
  }
})

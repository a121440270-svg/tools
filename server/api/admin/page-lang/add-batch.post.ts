import { defineEventHandler, readBody } from 'h3'
import { insert } from '../../../db/orm'

export default defineEventHandler(async (event) => {
  const data = await readBody(event)
  if (!Array.isArray(data)) {
    throw new Error('批量添加数据必须为数组')
  }
  for (const item of data) {
    await insert('page_lang', item)
  }
  return { success: true }
})

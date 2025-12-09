import { readBody } from 'h3'
import { createPrompt } from '~/server/dao/promptDao'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body || !body.title) {
    throw createError({ statusCode: 400, statusMessage: 'title is required' })
  }
  const res = await createPrompt(body as any)
  return { success: true, res }
})

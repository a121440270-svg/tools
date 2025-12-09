import { readBody } from 'h3'
import { updatePrompt } from '~/server/dao/promptDao'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })
  const body = await readBody(event)
  await updatePrompt(id, body as any)
  return { success: true }
})

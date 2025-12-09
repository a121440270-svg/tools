import { findPromptById } from '~/server/dao/promptDao'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })
  const p = await findPromptById(id)
  if (!p) throw createError({ statusCode: 404, statusMessage: 'Prompt not found' })
  return p
})

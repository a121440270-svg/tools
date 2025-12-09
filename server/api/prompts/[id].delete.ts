import { deletePrompt } from '~/server/dao/promptDao'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })
  await deletePrompt(id)
  return { success: true }
})

import { createError, defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !/^[a-z0-9][a-z0-9-]{2,47}$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid share link' })
  }

  await useDatabase('myDatabase')
    .prepare('DELETE FROM share_note WHERE id = ?')
    .bind(id)
    .run()

  return { success: true }
})

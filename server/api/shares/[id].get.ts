import { createError, defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !/^[a-z0-9][a-z0-9-]{2,47}$/.test(id)) throw createError({ statusCode: 404, statusMessage: 'Share not found' })

  const db = useDatabase('myDatabase')
  const share = await db.prepare(
    `SELECT id, title, content, language, created_at AS createdAt, view_count AS viewCount
    FROM share_note WHERE id = ?`
  ).bind(id).get() as Record<string, any> | undefined

  if (!share) throw createError({ statusCode: 404, statusMessage: 'Share not found' })

  const now = Date.now()
  await db.prepare(
    `UPDATE share_note
     SET view_count = view_count + 1, last_access_at = ?
     WHERE id = ?`
  ).bind(now, id).run()

  share.viewCount = Number(share.viewCount || 0) + 1
  share.lastAccessAt = now
  return share
})

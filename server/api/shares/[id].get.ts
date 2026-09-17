import { createError, defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !/^[a-z0-9][a-z0-9-]{2,47}$/.test(id)) throw createError({ statusCode: 404, statusMessage: 'Share not found' })

  const db = useDatabase('myDatabase')
  const share = await db.prepare(
    `SELECT id, title, content, language, created_at AS createdAt,
            expires_at AS expiresAt, timeout_seconds AS timeoutSeconds,
            auto_extend AS autoExtend, view_count AS viewCount
    FROM share_note WHERE id = ?`
  ).bind(id).get() as Record<string, any> | undefined

  if (!share || Number(share.expiresAt) <= Date.now()) {
    if (share) await db.prepare('DELETE FROM share_note WHERE id = ?').bind(id).run()
    throw createError({ statusCode: 404, statusMessage: 'This share has expired' })
  }

  const now = Date.now()
  const refreshedExpiresAt = now + Math.max(Number(share.timeoutSeconds) || 259200, 3600) * 1000
  await db.prepare(
    `UPDATE share_note
     SET expires_at = ?, view_count = view_count + 1, last_access_at = ?
     WHERE id = ? AND expires_at > ?`
  ).bind(refreshedExpiresAt, now, id, now).run()

  share.expiresAt = refreshedExpiresAt
  share.viewCount = Number(share.viewCount || 0) + 1
  share.lastAccessAt = now
  return share
})

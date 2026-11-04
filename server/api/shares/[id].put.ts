import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'

const MAX_CONTENT_LENGTH = 200_000
const NEVER_EXPIRES = Number.MAX_SAFE_INTEGER

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !/^[a-z0-9][a-z0-9-]{2,47}$/.test(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid share link' })

  const body = await readBody(event)
  const content = typeof body?.content === 'string' ? body.content : ''
  if (!content.trim()) throw createError({ statusCode: 400, statusMessage: 'Content is required' })
  if (content.length > MAX_CONTENT_LENGTH) throw createError({ statusCode: 413, statusMessage: 'Content is too large' })

  const now = Date.now()
  const result = await useDatabase('myDatabase').prepare(
    `UPDATE share_note
     SET title = ?, content = ?, language = ?, created_at = ?, expires_at = ?,
         timeout_seconds = 0, auto_extend = 0
     WHERE id = ?`
  ).bind(
    typeof body.title === 'string' ? body.title.slice(0, 80) : 'Untitled handoff',
    content,
    typeof body.language === 'string' ? body.language : 'text',
    now,
    NEVER_EXPIRES,
    id
  ).run()

  if (!result.meta?.changes) throw createError({ statusCode: 404, statusMessage: 'Share not found' })
  return { id }
})
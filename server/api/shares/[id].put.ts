import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'

const MAX_CONTENT_LENGTH = 200_000
const NEVER_EXPIRES = Number.MAX_SAFE_INTEGER
const EXPIRY_SECONDS = {
  never: 0,
  '1d': 86400,
  '7d': 604800,
  '30d': 2592000
} as const

type ShareExpiry = keyof typeof EXPIRY_SECONDS

function getExpiry(bodyValue: unknown, now: number) {
  if (bodyValue !== undefined && (typeof bodyValue !== 'string' || !Object.hasOwn(EXPIRY_SECONDS, bodyValue))) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid share expiry' })
  }
  const value = bodyValue === undefined ? 'never' : bodyValue as ShareExpiry
  const timeoutSeconds = EXPIRY_SECONDS[value]
  return {
    timeoutSeconds,
    expiresAt: timeoutSeconds ? now + timeoutSeconds * 1000 : NEVER_EXPIRES
  }
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !/^[a-z0-9][a-z0-9-]{2,47}$/.test(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid share link' })

  const body = await readBody(event)
  const content = typeof body?.content === 'string' ? body.content : ''
  if (!content.trim()) throw createError({ statusCode: 400, statusMessage: 'Content is required' })
  if (content.length > MAX_CONTENT_LENGTH) throw createError({ statusCode: 413, statusMessage: 'Content is too large' })

  const newId = typeof body?.slug === 'string' ? body.slug.trim().toLowerCase() : id
  if (!/^[a-z0-9][a-z0-9-]{2,47}$/.test(newId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid share link' })
  }

  const now = Date.now()
  const { timeoutSeconds, expiresAt } = getExpiry(body.expiresIn, now)
  const result = await useDatabase('myDatabase').prepare(
    `UPDATE share_note
     SET id = ?, title = ?, content = ?, language = ?, created_at = ?, expires_at = ?,
         timeout_seconds = ?, auto_extend = 0
     WHERE id = ?`
  ).bind(
    newId,
    typeof body?.title === 'string' ? body.title.slice(0, 80) : 'Untitled handoff',
    content,
    typeof body?.language === 'string' ? body.language : 'text',
    now,
    expiresAt,
    timeoutSeconds,
    id
  ).run().catch((error: any) => {
    if (String(error?.message || '').toLowerCase().includes('unique')) {
      throw createError({ statusCode: 409, statusMessage: 'This custom link is already in use' })
    }
    throw error
  })

  if (!result.meta?.changes) throw createError({ statusCode: 404, statusMessage: 'Share not found' })
  return { id: newId, expiresAt }
})
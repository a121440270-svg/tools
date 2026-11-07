import { createError, defineEventHandler, readBody } from 'h3'

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

function makeId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

function normalizeSlug(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return makeId()
  const slug = value.trim().toLowerCase()
  if (!/^[a-z0-9][a-z0-9-]{2,47}$/.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Custom link must be 3-48 characters using lowercase letters, numbers, or hyphens' })
  }
  return slug
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const content = typeof body?.content === 'string' ? body.content : ''
  if (!content.trim()) throw createError({ statusCode: 400, statusMessage: 'Content is required' })
  if (content.length > MAX_CONTENT_LENGTH) throw createError({ statusCode: 413, statusMessage: 'Content is too large' })

  const id = normalizeSlug(body.slug)
  const now = Date.now()
  const { timeoutSeconds, expiresAt } = getExpiry(body.expiresIn, now)
  const db = useDatabase('myDatabase')

  await db.prepare(
    `INSERT INTO share_note
      (id, title, content, language, created_at, expires_at, timeout_seconds, auto_extend, view_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`
  ).bind(
    id,
    typeof body.title === 'string' ? body.title.slice(0, 80) : 'Untitled handoff',
    content,
    typeof body.language === 'string' ? body.language : 'text',
    now,
    expiresAt,
    timeoutSeconds
  ).run().catch((error: any) => {
    if (String(error?.message || '').toLowerCase().includes('unique')) {
      throw createError({ statusCode: 409, statusMessage: 'This custom link is already in use' })
    }
    throw error
  })

  return { id, expiresAt }
})

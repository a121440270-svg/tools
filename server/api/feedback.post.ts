import { createError, defineEventHandler, getHeader, getRequestURL, readBody } from 'h3'
import { sendEmail } from '../utils/email'

interface FeedbackBody {
  message?: unknown
  email?: unknown
  website?: unknown
  pageUrl?: unknown
}

const RECIPIENT = '121440270@qq.com'
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX_SUBMISSIONS = 5
const submissionsByIp = new Map<string, number[]>()

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const recentSubmissions = (submissionsByIp.get(ip) || []).filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS
  )

  if (recentSubmissions.length >= RATE_LIMIT_MAX_SUBMISSIONS) {
    submissionsByIp.set(ip, recentSubmissions)
    return false
  }

  if (!submissionsByIp.has(ip) && submissionsByIp.size >= 1000) {
    const oldestIp = submissionsByIp.keys().next()
    if (!oldestIp.done) submissionsByIp.delete(oldestIp.value)
  }

  recentSubmissions.push(now)
  submissionsByIp.set(ip, recentSubmissions)
  return true
}

export default defineEventHandler(async (event) => {
  const body = await readBody<FeedbackBody>(event).catch(() => null)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body' })
  }

  if (typeof body.website === 'string' && body.website.trim()) {
    return { success: true }
  }

  if (typeof body.message !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'A feature request is required' })
  }
  const message = body.message.trim()
  if (message.length < 10 || message.length > 3000) {
    throw createError({ statusCode: 400, statusMessage: 'The request must be between 10 and 3000 characters' })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (email.length > 254 || (email && !isValidEmail(email))) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address' })
  }

  if (typeof body.pageUrl !== 'string' || body.pageUrl.length > 2048) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid page URL' })
  }
  let pageUrl: URL
  try {
    pageUrl = new URL(body.pageUrl)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid page URL' })
  }
  if (pageUrl.origin !== getRequestURL(event).origin || !['http:', 'https:'].includes(pageUrl.protocol)) {
    throw createError({ statusCode: 400, statusMessage: 'Page URL must belong to this site' })
  }

  const ip = getHeader(event, 'cf-connecting-ip')
    || getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
  if (!checkRateLimit(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
  }

  const lines = [
    'A user submitted a feature request for OnliTool.',
    '',
    'Request:',
    message,
    '',
    `Reply email: ${email || 'Not provided'}`,
    `Page URL: ${pageUrl.toString()}`,
    `Submitted at: ${new Date().toISOString()}`
  ]

  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]!)
  const result = await sendEmail({
    to: RECIPIENT,
    subject: 'New feature request - OnliTool',
    text: lines.join('\n'),
    html: `<pre style="font-family: sans-serif; white-space: pre-wrap">${escapeHtml(lines.join('\n'))}</pre>`,
    ...(email ? { replyTo: email } : {})
  }, event)

  if (!result.success) {
    console.error('[feedback] Email delivery failed:', result.error || 'Unknown email error')
    throw createError({
      statusCode: result.skipped ? 503 : 502,
      statusMessage: result.skipped
        ? 'Feedback email service is not configured'
        : 'Could not deliver the feature request email'
    })
  }

  return { success: true }
})

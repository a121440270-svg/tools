// Private / user-specific routes are rendered client-side (`ssr: false`), so the
// `<meta name="robots" content="noindex">` injected by the layout only exists
// after hydration — Googlebot fetches an empty HTML shell and never sees it.
// Set the equivalent HTTP header server-side as the authoritative signal.
// (robots.txt already disallows most of these paths; the header is defence in
// depth and also covers direct/internal links Google may still discover.)
import { getMethod, getRequestURL, setHeader } from 'h3'

const NOINDEX_PREFIXES = [
  '/admin',
  '/auth',
  '/profile',
  '/pay',
  '/blog/post',
  '/prompts/public',
  '/prompts/edit',
  '/shares',
]

export default defineEventHandler((event) => {
  const method = getMethod(event)
  if (method !== 'GET' && method !== 'HEAD') return

  const url = getRequestURL(event)
  // Strip a locale prefix (en has none) before matching.
  const path = url.pathname.replace(/^\/(zh|ja|de|fr|ar)(?=\/|$)/, '') || '/'
  const isPrivate = NOINDEX_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  )
  if (isPrivate) setHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive')
})

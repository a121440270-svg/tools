// Permanent redirects for duplicate URL shapes.
//
// Google Search Console reports two groups that are pure URL-canonicalisation
// noise rather than missing content:
//   * `https://onlitools.com/de/` … `/ar/` answered **307** (Nitro's automatic
//     trailing-slash normalisation), so Google kept the slash variant in
//     "Page with redirect" instead of consolidating it.
//   * `/en/date-format` 404s: the i18n strategy is `prefix_except_default`, so
//     the default locale is unprefixed and `/en/**` is not a route at all.
//
// Both now answer 301, which merges the signals and drops the variants from the
// index. Prerendered HTML is served by Workers Static Assets before the Worker
// runs, so this only covers Worker-routed (dynamic) paths — which is exactly the
// set that produced the 307s.
import { getMethod, getRequestURL, sendRedirect } from 'h3'

const DEFAULT_LOCALE_PREFIX = '/en'

export default defineEventHandler((event) => {
  const method = getMethod(event)
  if (method !== 'GET' && method !== 'HEAD') return

  const url = getRequestURL(event)
  const pathname = url.pathname

  if (pathname === DEFAULT_LOCALE_PREFIX || pathname.startsWith(`${DEFAULT_LOCALE_PREFIX}/`)) {
    const target = new URL(url.toString())
    target.pathname = pathname.slice(DEFAULT_LOCALE_PREFIX.length) || '/'
    return sendRedirect(event, target.toString(), 301)
  }

  if (pathname.length > 1 && pathname.endsWith('/')) {
    const target = new URL(url.toString())
    target.pathname = pathname.replace(/\/+$/, '') || '/'
    return sendRedirect(event, target.toString(), 301)
  }
})

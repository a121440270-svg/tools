// Consolidate non-canonical hosts onto https://onlitools.com.
//
// Google Search Console currently shows impressions split across
// `http://onlitools.com`, `http://www.onlitools.com` and
// `https://www.onlitools.com`. The canonical tags already point at the apex
// https URL, but a 301 merges the signals much faster.
//
// Note: prerendered HTML is served from Workers Static Assets before the
// Worker runs, so this middleware only covers worker-routed requests. The
// complete fix is a Cloudflare Redirect Rule (see docs/seo-remediation.md):
//   - www.onlitools.com/*  -> https://onlitools.com/$1
//   - http://onlitools.com -> https://onlitools.com (Always Use HTTPS)

// Imported explicitly: Nitro auto-imports `defineEventHandler` but not every
// h3 helper, and an unimported identifier only fails at request time.
// Note: h3 v1 exports `getMethod` (the `getRequestMethod` name is h3 v2).
import { getMethod, getRequestURL, getRequestHeader, sendRedirect } from 'h3'

const CANONICAL_HOST = 'onlitools.com'
const KNOWN_SITE_HOSTS = new Set([CANONICAL_HOST, 'www.onlitools.com'])

export default defineEventHandler((event) => {
  const method = getMethod(event)
  if (method !== 'GET' && method !== 'HEAD') return

  const url = getRequestURL(event)
  if (!KNOWN_SITE_HOSTS.has(url.hostname)) return

  const isWww = url.hostname === 'www.onlitools.com'
  // `x-forwarded-proto` reflects the visitor's scheme on Cloudflare; the URL
  // protocol alone can be misleading behind proxies.
  const forwardedProto = (getRequestHeader(event, 'x-forwarded-proto') || url.protocol.replace(':', '')).split(',')[0]!.trim()

  if (!isWww && forwardedProto === 'https') return

  const target = new URL(url.toString())
  target.protocol = 'https:'
  target.hostname = CANONICAL_HOST
  return sendRedirect(event, target.toString(), 301)
})

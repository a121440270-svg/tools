// Shared helpers for the edge HTML cache.
//
// The free Workers plan allows 10 ms of CPU per request, and a full Nuxt SSR
// render easily costs more than that. Every page that is not prerendered at
// build time (blog, sitemap, 404s) is therefore cached in the Cloudflare
// edge cache so that repeat traffic is answered without rendering.

const SKIP_PREFIXES = [
  '/api',
  '/_nuxt',
  '/__nuxt',
  '/admin',
  '/auth',
  '/profile',
  '/pay',
  '/prompts',
  '/shares'
]

// `i18n_redirected` is a language *preference* hint, not an auth session. The
// locale of a cacheable page comes from its URL prefix, so a response that
// only sets this cookie is safe to store (with the cookie stripped).
const PUBLIC_COOKIE_NAMES = new Set(['i18n_redirected'])

export function isEdgeCacheablePath(pathname: string) {
  return !SKIP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

/** `caches.default` only exists on the Workers runtime. */
export function getEdgeCache(): Cache | undefined {
  return (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default
}

/**
 * Cache by origin + pathname. Query strings never change the rendered HTML of
 * a cacheable route (locale is in the path), but crawlers append tracking
 * parameters constantly - keying on the full URL turned every one of those
 * into a fresh SSR render and a CPU-limit hit.
 */
export function getEdgeCacheKey(url: URL) {
  return `${url.origin}${url.pathname}`
}

/** Copy response headers into a cached response, dropping any Set-Cookie. */
export function cacheableHeaders(headers: Record<string, unknown>) {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === 'set-cookie') continue
    if (typeof value === 'string') out[key] = value
    else if (Array.isArray(value)) out[key] = value.map(String).join(', ')
  }
  return out
}

/**
 * Only skip caching when a response sets a real session cookie. Previously any
 * Set-Cookie (including the i18n preference cookie) disabled caching, which is
 * why crawlers kept re-rendering the same dynamic pages.
 */
export function hasPrivateCookie(headers: Record<string, unknown>) {
  const cookieValue = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === 'set-cookie'
  )?.[1]
  if (cookieValue == null) return false

  const values = Array.isArray(cookieValue) ? cookieValue : [cookieValue]
  const names = values
    .map((value) => String(value).split(';')[0]!.match(/^([^=]+)=/)?.[1]?.trim().toLowerCase())
    .filter((name): name is string => !!name)
  return names.some((name) => !PUBLIC_COOKIE_NAMES.has(name))
}

export function isPrivateResponse(headers: Record<string, unknown>) {
  const cacheControl = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === 'cache-control'
  )?.[1]
  return typeof cacheControl === 'string' && /private|no-store/i.test(cacheControl)
}

/** Schedule work without blocking the response when the runtime supports it. */
export function runInBackground(event: any, promise: Promise<unknown>) {
  const waitUntil =
    typeof event?.waitUntil === 'function'
      ? event.waitUntil.bind(event)
      : event?.context?.cloudflare?.context?.waitUntil?.bind(event.context.cloudflare.context)

  if (typeof waitUntil === 'function') {
    waitUntil(promise)
  } else {
    void promise
  }
}

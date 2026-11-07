// Shared helpers for the edge HTML cache.
//
// The free Workers plan allows 10 ms of CPU per request, and a full Nuxt SSR
// render easily costs more than that. Every page that is not prerendered at
// build time (blog, dynamic routes, 404s) is therefore cached in the Cloudflare
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

export function isEdgeCacheablePath(pathname: string) {
  return !SKIP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

/** `caches.default` only exists on the Workers runtime. */
export function getEdgeCache(): Cache | undefined {
  return (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default
}

export function hasSetCookie(headers: Record<string, unknown>) {
  return Object.keys(headers).some((key) => key.toLowerCase() === 'set-cookie')
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

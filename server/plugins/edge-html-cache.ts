import {
  getEdgeCache,
  hasSetCookie,
  isEdgeCacheablePath,
  isPrivateResponse,
  runInBackground
} from '../utils/edgeHtmlCache'

const HTML_TTL_SECONDS = 600
const NOT_FOUND_TTL_SECONDS = 120

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response: any, { event }: any) => {
    const store = getEdgeCache()
    if (!store || event.method !== 'GET') return

    const url = getRequestURL(event)
    if (!isEdgeCacheablePath(url.pathname)) return

    const status = response?.statusCode ?? 200
    if (status !== 200 && status !== 404) return

    const body = response?.body
    if (typeof body !== 'string' || body.length === 0) return

    const headers: Record<string, unknown> = response.headers ?? {}
    if (hasSetCookie(headers) || isPrivateResponse(headers)) return

    const ttl = status === 200 ? HTML_TTL_SECONDS : NOT_FOUND_TTL_SECONDS
    setHeader(event, 'cache-control', `public, max-age=60, stale-while-revalidate=${ttl}`)
    setHeader(event, 'x-edge-cache', 'MISS')

    const cached = new Response(body, {
      status,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': `public, max-age=${ttl}`
      }
    })

    runInBackground(event, store.put(url.toString(), cached))
  })
})

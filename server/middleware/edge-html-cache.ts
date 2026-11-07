import {
  getEdgeCache,
  isEdgeCacheablePath
} from '../utils/edgeHtmlCache'

export default defineEventHandler(async (event) => {
  const store = getEdgeCache()
  if (!store || event.method !== 'GET') return

  const url = getRequestURL(event)
  if (!isEdgeCacheablePath(url.pathname)) return

  const hit = await store.match(url.toString()).catch(() => undefined)
  if (!hit) return

  const body = await hit.text()
  setResponseStatus(event, hit.status)
  setHeader(event, 'content-type', 'text/html; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=600')
  setHeader(event, 'x-edge-cache', 'HIT')
  return body
})

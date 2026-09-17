import { defineEventHandler, getQuery } from 'h3'
import { getDb } from '../db/orm'

function setDeep(obj: any, path: string, value: any) {
  const keys = path.split('.')
  let cur = obj
  keys.forEach((k, idx) => {
    if (idx === keys.length - 1) {
      cur[k] = value
    } else {
      if (!cur[k]) cur[k] = {}
      cur = cur[k]
    }
  })
}

function normalizeRoute(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/\?.*$/, '')
    .replace(/#.*$/, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/\\/g, '/')
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rawLang = Array.isArray(query.lang) ? query.lang[0] : query.lang
  const rawRoute = Array.isArray(query.route) ? query.route[0] : query.route

  console.log('[page-lang-json] request query:', query)
  console.log('[page-lang-json] rawLang:', rawLang, 'type:', typeof rawLang)
  console.log('[page-lang-json] rawRoute:', rawRoute, 'type:', typeof rawRoute)

  const lang = typeof rawLang === 'string'
    ? rawLang
    : rawLang && typeof rawLang === 'object' && 'code' in rawLang
      ? String((rawLang as { code?: string }).code ?? '')
      : rawLang != null
        ? String(rawLang)
        : ''

  const route = normalizeRoute(rawRoute)
  const routeValues = Array.from(new Set(['all', route].filter(Boolean)))

  console.log('[page-lang-json] normalized lang:', lang)
  console.log('[page-lang-json] normalized route:', route)
  console.log('[page-lang-json] route values:', routeValues)

  let rows: Array<{ key: string; value: any }>
  try {
    if (!lang) {
      rows = []
    } else if (routeValues.length === 1) {
      rows = await getDb()
        .prepare('SELECT key, value FROM page_lang WHERE lang = ? AND route = ?')
        .bind(lang, routeValues[0])
        .all() as Array<{ key: string; value: any }>
    } else {
      const placeholders = routeValues.map(() => '?').join(', ')
      rows = await getDb()
        .prepare(`SELECT key, value FROM page_lang WHERE lang = ? AND (route = 'all' OR route IN (${placeholders}))`)
        .bind(lang, ...routeValues)
        .all() as Array<{ key: string; value: any }>
    }
  } catch (error) {
    console.error('[page-lang-json] D1 error:', error)
    throw error
  }

  console.log('[page-lang-json] sql rows count:', Array.isArray(rows) ? rows.length : 'not-array')

  const result = {}
  for (const row of rows) {
    setDeep(result, row.key, row.value)
  }
  console.log('[page-lang-json] final result keys:', Object.keys(result).slice(0, 10))
  return result
})

import { selectCon } from '~/server/db/orm'

type ArticleRow = {
  id: number
  last_mod_time: string
  posted_time: string
  slug: string | null
  lang_code: string
}

const SITE_URL = 'https://onlitools.com'

// Crawlers re-fetch sitemaps far more often than articles change. Cache the
// D1 result for a few minutes at module scope (which survives across requests
// handled by the same Worker isolate) so a sitemap crawl no longer pays for a
// full query + URL build on every hit.
const ROWS_TTL_MS = 5 * 60 * 1000
let cachedRows: { at: number; rows: ArticleRow[] } | null = null
let pendingRows: Promise<ArticleRow[]> | null = null

async function loadArticleRows(): Promise<ArticleRow[]> {
  const now = Date.now()
  if (cachedRows && now - cachedRows.at < ROWS_TTL_MS) return cachedRows.rows
  if (pendingRows) return pendingRows

  pendingRows = (async () => {
    const rows = await selectCon('article')
      .select([
        't.id',
        't.last_mod_time',
        't.posted_time',
        'l.slug',
        'l.lang_code',
      ])
      .fromAlias('t')
      .join('article_l l', 't.id = l.article_id')
      .in('l.lang_code', ['en', 'zh'])
      .where('t.published_at', '<=', new Date().toISOString())
      .orderBy('t.last_mod_time', 'DESC')
      .all<ArticleRow>()

    const list = Array.isArray(rows) ? rows : []
    cachedRows = { at: Date.now(), rows: list }
    return list
  })()

  try {
    return await pendingRows
  } finally {
    pendingRows = null
  }
}

function articlePath(slug: string | null | undefined, id: number) {
  const clean = (slug || '').trim().replace(/^\/+|\/+$/g, '')
  return clean ? `/blog/${clean}-${id}` : `/blog/${id}`
}

export default defineSitemapEventHandler(async () => {
  try {
    const rows = await loadArticleRows()

    // Group by article so both language versions can share hreflang alternatives.
    const byArticle = new Map<number, Partial<Record<'en' | 'zh', ArticleRow>>>()
    for (const row of rows) {
      if (!row?.id) continue
      const lang = row.lang_code === 'zh' ? 'zh' : 'en'
      const entry = byArticle.get(row.id) || {}
      if (!entry[lang]) entry[lang] = row
      byArticle.set(row.id, entry)
    }

    const urls: Array<Record<string, unknown>> = []

    for (const [id, entry] of byArticle) {
      const lastmod = entry.en?.last_mod_time || entry.zh?.last_mod_time ||
        entry.en?.posted_time || entry.zh?.posted_time

      for (const lang of ['en', 'zh'] as const) {
        const row = entry[lang]
        if (!row) continue
        const path = articlePath(row.slug, id)
        const loc = lang === 'en' ? path : `/${lang}${path}`
        const alternatives = (['en', 'zh'] as const)
          .filter((code) => entry[code])
          .map((code) => ({
            hreflang: code === 'zh' ? 'zh-CN' : 'en',
            href: SITE_URL + (code === 'en' ? articlePath(entry[code]!.slug, id) : `/zh${articlePath(entry[code]!.slug, id)}`),
          }))

        urls.push({
          loc,
          lastmod: lastmod ? new Date(lastmod).toISOString() : undefined,
          changefreq: 'monthly' as const,
          priority: 0.6,
          alternatives,
        })
      }
    }

    return urls
  } catch (error) {
    console.error('[sitemap] failed to load articles', error)
    return []
  }
})

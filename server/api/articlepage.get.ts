import { findArticles } from '~/server/dao/articleDao';
import { getCookie, getQuery } from 'h3'

function stripHtml(value: unknown) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event); // 获取 URL 查询参数
  // Prefer an explicit `lang` (SSR of a prefixed locale has no cookie yet) and
  // fall back to the i18n cookie for client-side requests.
  const lang = (typeof query.lang === 'string' && query.lang)
    || getCookie(event, 'i18n_redirected')
    || 'en';
  const excerpt = Boolean(query.excerpt)
  delete query.excerpt
  query.lang = lang; // 添加语言过滤条件
  const result: any = await findArticles(query); // 直接传入 Partial<Tool>

  // Listing views only need a short teaser; strip full article HTML so the
  // payload stays small on SSR pages.
  if (excerpt && Array.isArray(result?.list)) {
    result.list = result.list.map((item: any) => {
      const text = stripHtml(item?.content)
      return {
        ...item,
        content: undefined,
        summary: text.length > 200 ? `${text.slice(0, 197).trim()}…` : text
      }
    })
  }

  return result || []
});

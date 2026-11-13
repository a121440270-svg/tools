import { findArticleByIdAndLang, findArticleTranslationSlugs } from '~/server/dao/articleDao';
import { getCookie, getQuery, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event); // 获取 URL 查询参数
  // 获取 id，可以来自查询参数或路由参数
  const id = Number((query as any)?.id ?? event.context?.params?.id);
  if (!id || Number.isNaN(id)) {
    console.warn('Missing or invalid id', query);
    return [];
  }
  // 获取语言优先级：查询参数 -> 常见 i18n cookie -> 请求头 -> 默认 'en'
  // 尝试多个 cookie 名称（nuxt-i18n / vue-i18n 社区常用）
  const cookieCandidates = [
    'lang',
    'locale',
    'i18n_redirected',
    'i18n_locale',
    'nuxt-i18n'
  ]
  let lang: string | undefined = (query as any)?.lang
  if (!lang) {
    for (const c of cookieCandidates) {
      const v = getCookie(event, c)
      if (v) {
        lang = String(v)
        break
      }
    }
  }
  // fallback to Accept-Language header first language tag
  if (!lang) {
    const al = getHeader(event, 'accept-language') as string | undefined
    if (al) {
      // take the first language code, e.g. 'en-US,en;q=0.9' -> 'en'
      lang = al.split(',')[0].split(';')[0].trim().split('-')[0]
    }
  }
  lang = lang || 'en'
  // NOTE: never log the resolved article here. It carries the full markdown
  // body (tens of KB), and serialising it into Workers Logs on every request
  // pushes article renders past the 10 ms CPU limit of the Workers free plan
  // (Cloudflare error 1102 -> HTTP 503 to Googlebot and users).
  const wantsTranslations = ['1', 'true', 'yes'].includes(String((query as any)?.translations || ''))
  const [tools, translations] = await Promise.all([
    findArticleByIdAndLang(id, lang), // 传入 id 和 lang 两个参数
    wantsTranslations ? findArticleTranslationSlugs(id) : Promise.resolve([])
  ])
  if (!tools) return { article: null, articlel: null, translations }
  return { ...tools, translations }
});

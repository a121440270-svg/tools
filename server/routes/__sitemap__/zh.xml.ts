// Google Search Console still has the old `__sitemap__/zh.xml` submitted, but the
// sitemap module now emits `zh-CN.xml` because the locale language is `zh-CN`.
// Serve a permanent redirect so the stale URL resolves instead of returning 404.
export default defineEventHandler((event) => {
  return sendRedirect(event, '/__sitemap__/zh-CN.xml', 301)
})

// plugins/i18n.server.ts
export default defineNuxtPlugin(async (nuxtApp) => {
  const i18n = nuxtApp.$i18n as {
    locale: string | { code?: string }
    setLocaleMessage: (locale: string, messages: any) => void
  }

  // 从 cookie / headers / 路由里取当前语言
  const locale = typeof i18n.locale === 'string' ? i18n.locale : i18n.locale?.code || 'en'

  // 预加载数据库里的翻译
  const messages = await $fetch('/api/page-lang-json', {
    query: { lang: String(locale) }
  })

  // 设置到 i18n，保证 SSR 阶段可用
  i18n.setLocaleMessage(locale, messages)
})
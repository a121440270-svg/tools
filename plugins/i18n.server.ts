// plugins/i18n.server.ts
export default defineNuxtPlugin(async (nuxtApp) => {
  const i18n = nuxtApp.$i18n as {
    locale: string
    setLocaleMessage: (locale: string, messages: any) => void
  }

  // 从 cookie / headers / 路由里取当前语言
  const locale = i18n.locale || 'en'

  // 预加载数据库里的翻译
  const messages = await $fetch(`/api/page-lang-json?lang=${locale}`)

  // 设置到 i18n，保证 SSR 阶段可用
  i18n.setLocaleMessage(locale, messages)
})
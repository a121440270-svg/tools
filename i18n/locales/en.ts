export default defineI18nLocale(async (locale) => {
  return await $fetch(`/api/page-lang-json?lang=${locale}`)
})

// export default defineI18nLocale(locale => {
//   return $fetch(`/api/page-lang-json?lang=${locale}`)
// })

// i18n/locales/en.ts
// export default defineI18nLocale(async (locale) => {
//   try {
//     // 在 SSR 里，把关键头（cookie/authorization/host）透传给内部 API
//     const headers = import.meta.server
//       ? {
//           ...useRequestHeaders(['cookie', 'authorization']),
//           // 某些多租户或域名相关逻辑可能用到 host
//           host: useRequestHeaders().host
//         }
//       : undefined

//     const messages = await $fetch('/api/page-lang-json', {
//       query: { lang: String(locale) },
//       headers
//       // 如果你的多语言接口在外部域名，改成：
//       // baseURL: import.meta.server ? useRuntimeConfig().apiBase : undefined
//     })

//     // 确保是对象，避免 SSR 崩
//     return messages || {}
//   } catch (e) {
//     // 出错时返回空对象而不是抛错，避免 SSR 输出失败
//     if (import.meta.dev) console.error('i18n loader error:', e)
//     return {}
//   }
// })

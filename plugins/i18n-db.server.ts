// // filepath: d:\code\tools\plugins\i18n-db.server.ts
// export default defineNuxtPlugin(async (nuxtApp) => {
//   if (!process.server) return

//   const i18n = nuxtApp.$i18n as {
//     locale: string
//     setLocaleMessage: (locale: string, messages: any) => void
//   }
  
//   const route = useRoute()
//   const rawLang = route.params.lang || i18n.locale || 'en'
//   const lang = Array.isArray(rawLang) ? rawLang[0] : rawLang
// debugger
//   if (i18n.locale !== lang) {
//     try {
//       debugger
//       const messages = await $fetch(`/api/page-lang-json?lang=${lang}`)
//       i18n.setLocaleMessage(lang, messages)
//       const supportedLocales = ['en', 'ja', 'ko', 'ru', 'zh', 'de', 'fr']
//       if (supportedLocales.includes(lang)) {
//         i18n.locale = lang
//       } else {
//         console.warn(`Unsupported locale: ${lang}`)
//       }
//     } catch (err) {
//       console.error(`❌ Failed to load locale [${lang}] from DB:`, err)
//     }
//   }
// })

// export default defineI18nLocale(locale => {
//   return $fetch(`/api/${locale}`)
// })


export default defineI18nLocale(locale => {
  // for example, fetch locale messages from nuxt server
  return $fetch(`/api/page-lang-json?lang=${locale}`)
})
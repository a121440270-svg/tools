
export default defineI18nLocale(locale => {
  return $fetch(`/api/page-lang-json?lang=${locale}`)
})
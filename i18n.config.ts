import { createI18n } from 'vue-i18n'

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: () => import('./locales/en.json'),
    zh: () => import('./locales/zh.json'),
    ja: () => import('./locales/ja.json'),
    ko: () => import('./locales/ko.json'),
    ru: () => import('./locales/ru.json')
  }
})
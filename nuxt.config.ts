// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  nitro: {
    preset: "cloudflare_module",
    experimental: {
      database: true
    },
    database: {
      myDatabase: {
        connector: "cloudflare-d1",
        options: {
          bindingName: "D1Database"
        }
      }
    }
  },
  modules: ['@nuxtjs/i18n','@nuxtjs/tailwindcss',"nitro-cloudflare-dev"],
  css: ['~/assets/css/main.css'],
  i18n: {
    defaultLocale: 'en',
    lazy: true,
    locales: [
      { code: 'en', name: 'English', file: 'en.ts' },
      { code: 'ja', name: '日语', file: 'en.ts' },
      { code: 'ko', name: '韩语', file: 'en.ts' },
      { code: 'ru', name: '俄语', file: 'en.ts' },
      { code: 'zh', name: '中文', file: 'zh.ts' }
    ]
  }
})
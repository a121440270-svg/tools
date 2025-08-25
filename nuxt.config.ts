// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  nitro: {
    preset: "cloudflare_module",
    renderer: process.env.NITRO_PRESET === 'cloudflare_module'
      ? 'node' // 让它走 Node SSR 渲染模式（非流式）
      : undefined,
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
    lazy: false,
    langDir: 'locales/',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', name: 'English', file: 'en.ts' },
      { code: 'ja', name: '日语', file: 'en.ts' },
      { code: 'ko', name: '韩语', file: 'en.ts' },
      { code: 'ru', name: '俄语', file: 'en.ts' },
      { code: 'zh', name: '中文', file: 'en.ts' }
    ]
  }
})
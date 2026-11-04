// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      baiduMapAk: ''
    }
  },
  app: {
    head: {
      // AdSense is loaded conditionally per route in layouts/default.vue so that
      // noindex pages (admin, auth, profile, pay, 404) never carry the ad script.
      meta: [
        { name: "google-adsense-account", content: "ca-pub-1963722206933589" }, // 如果需要
                {
          name: 'baidu-site-verification',
          content: 'codeva-BmOApso5X8'
        }
      ]
    }
  },
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
  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    "nitro-cloudflare-dev",
    '@nuxtjs/sitemap',
  ],
  css: ['~/assets/css/main.css'],
  i18n: {
    baseUrl: 'https://onlitools.com',
    defaultLocale: 'en',
    fallbackLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: false,
      fallbackLocale: 'en'
    },
    lazy: false,
    langDir: 'locales/',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', name: 'English', language: 'en', file: 'en.json' },
      { code: 'ja', name: '日本語', language: 'ja', file: 'ja.json' },
      { code: 'zh', name: 'Chinese', language: 'zh-CN', file: 'zh.json' },
      { code: 'de', name: 'German', language: 'de', file: 'de.json' },
      { code: 'fr', name: 'French', language: 'fr', file: 'fr.json' },
      { code: 'ar', name: 'العربية', language: 'ar', file: 'ar.json' }
    ]
  }, site: {
    url: 'https://onlitools.com',
    name: 'OnliTool - Online Tools for Developers'
  }, sitemap: {
    // Blog articles are generated from the D1 database by this endpoint.
    sources: ['/api/__sitemap__/articles'],
    exclude: [
      '/admin/**',
      '/auth/**',
      '/profile',
      '/pay/**',
      '/blog/post',
      '/prompts/**',
      '/shares/**',
      '/send-script-to-remote-user/**'
    ],
    defaults: {
      changefreq: 'weekly',
      priority: 0.7
    }
  }
})
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
  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    "nitro-cloudflare-dev",
    ['nuxt-simple-sitemap', {
      siteUrl: 'https://onlitools.com', // 你的网站域名
      autoLastmod: true,
      xsl: false,
      exclude: [
        '/admin/**', // 排除 admin 目录下所有页面
        '/login',    // 排除登录页
        '/dashboard',// 也可以单独排除页面
      ],
      // ✅ 自动读取 nuxt 路由 (pages 目录)
      autoI18n: true,
      defaultLocale: 'en',
      locales: ['en', 'zh'],
      // ✅ 动态路由走数据库
      urls: async () => {
        const urls: { loc: string, lastmod?: string }[] = []

        // 示例：从数据库取文章
        // const articles = await $fetch('/api/articles') // 假设接口返回 [{ slug: "hello-world" }]
        // for (const article of articles) {
        //   urls.push({
        //     loc: `/article/${article.slug}`,
        //     lastmod: article.updated_at
        //   })
        // }

        return urls
      }
    }]
  ],
  css: ['~/assets/css/main.css'],
  i18n: {
    defaultLocale: 'en',
    lazy: false,
    langDir: 'locales/',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', name: 'English', file: 'en.ts' },
      // { code: 'ja', name: '日语', file: 'en.ts' },
      // { code: 'ko', name: '韩语', file: 'en.ts' },
      // { code: 'ru', name: '俄语', file: 'en.ts' },
      { code: 'zh', name: '中文', file: 'en.ts' }
    ]
  },
})
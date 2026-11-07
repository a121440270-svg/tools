// https://nuxt.com/docs/api/configuration/nuxt-config
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

// Pages that only make sense for a signed-in request (admin/auth/pay) or that
// render data from D1 at request time (blog/prompts) are NOT prerendered.
const PRERENDER_EXCLUDE = ['/admin', '/auth', '/profile', '/pay', '/blog', '/prompts']

// Locales other than the default one are served under a path prefix
// (strategy: 'prefix_except_default').
const PRERENDER_LOCALES = ['zh', 'ja', 'de', 'fr', 'ar']

function collectStaticRoutes(dir = 'pages', prefix = ''): string[] {
  const routes: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      routes.push(...collectStaticRoutes(join(dir, entry.name), `${prefix}/${entry.name}`))
      continue
    }
    if (!entry.name.endsWith('.vue')) continue
    const base = entry.name.replace(/\.vue$/, '')
    // Dynamic routes ([id], [format], ...) need a real request to resolve.
    if (base.includes('[')) continue
    routes.push(base === 'index' ? (prefix || '/') : `${prefix}/${base}`)
  }
  return routes
}

const isExcluded = (route: string) =>
  PRERENDER_EXCLUDE.some((prefix) => route === prefix || route.startsWith(`${prefix}/`))

const staticRoutes = collectStaticRoutes().filter((route) => !isExcluded(route))

// Prerendered HTML is uploaded as a static asset and served by Cloudflare
// without invoking the Worker, which is what keeps us inside the free plan
// CPU budget (10 ms per request).
const prerenderRoutes = [
  ...staticRoutes,
  ...PRERENDER_LOCALES.flatMap((code) =>
    staticRoutes.map((route) => (route === '/' ? `/${code}` : `/${code}${route}`))
  )
]

export default defineNuxtConfig({
  // Inlining every stylesheet into the SSR HTML added ~480 kB to each page,
  // which is pure CPU and bandwidth on the Worker. Ship one cacheable CSS file
  // instead.
  features: {
    inlineStyles: false
  },
  routeRules: {
    // These pages are noindex, user specific and heavy (Element Plus), so there
    // is no SEO value in server rendering them.
    '/admin/**': { ssr: false },
    '/auth/**': { ssr: false },
    '/profile': { ssr: false },
    '/pay/**': { ssr: false },
    // The prompt list itself is indexable, so it keeps server rendering (and is
    // edge cached). Only the private/editor views are client rendered.
    '/prompts/public': { ssr: false },
    '/prompts/edit/**': { ssr: false },
    '/blog/post': { ssr: false }
  },
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
    prerender: {
      routes: prerenderRoutes,
      crawlLinks: false,
      failOnError: false
    },
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
// https://nuxt.com/docs/api/configuration/nuxt-config
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

// Pages that only make sense for a signed-in request (admin/auth/pay) or that
// render data from D1 at request time (blog/prompts) are NOT prerendered.
const PRERENDER_EXCLUDE = ['/admin', '/auth', '/profile', '/pay', '/blog', '/prompts', '/uppercase']

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

// `collectStaticRoutes()` skips any file with a `[param]` segment, so the WebP
// converter pages rendered by `[format]-to-webp.vue` and `webp-to-[target].vue`
// were missing from both the prerender list and the sitemap. List the real URLs
// explicitly so they get prerendered HTML and a sitemap entry per locale.
const EXTRA_PRERENDER_ROUTES = ['/png-to-webp', '/jpg-to-webp', '/webp-to-png', '/webp-to-jpg']

const staticRoutes = [...collectStaticRoutes(), ...EXTRA_PRERENDER_ROUTES]
  .filter((route) => !isExcluded(route))

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
  experimental: {
    // Nitro writes `_payload.json` under the raw route key when prerendering.
    // For the root route that key is "/", which unstorage rejects, so the whole
    // homepage render failed and `/` fell back to runtime SSR. Inlining the
    // payload keeps the homepage prerendered like every other page.
    payloadExtraction: false
  },
  vite: {
    plugins: [
      {
        name: 'drop-unused-ort-wasm',
        apply: 'build',
        enforce: 'post',
        generateBundle(_options, bundle) {
          // `@imgly/background-removal` (used only on /id-photo) loads the
          // ONNX runtime wasm from its own CDN via `config.publicPath`, so the
          // copies Vite emits while bundling `onnxruntime-web` are never
          // requested. They weigh ~28 MB each and Cloudflare Workers rejects
          // any asset over 25 MiB, which made `wrangler deploy` fail.
          for (const fileName of Object.keys(bundle)) {
            if (/_nuxt\/ort-wasm-[^/]*\.wasm$/.test(fileName)) {
              delete bundle[fileName]
            }
          }
        }
      }
    ]
  },
  routeRules: {
    // `/uppercase` used to render a 200 page containing only a meta refresh,
    // which Google treats as a soft 404. Make it a real 301 instead.
    '/uppercase': { redirect: { to: '/case-converter', statusCode: 301 } },
    '/upper-case': { redirect: { to: '/case-converter', statusCode: 301 } },
    '/zh/uppercase': { redirect: { to: '/zh/case-converter', statusCode: 301 } },
    '/zh/upper-case': { redirect: { to: '/zh/case-converter', statusCode: 301 } },
    '/ja/uppercase': { redirect: { to: '/ja/case-converter', statusCode: 301 } },
    '/ja/upper-case': { redirect: { to: '/ja/case-converter', statusCode: 301 } },
    '/de/uppercase': { redirect: { to: '/de/case-converter', statusCode: 301 } },
    '/de/upper-case': { redirect: { to: '/de/case-converter', statusCode: 301 } },
    '/fr/uppercase': { redirect: { to: '/fr/case-converter', statusCode: 301 } },
    '/fr/upper-case': { redirect: { to: '/fr/case-converter', statusCode: 301 } },
    '/ar/uppercase': { redirect: { to: '/ar/case-converter', statusCode: 301 } },
    '/ar/upper-case': { redirect: { to: '/ar/case-converter', statusCode: 301 } },
    // `/image-to-webp` is rendered by the [format]-to-webp template with
    // format="image", so its H1/title degrade to "JPG/PNG to WebP" and it
    // competes with the two exact-match pages. Keep /png-to-webp and
    // /jpg-to-webp and fold the generic URL onto /png-to-webp.
    '/image-to-webp': { redirect: { to: '/png-to-webp', statusCode: 301 } },
    '/zh/image-to-webp': { redirect: { to: '/zh/png-to-webp', statusCode: 301 } },
    '/ja/image-to-webp': { redirect: { to: '/ja/png-to-webp', statusCode: 301 } },
    '/de/image-to-webp': { redirect: { to: '/de/png-to-webp', statusCode: 301 } },
    '/fr/image-to-webp': { redirect: { to: '/fr/png-to-webp', statusCode: 301 } },
    '/ar/image-to-webp': { redirect: { to: '/ar/png-to-webp', statusCode: 301 } },
    // `/metadata-analyzer` and `/image-metadata-remover` render exactly the same
    // component as `/image-info` and `/remove-exif` (only the i18n copy differs),
    // so they were thin duplicates splitting the same cluster. Fold them onto
    // the surviving pages. `/exif-editor` is kept: it is the only tool that can
    // actually edit EXIF/GPS, so it is not a duplicate.
    '/metadata-analyzer': { redirect: { to: '/image-info', statusCode: 301 } },
    '/zh/metadata-analyzer': { redirect: { to: '/zh/image-info', statusCode: 301 } },
    '/ja/metadata-analyzer': { redirect: { to: '/ja/image-info', statusCode: 301 } },
    '/de/metadata-analyzer': { redirect: { to: '/de/image-info', statusCode: 301 } },
    '/fr/metadata-analyzer': { redirect: { to: '/fr/image-info', statusCode: 301 } },
    '/ar/metadata-analyzer': { redirect: { to: '/ar/image-info', statusCode: 301 } },
    '/image-metadata-remover': { redirect: { to: '/remove-exif', statusCode: 301 } },
    '/zh/image-metadata-remover': { redirect: { to: '/zh/remove-exif', statusCode: 301 } },
    '/ja/image-metadata-remover': { redirect: { to: '/ja/remove-exif', statusCode: 301 } },
    '/de/image-metadata-remover': { redirect: { to: '/de/remove-exif', statusCode: 301 } },
    '/fr/image-metadata-remover': { redirect: { to: '/fr/remove-exif', statusCode: 301 } },
    '/ar/image-metadata-remover': { redirect: { to: '/ar/remove-exif', statusCode: 301 } },
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
    // `@nuxtjs/sitemap` normally lists prerendered pages through its
    // `nuxt:prerender` source, but it only builds that source when sitemaps
    // themselves are prerendered (`crawlLinks` or a static target). This site
    // serves sitemaps from the Worker so new D1 articles show up without a
    // rebuild, so the module drops every prerendered page from `nuxt:pages`
    // (dedupe) and never adds it back — which left the sitemaps with only
    // runtime pages such as `/blog`. Feed the prerender list back in
    // explicitly; the module still derives hreflang groups and per-locale
    // sitemap membership from the locale prefixes.
    urls: prerenderRoutes,
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
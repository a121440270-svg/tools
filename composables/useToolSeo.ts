import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useHead, useI18n, useRoute, useRuntimeConfig, useSwitchLocalePath } from '#imports'

export type ToolFaqItem = {
  q: string
  a: string
}

export type ToolBreadcrumbItem = {
  name: string
  /** Route path without a locale prefix, e.g. `/image-compress`. */
  path: string
}

// Slugs that should not be title-cased blindly (units, formats, acronyms).
const UPPERCASE_SEGMENTS = new Set([
  'ai', 'api', 'css', 'csv', 'exif', 'gif', 'gps', 'heic', 'html', 'http', 'https',
  'id', 'ip', 'jpg', 'jpeg', 'json', 'mb', 'kb', 'otf', 'pdf', 'png', 'qr', 'svg',
  'ttf', 'ui', 'url', 'ux', 'webp', 'woff', 'woff2', 'xmp'
])
const LOWERCASE_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'vs', 'with'])

function titleizeSegment(segment: string) {
  return segment
    .split('-')
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (UPPERCASE_SEGMENTS.has(lower)) return lower.toUpperCase()
      if (index > 0 && LOWERCASE_WORDS.has(lower)) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

const SEGMENT_LABELS: Record<string, string> = {
  alternatives: 'Alternatives',
  about: 'About',
  contact: 'Contact',
  privacy: 'Privacy',
  terms: 'Terms',
  'image-metadata': 'Image Metadata',
  'exif-guide': 'EXIF Guide',
  'font-compress': 'Font Compressor',
  toolmole: 'ToolMole'
}

/** Site-wide social/AI preview image (1200x630). */
const DEFAULT_OG_IMAGE_PATH = '/og/onlitool-og.png'

/** Schema.org types that should be treated as articles rather than apps. */
const ARTICLE_TYPES = new Set(['Article', 'BlogPosting', 'NewsArticle', 'TechArticle'])

export function useToolSeo(options: {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  keywords?: MaybeRefOrGetter<string>
  applicationCategory?: string
  featureList?: MaybeRefOrGetter<string[]>
  faqItems?: MaybeRefOrGetter<ToolFaqItem[]>
  schemaProperties?: MaybeRefOrGetter<Record<string, unknown>>
  audience?: MaybeRefOrGetter<string>
  type?: string
  /** Pass an explicit list, or `false` to disable. Omit to derive from the route. */
  breadcrumbs?: MaybeRefOrGetter<ToolBreadcrumbItem[] | false>
  /** ISO date shown as `dateModified` on the page schema. */
  dateModified?: MaybeRefOrGetter<string>
  /**
   * Absolute URL or root-relative path to use as the canonical URL. Useful for
   * paginated listings where `?page=N` should self-canonicalise instead of
   * pointing every page at the bare route.
   */
  canonical?: MaybeRefOrGetter<string>
  /**
   * Locale codes this page's body copy is actually authored in. Locales that
   * are not listed get their canonical folded onto the default (English) URL
   * and are dropped from the hreflang cluster, so Google does not keep them
   * as untranslated duplicates. Use for pages whose copy is inline English /
   * Chinese only (legal and alternatives pages).
   */
  translatedLocales?: MaybeRefOrGetter<string[]>
}) {
  const route = useRoute()
  const { locale, locales } = useI18n()
  const switchLocalePath = useSwitchLocalePath()
  const runtimeConfig = useRuntimeConfig()
  const baseUrl = runtimeConfig.public?.siteUrl || 'https://onlitools.com'
  // BCP 47 code (e.g. `zh-CN`). Cloudflare/i18n exposes it as `language`; the
  // short `code` is only the routing prefix.
  const localeObjects = computed(() => locales.value as Array<{ code: string; language?: string }>)
  const languageCode = computed(
    () => localeObjects.value.find((item) => item.code === locale.value)?.language || locale.value
  )
  const localizedPath = computed(() => switchLocalePath(locale.value) || route.path)
  // Locales the page body copy is actually authored in. Anything outside this
  // set canonicalises onto the default (English) URL instead of itself.
  const translatedCodes = computed(() => {
    if (options.translatedLocales === undefined) return localeObjects.value.map((item) => item.code)
    return toValue(options.translatedLocales)
  })
  const defaultLocalePath = computed(() => switchLocalePath('en') || route.path)
  const canonicalUrl = computed(() => {
    const explicit = options.canonical ? toValue(options.canonical) : ''
    if (explicit) return explicit.startsWith('http') ? explicit : `${baseUrl}${explicit}`
    if (!translatedCodes.value.includes(locale.value)) {
      return `${baseUrl}${defaultLocalePath.value}`
    }
    return `${baseUrl}${localizedPath.value}`
  })
  const localePrefix = computed(() => (locale.value === 'en' ? '' : `/${locale.value}`))
  const alternateLinks = computed(() => [
    ...localeObjects.value
      .filter((item) => translatedCodes.value.includes(item.code))
      .map((item) => ({
        rel: 'alternate',
        hreflang: item.language || item.code,
        href: `${baseUrl}${switchLocalePath(item.code) || route.path}`
      })),
    {
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${baseUrl}${defaultLocalePath.value}`
    }
  ])

  const routeBreadcrumbs = computed<ToolBreadcrumbItem[]>(() => {
    const path = route.path.replace(/^\/(zh|ja|de|fr|ar)(?=\/|$)/, '').replace(/\/+$/, '') || '/'
    if (path === '/') return []
    const segments = path.split('/').filter(Boolean)
    const items: ToolBreadcrumbItem[] = []
    let accumulated = ''
    for (const segment of segments) {
      accumulated += `/${segment}`
      items.push({
        name: SEGMENT_LABELS[segment] || titleizeSegment(segment),
        path: accumulated
      })
    }
    return items
  })

  const breadcrumbItems = computed<ToolBreadcrumbItem[]>(() => {
    if (options.breadcrumbs !== undefined) {
      const explicit = toValue(options.breadcrumbs)
      return Array.isArray(explicit) ? explicit : []
    }
    return routeBreadcrumbs.value
  })

  const crumbUrl = (path: string) => {
    if (path === '/') return `${baseUrl}${localePrefix.value || ''}/`
    return `${baseUrl}${localePrefix.value}${path}`
  }

  useHead(() => {
    const title = toValue(options.title)
    const description = toValue(options.description)
    const keywords = options.keywords ? toValue(options.keywords) : ''
    const featureList = options.featureList ? toValue(options.featureList) : []
    const faqItems = options.faqItems ? toValue(options.faqItems) : []
    const schemaProperties = options.schemaProperties ? toValue(options.schemaProperties) : {}
    const audience = options.audience ? toValue(options.audience) : ''
    const dateModified = options.dateModified ? toValue(options.dateModified) : ''
    const crumbs = breadcrumbItems.value
    const isArticle = ARTICLE_TYPES.has(options.type || '')
    const ogImage = `${baseUrl}${DEFAULT_OG_IMAGE_PATH}`
    const ogLocale = languageCode.value.replace('-', '_')
    const ogType = isArticle ? 'article' : 'website'
    const faqSchema = faqItems.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a,
            }
          }))
        }
      : null

    const breadcrumbSchema = crumbs.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: crumbUrl('/')
            },
            ...crumbs.map((crumb, index) => ({
              '@type': 'ListItem',
              position: index + 2,
              name: crumb.name,
              item: crumbUrl(crumb.path)
            }))
          ]
        }
      : null

    const applicationSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': options.type || 'WebApplication',
      name: title,
      description,
      url: canonicalUrl.value,
      inLanguage: languageCode.value,
      image: ogImage,
      ...(dateModified ? { dateModified } : {}),
      ...(keywords ? { keywords } : {}),
    }
    if (applicationSchema['@type'] === 'WebApplication') {
      Object.assign(applicationSchema, {
        applicationCategory: options.applicationCategory || 'UtilitiesApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        isAccessibleForFree: true,
        ...(featureList.length ? { featureList } : {}),
        ...(audience ? { audience: { '@type': 'Audience', audienceType: audience } } : {})
      })
    }
    if (isArticle) {
      Object.assign(applicationSchema, {
        headline: title,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl.value },
        publisher: { '@id': `${baseUrl}/#organization` }
      })
    }
    Object.assign(applicationSchema, schemaProperties)

    return {
      htmlAttrs: { lang: languageCode.value, dir: locale.value === 'ar' ? 'rtl' : 'ltr' },
      title,
      meta: [
        { name: 'description', content: description },
        ...(keywords ? [{ name: 'keywords', content: keywords }] : []),
        { property: 'og:site_name', content: 'OnliTool' },
        { property: 'og:locale', content: ogLocale },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: ogType },
        { property: 'og:url', content: canonicalUrl.value },
        { property: 'og:image', content: ogImage },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: title },
        ...(dateModified ? [{ property: 'article:modified_time', content: dateModified }] : []),
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: ogImage },
        { name: 'twitter:image:alt', content: title }
      ],
      link: [{ rel: 'canonical', href: canonicalUrl.value }, ...alternateLinks.value],
      script: [
        { type: 'application/ld+json', children: JSON.stringify(applicationSchema) },
        ...(breadcrumbSchema ? [{ type: 'application/ld+json', children: JSON.stringify(breadcrumbSchema) }] : []),
        ...(faqSchema ? [{ type: 'application/ld+json', children: JSON.stringify(faqSchema) }] : [])
      ]
    }
  })
}

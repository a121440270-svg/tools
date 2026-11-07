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
}) {
  const route = useRoute()
  const { locale, locales } = useI18n()
  const switchLocalePath = useSwitchLocalePath()
  const runtimeConfig = useRuntimeConfig()
  const baseUrl = runtimeConfig.public?.siteUrl || 'https://onlitools.com'
  const localizedPath = computed(() => switchLocalePath(locale.value) || route.path)
  const canonicalUrl = computed(() => `${baseUrl}${localizedPath.value}`)
  const localePrefix = computed(() => (locale.value === 'en' ? '' : `/${locale.value}`))
  const alternateLinks = computed(() => [
    ...locales.value.map((item) => ({
      rel: 'alternate',
      hreflang: item.code,
      href: `${baseUrl}${switchLocalePath(item.code) || route.path}`
    })),
    {
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${baseUrl}${switchLocalePath('en') || route.path}`
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
      inLanguage: locale.value,
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
    Object.assign(applicationSchema, schemaProperties)

    return {
      htmlAttrs: { lang: locale.value },
      title,
      meta: [
        { name: 'description', content: description },
        ...(keywords ? [{ name: 'keywords', content: keywords }] : []),
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: canonicalUrl.value },
        ...(dateModified ? [{ property: 'article:modified_time', content: dateModified }] : []),
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description }
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

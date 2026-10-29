import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useHead, useI18n, useRoute, useRuntimeConfig, useSwitchLocalePath } from '#imports'

export type ToolFaqItem = {
  q: string
  a: string
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
}) {
  const route = useRoute()
  const { locale, locales } = useI18n()
  const switchLocalePath = useSwitchLocalePath()
  const runtimeConfig = useRuntimeConfig()
  const baseUrl = runtimeConfig.public?.siteUrl || 'https://onlitools.com'
  const localizedPath = computed(() => switchLocalePath(locale.value) || route.path)
  const canonicalUrl = computed(() => `${baseUrl}${localizedPath.value}`)
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

  useHead(() => {
    const title = toValue(options.title)
    const description = toValue(options.description)
    const keywords = options.keywords ? toValue(options.keywords) : ''
    const featureList = options.featureList ? toValue(options.featureList) : []
    const faqItems = options.faqItems ? toValue(options.faqItems) : []
    const schemaProperties = options.schemaProperties ? toValue(options.schemaProperties) : {}
    const audience = options.audience ? toValue(options.audience) : ''
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

    const applicationSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': options.type || 'WebApplication',
      name: title,
      description,
      url: canonicalUrl.value,
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
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description }
      ],
      link: [{ rel: 'canonical', href: canonicalUrl.value }, ...alternateLinks.value],
      script: [
        { type: 'application/ld+json', children: JSON.stringify(applicationSchema) },
        ...(faqSchema ? [{ type: 'application/ld+json', children: JSON.stringify(faqSchema) }] : [])
      ]
    }
  })
}

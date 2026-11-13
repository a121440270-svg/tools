<template>
  <div v-if="pending" class="text-center py-8">
    <span class="animate-spin">🔄</span> {{ $t('common.loading') }}
  </div>
  <div v-else-if="article">
    <div class="flex items-center justify-between mb-6">
      <NuxtLink 
        :to="localePath('/blog')" 
        class="flex items-center text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-foreground"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
        </svg>
        {{ $t('blog.backToList') }}
      </NuxtLink>
      
    </div>

    <div class="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-lg border dark:border-gray-700">
      <h1 class="text-3xl font-medium mb-6 dark:text-white">{{ article.title }}</h1>

      <div class="mb-4 flex flex-wrap gap-4 items-center">
        <span class="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{{ $t('blog.category') }}：{{ article.category }}</span>
        <span v-if="article.author" class="text-xs text-gray-500 dark:text-gray-400">{{ $t('blog.author') }}：{{ article.author }}</span>
        <!-- edit link shown only to the article author -->
      <span v-if="canEdit" class="text-xs text-gray-500 dark:text-gray-400">
        <NuxtLink :to="localePath(editLink)">
          {{ $t('blog.edit') }}
        </NuxtLink>
      </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('blog.lastUpdate') }}：{{ formatDate(article.last_mod_time) }}</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('blog.hits') }}：{{ article.hits }}</span>
        <div v-if="article.catalog && article.catalog.length" class="relative">
          <button @click="showCatalog = !showCatalog" class="text-primary underline text-xs">
            {{ showCatalog ? $t('blog.collapseCatalog') : $t('blog.expandCatalog') }}
          </button>
          <ul v-show="showCatalog" class="mt-2 ml-2 pl-4 border-l dark:border-gray-700 text-sm space-y-1">
            <li v-for="(item, idx) in article.catalog" :key="idx">{{ item }}</li>
          </ul>
        </div>
      </div>

      <div class="prose dark:prose-invert blog-content max-w-none" v-html="article.content">
      </div>
    </div>

    <!-- Related tools: keeps readers on-site and gives crawlers contextual internal links. -->
    <aside class="mt-8 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
      <h2 class="mb-2 text-lg font-medium dark:text-white">{{ related.title }}</h2>
      <p class="mb-4 text-sm text-gray-600 dark:text-gray-300">{{ related.description }}</p>
      <div class="grid gap-3 sm:grid-cols-3">
        <NuxtLink
          v-for="item in related.links"
          :key="item.to"
          :to="localePath(item.to)"
          class="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-primary transition hover:border-primary/40 hover:bg-primary/5 dark:border-gray-700"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
    </aside>

    <!-- Server-rendered links to other posts: spreads internal link equity across
         the whole blog instead of leaving posts to be discovered one by one. -->
    <aside v-if="moreArticles.length" class="mt-8 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
      <h2 class="mb-4 text-lg font-medium dark:text-white">{{ $t('blog.moreArticles') }}</h2>
      <ul class="space-y-3">
        <li v-for="item in moreArticles" :key="item.id" class="border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-700">
          <NuxtLink :to="articleLink(item)" class="font-medium text-gray-800 transition hover:text-primary dark:text-gray-100 dark:hover:text-primary-foreground">
            {{ item.title }}
          </NuxtLink>
          <p v-if="item.summary" class="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{{ item.summary }}</p>
        </li>
      </ul>
      <NuxtLink :to="localePath('/blog')" class="mt-4 inline-block text-sm font-medium text-primary">
        {{ $t('blog.viewAll') }} →
      </NuxtLink>
    </aside>
  </div>
</template>

<script setup>
import { useLocalePath } from '#i18n'
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

// Reactive so client-side navigation between posts refreshes the data instead of
// keeping the first article on screen.
const articleId = computed(() => {
  const parts = String(route.params.id || '').split('-')
  return parts[parts.length - 1]
})

const { data: articleRaw, pending, error: articleError } = await useFetch(
  () => `/api/articles/${articleId.value}?lang=${locale.value}&translations=1`
)

// Languages this article is actually published in (the blog only has en/zh).
const translations = computed(() =>
  (articleRaw.value?.translations || []).filter((item) => item && item.lang_code)
)
const slugFor = (code) => String(
  translations.value.find((item) => item.lang_code === code)?.slug || ''
).trim().replace(/^\/+|\/+$/g, '')
// `/{locale}/blog/{slug}-{id}`; an empty slug falls back to the bare id.
// Percent-encode so non-ASCII (zh) slugs produce valid canonical/hreflang URLs.
const articlePath = (code, slug) => {
  const clean = String(slug || '').trim().replace(/^\/+|\/+$/g, '')
  const prefix = code === 'en' ? '' : `/${code}`
  return encodeURI(`${prefix}/blog/${clean ? `${clean}-` : ''}${articleId.value}`)
}

// Untranslated locales used to render an empty 200 page whose canonical and
// hreflang claimed all six languages, which GSC reported as soft 404 / duplicate
// canonical. Send those requests (and slug variants) to the article's real URL —
// the English one when this locale has no translation — with a 301.
const canonicalPath = computed(() => {
  const target = translations.value.some((item) => item.lang_code === locale.value) ? locale.value : 'en'
  return articlePath(target, slugFor(target))
})

function samePath(a, b) {
  const norm = (value) => {
    try {
      return decodeURIComponent(value).normalize('NFC').replace(/\/+$/, '')
    } catch {
      return value.replace(/\/+$/, '')
    }
  }
  return norm(a) === norm(b)
}

if (articleRaw.value?.article && !samePath(String(route.path || '/'), canonicalPath.value)) {
  await navigateTo(canonicalPath.value, { redirectCode: 301 })
}

// `useAsyncData` requires a plain string key in Nuxt 3.16, so resolve it once
// and refetch via `watch` when the article or locale changes.
const { data: moreData } = await useAsyncData(
  `blog-more:${locale.value}:${articleId.value}`,
  () => $fetch('/api/articlepage', {
    params: { page: 1, pageSize: 8, sort: 'posted_time', lang: locale.value, excerpt: 1 }
  }),
  { watch: [articleId, locale] }
)

const moreArticles = computed(() => (moreData.value?.list || [])
  .filter((item) => String(item.id) !== String(articleId.value))
  .slice(0, 5))

const showCatalog = ref(true)

// attempt to get current user from common places (project may use different auth)
const currentUserState = useState ? useState('user') : null
const currentUser = computed(() => {
  if (!currentUserState) return null
  return currentUserState.value || null
})

// canEdit if current user's id or username matches article author fields
const canEdit = computed(() => {
  if (!article.value || !currentUser.value) return false
  // prefer authorId if backend provides it
  if (article.value.author_id && currentUser.value.id) {
    return String(article.value.author_id) === String(currentUser.value.id)
  }
  // fall back to username/email matching
  if (article.value.author && currentUser.value.username) {
    return String(article.value.author) === String(currentUser.value.username)
  }
  return false
})

const editLink = computed(() => {
  const lang = locale?.value || ''
  return { path: '/blog/post', query: { id: articleId.value, lang } }
})
const article = computed(() => {
  if (!articleRaw.value) return null
  // 兼容后端返回的 catalog 字段为字符串或数组
  let catalog = articleRaw.value.catalog
  if (typeof catalog === 'string') {
    catalog = catalog.split(',').map(i => i.trim()).filter(Boolean)
  }
  return { ...articleRaw.value.article,...articleRaw.value.articlel, catalog }
})

// `{...null}` is an empty object, so `article` alone is always truthy. Use the
// raw payload to distinguish "no article" from a real one: otherwise any
// `/blog/<garbage>` URL would answer 200 with a blank page (soft 404).
if (articleError.value) {
  throw createError({ statusCode: 500, statusMessage: 'Failed to load article', fatal: true })
}
if (!articleRaw.value?.article) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

const isZh = computed(() => String(locale.value || '').toLowerCase().startsWith('zh'))

const related = computed(() => isZh.value
  ? {
      title: '相关工具',
      description: '用这些免费工具在浏览器本地处理文件，无需上传。',
      links: [
        { to: '/font-compress', label: '字体压缩（TTF/OTF/WOFF2）' },
        { to: '/image-compress', label: '图片压缩' },
        { to: '/case-converter', label: '文本大小写转换' }
      ]
    }
  : {
      title: 'Related tools',
      description: 'Free browser-based tools that process your files locally, with no upload.',
      links: [
        { to: '/font-compress', label: 'Font compressor (TTF/OTF/WOFF2)' },
        { to: '/image-compress', label: 'Image compressor' },
        { to: '/case-converter', label: 'Case converter' }
      ]
    })

function articleLink(item) {
  const slug = String(item.slug || '').trim().replace(/^\/+|\/+$/g, '')
  return localePath(slug ? `/blog/${slug}-${item.id}` : `/blog/${item.id}`)
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const seoDescription = computed(() => {
  const explicit = article.value?.description || article.value?.summary
  if (explicit) {
    const text = stripHtml(explicit)
    return text.length > 160 ? `${text.slice(0, 157).trim()}…` : text
  }
  const text = stripHtml(article.value?.content)
  if (!text) return isZh.value ? '来自 OnliTool 博客的技术文章与实用教程。' : 'Technical articles and practical tutorials from the OnliTool blog.'
  return text.length > 160 ? `${text.slice(0, 157).trim()}…` : text
})

// Route path without the locale prefix, so breadcrumb URLs stay correct per locale.
const currentRelativePath = computed(
  () => (route.path || '').replace(/^\/(zh|ja|de|fr|ar)(?=\/|$)/, '') || '/'
)

const seoTitle = computed(() => {
  const title = article.value?.title || t('blog.defaultTitle') || 'Blog'
  return title.includes('OnliTool') ? title : `${title} | OnliTool`
})

useToolSeo({
  title: seoTitle,
  description: seoDescription,
  keywords: () => Array.isArray(article.value?.keywords)
    ? article.value.keywords.join(', ')
    : (article.value?.keywords || ''),
  type: 'BlogPosting',
  dateModified: () => article.value?.last_mod_time || '',
  breadcrumbs: () => article.value
    ? [
        { name: t('blog.name') || 'Blog', path: '/blog' },
        { name: article.value.title, path: currentRelativePath.value }
      ]
    : [{ name: t('blog.name') || 'Blog', path: '/blog' }],
  canonical: () => canonicalPath.value,
  // hreflang must use each language's own slug, otherwise the en page points
  // zh hreflang at a translated-slug URL that duplicates the sitemap entry.
  alternates: () => {
    const available = ['en', 'zh'].filter((code) => translations.value.some((item) => item.lang_code === code))
    const links = available.map((code) => ({
      hreflang: code === 'zh' ? 'zh-CN' : code,
      href: articlePath(code, slugFor(code))
    }))
    if (available.includes('en')) {
      links.push({ hreflang: 'x-default', href: articlePath('en', slugFor('en')) })
    }
    return links
  },
  translatedLocales: () => {
    const codes = translations.value.map((item) => item.lang_code)
    return codes.length ? codes : ['en', 'zh']
  },
  schemaProperties: () => ({
    headline: article.value?.title,
    description: seoDescription.value,
    datePublished: article.value?.posted_time,
    dateModified: article.value?.last_mod_time,
    articleSection: article.value?.category,
    inLanguage: isZh.value ? 'zh-CN' : 'en',
    author: article.value?.author
      ? { '@type': 'Person', name: article.value.author }
      : { '@type': 'Organization', name: 'OnliTool', url: 'https://onlitools.com' }
  })
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}
</script>

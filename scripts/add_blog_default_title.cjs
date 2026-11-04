// Add blog.defaultTitle to every locale (used as a fallback page title).
const fs = require('fs')
const path = require('path')
const dir = path.join(__dirname, '..', 'i18n', 'locales')
const titles = {
  en: 'Blog',
  zh: '博客',
  ja: 'ブログ',
  de: 'Blog',
  fr: 'Blog',
  ar: 'المدونة',
}
for (const [lang, value] of Object.entries(titles)) {
  const file = path.join(dir, `${lang}.json`)
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  data.blog = data.blog || {}
  if (!data.blog.defaultTitle) {
    data.blog.defaultTitle = value
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
    console.log(`${lang}: added blog.defaultTitle`)
  } else {
    console.log(`${lang}: already present`)
  }
}

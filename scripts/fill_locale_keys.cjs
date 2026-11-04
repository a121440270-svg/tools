// Fill missing i18n keys so no raw key (e.g. "blog.author") is rendered.
// Existing translations are preserved; only absent keys are copied from English
// as a safe fallback. Run: node scripts/fill_locale_keys.cjs
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, '..', 'i18n', 'locales')
const read = (lang) => JSON.parse(fs.readFileSync(path.join(dir, `${lang}.json`), 'utf8'))
const write = (lang, data) => {
  fs.writeFileSync(path.join(dir, `${lang}.json`), JSON.stringify(data, null, 2) + '\n', 'utf8')
}

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value)
const clone = (value) => JSON.parse(JSON.stringify(value))

function mergeMissing(target, source) {
  let added = 0
  for (const key of Object.keys(source)) {
    if (!(key in target)) {
      target[key] = clone(source[key])
      added += 1
    } else if (isObject(source[key]) && isObject(target[key])) {
      added += mergeMissing(target[key], source[key])
    }
  }
  return added
}

function setPath(obj, dotted, value) {
  const parts = dotted.split('.')
  let cur = obj
  for (const part of parts.slice(0, -1)) {
    if (!isObject(cur[part])) cur[part] = {}
    cur = cur[part]
  }
  cur[parts[parts.length - 1]] = value
}

const footer = {
  en: {
    about: 'About',
    blog: 'Blog',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    contact: 'Contact',
    rights: 'All rights reserved.',
    navLabel: 'Footer navigation',
  },
  zh: {
    about: '关于',
    blog: '博客',
    privacy: '隐私政策',
    terms: '服务条款',
    contact: '联系我们',
    rights: '保留所有权利。',
    navLabel: '页脚导航',
  },
  ja: {
    about: 'サイトについて',
    blog: 'ブログ',
    privacy: 'プライバシーポリシー',
    terms: '利用規約',
    contact: 'お問い合わせ',
    rights: 'All rights reserved.',
    navLabel: 'フッターナビゲーション',
  },
  de: {
    about: 'Über uns',
    blog: 'Blog',
    privacy: 'Datenschutzerklärung',
    terms: 'Nutzungsbedingungen',
    contact: 'Kontakt',
    rights: 'Alle Rechte vorbehalten.',
    navLabel: 'Fußzeilennavigation',
  },
  fr: {
    about: 'À propos',
    blog: 'Blog',
    privacy: 'Politique de confidentialité',
    terms: "Conditions d'utilisation",
    contact: 'Contact',
    rights: 'Tous droits réservés.',
    navLabel: 'Navigation de pied de page',
  },
  ar: {
    about: 'حول الموقع',
    blog: 'المدونة',
    privacy: 'سياسة الخصوصية',
    terms: 'شروط الخدمة',
    contact: 'اتصل بنا',
    rights: 'جميع الحقوق محفوظة.',
    navLabel: 'تنقل التذييل',
  },
}

const privacyExtras = {
  en: { policy: 'Privacy Policy', rejectAll: 'Reject optional' },
  zh: { policy: '隐私政策', rejectAll: '拒绝可选' },
  ja: { policy: 'プライバシーポリシー', rejectAll: '任意項目を拒否' },
  de: { policy: 'Datenschutzerklärung', rejectAll: 'Optionale ablehnen' },
  fr: { policy: 'Politique de confidentialité', rejectAll: 'Refuser les optionnels' },
  ar: { policy: 'سياسة الخصوصية', rejectAll: 'رفض الاختياري' },
}

const en = read('en')
en.footer = { ...(en.footer || {}), ...footer.en }
en.privacy = { ...(en.privacy || {}), ...privacyExtras.en }
write('en', en)

for (const lang of ['ja', 'zh', 'de', 'fr', 'ar']) {
  const data = read(lang)
  const added = mergeMissing(data, en)
  data.footer = { ...(data.footer || {}), ...footer[lang] }
  data.privacy = { ...(data.privacy || {}), ...privacyExtras[lang] }
  if (lang === 'zh') {
    data.jsonFormatter = { ...(data.jsonFormatter || {}), format: '格式化' }
  }
  write(lang, data)
  console.log(`${lang}: filled ${added} missing keys`)
}

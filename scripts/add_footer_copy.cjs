// Add the redesigned footer copy to every locale.
const fs = require('fs')
const path = require('path')
const dir = path.join(__dirname, '..', 'i18n', 'locales')

const copy = {
  en: {
    tagline: 'Free, privacy-friendly tools for developers, designers and anyone who needs to finish a file or text task quickly.',
    localFirst: 'Local-first · No sign-up required',
  },
  zh: {
    tagline: '免费、注重隐私的在线工具，面向开发者、设计师，以及任何需要快速处理文件或文本的人。',
    localFirst: '本地优先 · 无需注册',
  },
  ja: {
    tagline: '開発者やデザイナーのための、無料でプライバシーに配慮したツール。ファイルやテキストの作業をすばやく終えられます。',
    localFirst: 'ローカル優先・登録不要',
  },
  de: {
    tagline: 'Kostenlose, datenschutzfreundliche Tools für Entwickler, Designer und alle, die Datei- oder Textaufgaben schnell erledigen wollen.',
    localFirst: 'Lokal zuerst · Keine Anmeldung nötig',
  },
  fr: {
    tagline: 'Des outils gratuits et respectueux de la vie privée pour les développeurs, les designers et tous ceux qui veulent traiter un fichier ou un texte rapidement.',
    localFirst: "Local d'abord · Sans inscription",
  },
  ar: {
    tagline: 'أدوات مجانية تحترم الخصوصية للمطورين والمصممين وكل من يحتاج إلى إنجاز مهمة على ملف أو نص بسرعة.',
    localFirst: 'محلي أولاً · دون تسجيل',
  },
}

for (const [lang, values] of Object.entries(copy)) {
  const file = path.join(dir, `${lang}.json`)
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  data.footer = data.footer || {}
  data.footer.tagline = values.tagline
  data.footer.localFirst = values.localFirst
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`${lang}: footer copy updated`)
}

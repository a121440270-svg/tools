const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const localesDir = path.join(root, 'locales');
const used = new Set();
const keep = new Set([
  'locale.en', 'locale.zh', 'locale.ja', 'locale.ko', 'locale.ru',
  'login.title', 'login.welcome', 'login.email', 'login.password', 'login.submit', 'login.github', 'login.out',
  'auth.register', 'auth.create_account', 'auth.username', 'auth.confirm_password', 'auth.register_btn',
  'auth.no_account', 'auth.register_now', 'auth.have_account', 'auth.login_here', 'auth.email', 'auth.password',
  'auth.login_success', 'auth.login_failed', 'auth.register_failed', 'auth.password_mismatch',
  'menu.desc', 'menu.ttf', 'menu.filetype', 'menu.crypto', 'menu.token', 'menu.hash', 'menu.jsoncsv', 'menu.jsonFormatter',
  'home.title', 'home.seo_desc', 'home.seo_keywords', 'home.empty',
  'search.placeholder',
  'ttf.desc',
  'font.title', 'font.desc', 'font.upload', 'font.selected', 'font.origin_size', 'font.input_chars', 'font.input_placeholder',
  'font.char_count', 'font.upload_text', 'font.text_selected', 'font.output_type', 'font.start', 'font.clear', 'font.success',
  'font.download', 'font.only_glyphs', 'font.compressed_size', 'font.error', 'font.preview_generating', 'font.seo_desc', 'font.seo_keywords',
  'privacy.title', 'privacy.desc', 'privacy.necessary', 'privacy.analytics', 'privacy.ads', 'privacy.acceptAll', 'privacy.save',
  'blog.title', 'blog.backToList', 'blog.category', 'blog.edit', 'blog.lastUpdate', 'blog.hits', 'blog.pageSize', 'blog.items',
  'blog.gotoPage', 'blog.go', 'blog.author', 'blog.posted', 'blog.type', 'blog.write', 'blog.fetchError', 'blog.needLogin',
  'blog.seoDesc', 'blog.seoKeywords', 'blog.defaultTitle', 'blog.collapseCatalog', 'blog.expandCatalog', 'blog.loading',
  'about.meTitle', 'about.meText1', 'about.contactEmail', 'about.blogTitle', 'about.blogText', 'about.toolsTitle', 'about.toolsText',
  'about.langsTitle', 'about.langsList1', 'about.langsList2', 'about.langsList3', 'about.tabMe', 'about.tabBlog', 'about.tabTools', 'about.tabLangs',
  'uppercase.title', 'uppercase.desc', 'uppercase.inputLabel', 'uppercase.placeholder', 'uppercase.outputLabel', 'uppercase.outputPlaceholder',
  'uppercase.copyBtn', 'uppercase.clearBtn', 'uppercase.instructions.title', 'uppercase.instructions.input', 'uppercase.instructions.convert',
  'uppercase.instructions.copy', 'uppercase.instructions.clear', 'uppercase.tip',
  'idPhoto.title', 'idPhoto.subtitle', 'idPhoto.uploadText', 'idPhoto.uploadHint', 'idPhoto.preview', 'idPhoto.size', 'idPhoto.bgColor',
  'idPhoto.custom', 'idPhoto.download', 'idPhoto.reUpload', 'idPhoto.cutout', 'idPhoto.processing', 'idPhoto.cleared', 'idPhoto.cutoutSuccess',
  'idPhoto.cutoutError', 'idPhoto.sizes.oneInch', 'idPhoto.sizes.twoInch', 'idPhoto.sizes.smallOneInch', 'idPhoto.sizes.passport',
  'idPhoto.sizes.visa', 'idPhoto.sizes.socialSecurity', 'idPhoto.adjust', 'idPhoto.brightness', 'idPhoto.contrast', 'idPhoto.saturation',
  'idPhoto.crop', 'idPhoto.top', 'idPhoto.left', 'idPhoto.zoom', 'idPhoto.resetCrop', 'idPhoto.brushCutout', 'idPhoto.brushSize',
  'idPhoto.brushSizeValue', 'idPhoto.startPainting', 'idPhoto.stopPainting', 'idPhoto.removePaintedArea', 'idPhoto.paintHint', 'idPhoto.paintSuccess',
  'idPhoto.seoDesc', 'idPhoto.seoKeywords',
  'agnesImage.title', 'agnesImage.subtitle', 'agnesImage.seoDesc', 'agnesImage.footnote',
  'agnesVideo.title', 'agnesVideo.subtitle', 'agnesVideo.seoDesc', 'agnesVideo.footnote',
  'webp.title', 'webp.desc', 'webp.upload', 'webp.selected', 'webp.start', 'webp.clear', 'webp.success', 'webp.download_img', 'webp.download_zip',
  'webp.intro', 'webp.no_file', 'webp.error',
  'dateFormat.badge', 'dateFormat.title', 'dateFormat.description', 'dateFormat.copyResult', 'dateFormat.loadSample', 'dateFormat.clear',
  'dateFormat.detectedResult', 'dateFormat.inputLabel', 'dateFormat.fillSample', 'dateFormat.placeholder', 'dateFormat.outputFormat',
  'dateFormat.bestFormat', 'dateFormat.confidence', 'dateFormat.noInput', 'dateFormat.decodeResult', 'dateFormat.copyUtc',
  'dateFormat.resultPlaceholder', 'dateFormat.recognitionTitle', 'dateFormat.whyThis', 'dateFormat.best', 'dateFormat.alt', 'dateFormat.faqTitle',
  'dateFormat.scriptTitle', 'dateFormat.generateLanguage', 'dateFormat.runLocal', 'dateFormat.runDemo', 'dateFormat.copyScript',
  'dateFormat.runOutput', 'dateFormat.supportedFormats', 'dateFormat.whyThis', 'dateFormat.detectedResult', 'dateFormat.parsedCount',
  'prompts.title', 'prompts.write',
  'common.loading', 'common.save', 'common.edit', 'common.delete', 'common.cancel', 'common.ok', 'common.search', 'common.submit',
  'jsoncsv.title', 'jsoncsv.input_placeholder', 'jsoncsv.json_to_csv', 'jsoncsv.csv_to_json', 'jsoncsv.clear', 'jsoncsv.paste',
  'jsoncsv.result_title', 'jsoncsv.download', 'jsoncsv.copy', 'jsoncsv.copy_success', 'jsoncsv.copy_fail', 'jsoncsv.paste_success',
  'jsoncsv.paste_fail', 'jsoncsv.paste_not_supported', 'jsoncsv.json_to_csv_error', 'jsoncsv.csv_to_json_error', 'jsoncsv.seo_title',
  'jsoncsv.seo_description', 'jsoncsv.seo_keywords'
]);

const r = /\$t\(\s*['"`]([^'"`]+)['"`]\s*\)|t\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

for (const dir of ['pages', 'components', 'layouts', 'plugins', 'composables']) {
  const target = path.join(root, dir);
  if (!fs.existsSync(target)) continue;
  for (const ent of fs.readdirSync(target, { withFileTypes: true })) {
    const p = path.join(target, ent.name);
    if (ent.isDirectory()) {
      recurse(p);
    } else if (ent.isFile() && /\.(vue|ts|js)$/.test(ent.name)) {
      const txt = fs.readFileSync(p, 'utf8');
      let m;
      while ((m = r.exec(txt))) {
        for (const v of [m[1], m[2]]) {
          if (v && !v.includes('${')) used.add(v);
        }
      }
    }
  }
}

function recurse(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) recurse(p);
    else if (ent.isFile() && /\.(vue|ts|js)$/.test(ent.name)) {
      const txt = fs.readFileSync(p, 'utf8');
      let m;
      while ((m = r.exec(txt))) {
        for (const v of [m[1], m[2]]) {
          if (v && !v.includes('${')) used.add(v);
        }
      }
    }
  }
}

for (const file of fs.readdirSync(localesDir)) {
  if (!file.endsWith('.json') || file.includes('json-csv-convert')) continue;
  const fp = path.join(localesDir, file);
  const obj = JSON.parse(fs.readFileSync(fp, 'utf8'));

  const prune = (node, prefix = '') => {
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) return node;
    const out = {};
    for (const [key, value] of Object.entries(node)) {
      const full = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const child = prune(value, full);
        if (child && Object.keys(child).length) out[key] = child;
      } else if (used.has(full) || keep.has(full)) {
        out[key] = value;
      }
    }
    return out;
  };

  const pruned = prune(obj);
  fs.writeFileSync(fp, JSON.stringify(pruned, null, 2) + '\n', 'utf8');
  console.log(`${file}: ${Object.keys(pruned).length} top-level keys kept`);
}

console.log('used keys:', used.size);
console.log('done');

# P0 执行清单（零新页）

> 来源：`docs/demand-tools-audit.md` 第八节 P0 路线图。
> 目标：不改产品方向、不加新页，只做「改标题 / 补内链 / 收敛 URL / 补首屏」，把已有页面推进候选池。
> 前置事实（已实测，2026-11-13）：
> - `/uppercase` 301 → `/case-converter` **已生效**；`/image-to-webp`、`/png-to-webp`、`/jpg-to-webp` 由 `pages/[format]-to-webp.vue` 同一模板渲染；`/webp-to-png`、`/webp-to-jpg` 由 `pages/webp-to-[target].vue` 渲染。
> - `nuxt.config.ts` 的 `collectStaticRoutes()` 跳过 `[param]`，**5 个 WebP 页全部不在 prerender / sitemap**（`__sitemap__/en.xml` 319 条，webp 相关 0 条）。
> - 站点 `prerenderRoutes` 同时是 sitemap 的 `urls` 来源，所以「进 sitemap」= 「进 `prerenderRoutes`」。
> - `useToolSeo` 的 `title` 是原样输出（不拼站名），canonical 由路由自动推导。

## 总览

| # | 事项 | 类型 | 状态 | 改动文件 | 工时 |
|---|---|---|---|---|---|
| 1 | `/json-csv-convert` 冲首页 | 内容 + 内链 | **已完成** | `pages/json-csv-convert.vue`、`data/tool-content.ts`、6 语言 i18n | 0.5d |
| 2 | `/hash-text` 标题 + 文件 hash | 功能 + 标题 | **已完成** | `pages/hash-text.vue`、6 语言 i18n、`data/tool-content.ts` | 0.5d |
| 3 | `/uppercase` 合并收尾 | 清理 + 运营 | **已完成**（删死配置） | `data/tool-content.ts` | 0.1d |
| 4 | `/font-compress` 首屏三件套 | 转化率 | **已完成** | `pages/font-compress.vue`、6 语言 i18n | 0.3d |
| 5 | WebP 收敛 + 进 sitemap | 结构 + 301 | **已完成** | `nuxt.config.ts`、`layouts/default.vue`、`pages/index.vue`、2 个页面、`data/tool-content.ts` | 0.3d |
| 6 | 元数据 2 条真重复 301（保留 `/exif-editor`） | 结构 + 301 | **已完成** | `nuxt.config.ts`、删 2 个页面、`pages/image-metadata.vue`、`pages/alternatives/toolmole.vue`、`data/tool-content.ts` | 0.4d |
| 7 | 7 个孤儿约束页补内链 | 内链 | **已完成** | 7 个 `compress-*/reduce-*` 页面各 +1 行、`pages/image-compress.vue` | 0.2d |

**建议顺序**：4 → 2 → 7（纯代码、零 URL 变动）→ 1 → 3 → 5 → 6（含 301，需观察窗口）。

---

## P0-1 `/json-csv-convert` 冲首页

**现状（已核实）**

- `i18n/locales/en.json` 的 `jsoncsv.seo_title` 已是 `JSON to CSV Converter — Online & Free (CSV to JSON Too)` ✅
- 首页工具网格已含 `/json-csv-convert` ✅；导航 `layouts/default.vue:1304` 已含 ✅
- 页面本身只有工具区 + `data/tool-content.ts:476` 一个 H2（`Convert between JSON and CSV`），**没有第二段长文，也没有站内相关链接** ❌
- GSC：64 曝光 / 0 点击 / 均位 **23.6**（全站唯一在第 3 页的老页）

**改动 A — `pages/json-csv-convert.vue`：工具下方加长文 section**

在 `</div>`（第 42 行 `flex` 容器结束）之后、模板根 `</div>` 之前插入：

```vue
    <section class="mt-10 space-y-4">
      <h2 class="text-xl font-semibold">{{ t('jsoncsv.howto_title') }}</h2>
      <p class="leading-7 text-gray-700 dark:text-slate-300">{{ t('jsoncsv.howto_p1') }}</p>
      <h3 class="text-lg font-semibold">{{ t('jsoncsv.howto_csv2json_title') }}</h3>
      <p class="leading-7 text-gray-700 dark:text-slate-300">{{ t('jsoncsv.howto_csv2json_p') }}</p>
      <h3 class="text-lg font-semibold">{{ t('jsoncsv.howto_nested_title') }}</h3>
      <p class="leading-7 text-gray-700 dark:text-slate-300">{{ t('jsoncsv.howto_nested_p') }}</p>
    </section>
    <nav class="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-200 pt-6 text-sm">
      <NuxtLinkLocale to="/json-formatter" class="text-primary underline">{{ t('jsonFormatter.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/json-compare" class="text-primary underline">{{ t('jsonCompare.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/text-dedup" class="text-primary underline">{{ t('textDedup.title') }}</NuxtLinkLocale>
    </nav>
```

**改动 B — 6 语言 i18n 各加 5 个 `jsoncsv.howto_*` key**（en 文案建议）

| key | 文案 |
|---|---|
| `howto_title` | `How to convert JSON to CSV (and back)` |
| `howto_p1` | `Paste a JSON array of objects and the converter writes one CSV row per object, using the first object's keys as the header row. Paste CSV with a header line to get JSON objects back.` |
| `howto_csv2json_title` | `CSV to JSON` |
| `howto_csv2json_p` | `CSV is flat, so every column becomes a string field. Numbers, booleans and nulls come back as text — cast them again after import if your code depends on types.` |
| `howto_nested_title` | `Nested objects and large files` |
| `howto_nested_p` | `Nested objects are not flattened automatically: stringify them into a single column first if the consumer cannot handle JSON inside CSV. Conversion runs in the browser, so multi-megabyte files depend on available memory rather than a server limit.` |

**改动 C — `data/tool-content.ts:476` 段落补 `CSV to JSON` / `nested JSON` 关键词**（现有段落已含 CSV to JSON，建议在第一条句首改成 `Convert JSON to CSV or CSV to JSON in one page.` 让 H2 与首句都命中查询）。

**改动 D（可选，收益低）** — 从 `/font-compress` 相关工具卡加一条跨簇链接。理由：唯一有权重页确实能传权重，但字体→JSON 语义跨度大，锚文本只能是泛词，**建议跳过**，改为开发簇内互链（已含在改动 A）。

**验收**：GSC 8 周内均位 ≤ 15；曝光 ≥ 100/月。不达标则放弃该页，转内链支撑（见审计文档第 8 节）。

---

## P0-2 `/hash-text` 标题 + 文件 hash

**现状（已核实）**

- `hashTool.seoTitle` = `Hash Text Generator — MD5, SHA-1, SHA-256 Online` ✅ 已 exact
- 页面 `pages/hash-text.vue` **只支持文本输入**（`textarea` → `CryptoJS.MD5(text)`），无文件 hash ❌
- GSC：118 曝光 / 2 点击 / 均位 **50.4**；SERP 前 9 全是小工具站，无大品牌

**改动 A — 加「文本 / 文件」切换**

在 `pages/hash-text.vue` 的输入区（第 27-35 行 `div`）之前插入 tab，并把现有 textarea 包进 `v-if="mode === 'text'"`，新增：

```vue
          <div v-else>
            <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-white">{{ $t('hashTool.fileLabel') }}</label>
            <input
              type="file"
              class="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-950"
              @change="onFileChange"
            />
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">{{ $t('hashTool.fileHint') }}</p>
            <p v-if="fileName" class="mt-1 text-xs text-green-600">{{ fileName }} · {{ prettySize(fileSize) }}</p>
          </div>
```

**改动 B — 脚本：文件 hash 复用同一组算法**

`crypto-js@^4.2.0` 自带 `lib-typedarrays`，可直接把 `ArrayBuffer` 包成 `WordArray`：

```js
const mode = ref('text')          // 'text' | 'file'
const fileName = ref('')
const fileSize = ref(0)

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  fileName.value = file.name
  fileSize.value = file.size
  file.arrayBuffer().then((buffer) => {
    // crypto-js 的 WordArray.create 直接接受 ArrayBuffer
    const wordArray = CryptoJS.lib.WordArray.create(buffer)
    hashes.MD5 = CryptoJS.MD5(wordArray).toString(CryptoJS[encoding.value])
    hashes.SHA1 = CryptoJS.SHA1(wordArray).toString(CryptoJS[encoding.value])
    hashes.SHA256 = CryptoJS.SHA256(wordArray).toString(CryptoJS[encoding.value])
    hashes.SHA224 = CryptoJS.SHA224(wordArray).toString(CryptoJS[encoding.value])
    hashes.SHA512 = CryptoJS.SHA512(wordArray).toString(CryptoJS[encoding.value])
    hashes.SHA384 = CryptoJS.SHA384(wordArray).toString(CryptoJS[encoding.value])
  })
}
```

注意事项：
- 大文件会同步阻塞主线程，`fileHint` 里写明「建议 < 50 MB，超大文件请用命令行 `sha256sum`」。
- `clearAll()` 需要同时重置 `mode/fileName/fileSize`，并清空 `<input type="file">` 的 value（参考 `font-compress.vue:302` 的 `clearFontFile` 写法）。
- 切换 encoding（hex/base64）时文件 hash 不会自动重算——把 `@change="generateHashes"` 改成「按 mode 分派」：text 走 `generateHashes()`，file 走重算函数。

**改动 C — i18n**：`hashTool` 下新增 `fileLabel` / `fileHint` / `fileTab` / `textTab` / `fileEmpty`（6 语言）。

**改动 D — `data/tool-content.ts:258`**：heading 改为 `Generate MD5, SHA-1, SHA-256 and SHA-512 hashes from text or files`，并在 bullets 里加一条 `Hash a downloaded installer to verify it against the publisher's checksum.`

**验收**：8 周内均位 ≤ 30；不达标则只做标题二次迭代，不再加功能。

---

## P0-3 `/uppercase` 合并收尾

**现状（已核实）**

- `routeRules` 301 全部 6 个 locale 变体已配置（`nuxt.config.ts:82-93`），线上 `curl /uppercase` → `301 https://onlitools.com/case-converter` ✅
- `pages/uppercase.vue` 已于 2026-11-09 删除；`/case-converter` 标题与 FAQ 已完成 ✅
- 站内已无任何指向 `/uppercase` 的链接（全仓 grep 仅命中注释、i18n 的通用 `uppercase` 文案、`data/tool-content.ts:572` 死配置）✅
- GSC 仍把 152 曝光 / 0 点击 / 均位 41.5 记在 `/uppercase`（301 后不足一周，尚未重爬）

**改动 A（唯一代码改动）** — 删掉 `data/tool-content.ts:572` 的 `'/uppercase': {...}` 条目（该路径永远匹配不到，留着会误导后续维护）。

**改动 B（运营，非代码）**

1. GSC → URL Inspection：对 `https://onlitools.com/case-converter` 请求编入索引。
2. GSC → URL Inspection：对 `https://onlitools.com/uppercase` 复查，确认 Google 已选择 canonical = `/case-converter`。
3. 在 GSC「页面」报告里对比 4 周后 `/uppercase` 曝光是否下降、`/case-converter` 是否接住。

**验收**：4 周后 `/uppercase` 曝光 < 30、`/case-converter` 曝光 ≥ 100。

---

## P0-4 `/font-compress` 首屏三件套

**现状（已核实）**

- 首屏只有 H1 + lead + 表单（`pages/font-compress.vue:1-56`），没有任何「为什么用它」的可扫描信息 ❌
- 页面顶部 `<nav>`（第 76-79 行）只链了 `font-inspector` 和 `font-unicode-checker`，`ttf-to-woff2` / `font-subsetter` / `compress-woff2` 只在页面底部相关工具卡（第 126-149 行）❌
- GSC：5,317 曝光 / 462 点击 / CTR **8.7%** / 均位 12.7

**改动 A — 首屏 trust strip**：在 lead（第 4-6 行 `<p>`）之后、`<el-form>` 之前插入

```vue
    <ul class="mb-6 grid gap-2 text-sm text-gray-600 sm:grid-cols-3 dark:text-slate-300">
      <li class="rounded-lg border border-gray-200 px-3 py-2 dark:border-slate-700">✓ {{ t('font.trust.local') }}</li>
      <li class="rounded-lg border border-gray-200 px-3 py-2 dark:border-slate-700">✓ {{ t('font.trust.compare') }}</li>
      <li class="rounded-lg border border-gray-200 px-3 py-2 dark:border-slate-700">✓ {{ t('font.trust.formats') }}</li>
    </ul>
```

en 文案：
- `font.trust.local` = `Runs in your browser — the font is never uploaded`
- `font.trust.compare` = `Shows original vs. subset size and % saved`
- `font.trust.formats` = `Input TTF / OTF / WOFF / WOFF2 → output TTF / WOFF / WOFF2`

**改动 B — 顶部 nav 扩容**（第 76-79 行，从 2 条改 5 条，锚文本用查询词）

```vue
    <nav class="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-200 pt-4 text-sm">
      <NuxtLinkLocale to="/ttf-to-woff2" class="text-primary underline">{{ t('menu.ttfToWoff2') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/font-subsetter" class="text-primary underline">{{ t('menu.fontSubsetter') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/compress-woff2" class="text-primary underline">{{ t('menu.compressWoff2') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/font-inspector" class="text-primary underline">{{ t('font.tools.inspector') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/font-unicode-checker" class="text-primary underline">{{ t('font.tools.unicodeChecker') }}</NuxtLinkLocale>
    </nav>
```

**改动 C（可选，收益明确）** — 把 lead 里加一句包含 `font compressor` 的完整句：`Free online font compressor and subsetter for TTF, OTF, WOFF and WOFF2.`（首屏文字与 H1 互相呼应，利于摘要与 CTR。）

**验收**：8 周内 CTR ≥ 11%、点击 ≥ 35/周；不达标只继续改首屏文案，不动功能。

---

## P0-5 WebP 收敛 + 进 sitemap

**现状（已核实）**

| URL | 模板 | GSC |
|---|---|---|
| `/image-to-webp` | `[format]-to-webp.vue`（`format="image"` → 标题退化为 `JPG/PNG to WebP Converter`） | 58 曝光 / 0 点击 / 均位 33.7 |
| `/png-to-webp` | 同上（`format="png"` → `PNG to WebP Converter — Free & Bulk`） | 无 |
| `/jpg-to-webp` | 同上（`format="jpg"`） | 无 |
| `/webp-to-png` | `webp-to-[target].vue` | 无 |
| `/webp-to-jpg` | 同上 | 15 曝光 / 0 点击 / 均位 53.9 |

**改动 A — `nuxt.config.ts`：301 `/image-to-webp` → `/png-to-webp`**

在 `routeRules` 顶部（`/uppercase` 块之后）追加：

```ts
    // /image-to-webp was rendered by the [format]-to-webp template with
    // format="image", so its H1/title degraded to "JPG/PNG to WebP" and it
    // competed with /png-to-webp and /jpg-to-webp. Keep the two exact-match
    // URLs and fold the generic one onto /png-to-webp.
    '/image-to-webp': { redirect: { to: '/png-to-webp', statusCode: 301 } },
    '/zh/image-to-webp': { redirect: { to: '/zh/png-to-webp', statusCode: 301 } },
    '/ja/image-to-webp': { redirect: { to: '/ja/png-to-webp', statusCode: 301 } },
    '/de/image-to-webp': { redirect: { to: '/de/png-to-webp', statusCode: 301 } },
    '/fr/image-to-webp': { redirect: { to: '/fr/png-to-webp', statusCode: 301 } },
    '/ar/image-to-webp': { redirect: { to: '/ar/png-to-webp', statusCode: 301 } },
```

**改动 B — `nuxt.config.ts`：把 4 个 WebP URL 加进 prerender + sitemap**

```ts
// Dynamic routes ([format]-to-webp, webp-to-[target]) are skipped by
// collectStaticRoutes() because of the [param] segment, which also kept them
// out of the sitemap. List the real URLs explicitly.
const EXTRA_PRERENDER_ROUTES = ['/png-to-webp', '/jpg-to-webp', '/webp-to-png', '/webp-to-jpg']

const staticRoutes = [...collectStaticRoutes(), ...EXTRA_PRERENDER_ROUTES]
  .filter((route) => !isExcluded(route))
```

这样 `prerenderRoutes`（含 6 语言展开）与 `sitemap.urls` 都会带上这 4 条。

**改动 C — 站内链接改指向 `/png-to-webp`**（4 处）

| 文件 | 行 | 现值 |
|---|---|---|
| `layouts/default.vue` | 1315 | `{ name: "menu.webp", path: "/image-to-webp", ... }` |
| `pages/index.vue` | 409 | `path: '/image-to-webp'` |
| `pages/image-aspect-ratio.vue` | 201 | `<NuxtLinkLocale to="/image-to-webp">` |
| `pages/increase-image-size.vue` | 158 | `<NuxtLinkLocale to="/image-to-webp">` |

**改动 D — `data/tool-content.ts:596`**：key 从 `'/image-to-webp'` 改为 `'/png-to-webp'`（否则新 canonical 页没有长文段）。

**风险与观察**

- `/image-to-webp` 是 3 个 WebP URL 里唯一有曝光的（58 曝光、均位 33.7、0 点击），301 后需 2–4 周把权重转移过去；期间该簇曝光可能短暂下降。
- 301 之前**不要**删除 `/image-to-webp` 的渲染能力（不要删模板），否则 301 会变成 404。模板要保留，因为 `/png-to-webp`、`/jpg-to-webp` 依赖它。

**验收**：`__sitemap__/en.xml` 出现 4 条 WebP URL；`curl -I /image-to-webp` 返回 301；8 周内 `/png-to-webp` + `/jpg-to-webp` 合计曝光 ≥ 150/月。

---

## P0-6 元数据 2 条真重复 301（保留 `/exif-editor`）

**现状（已核实组件结构）**：

| 页面 | 组件 | 角色 |
|---|---|---|
| `/image-info` | `ImageMetadataTool`（查看） | 存活页 |
| `/metadata-analyzer` | `ImageMetadataTool`（查看） | **与 image-info 同组件，真重复** |
| `/remove-exif` | `ImageMetadataTool clean-exif` | 存活页 |
| `/image-metadata-remover` | `ImageMetadataTool clean-exif` | **与 remove-exif 同组件，真重复** |
| `/gps-remover`、`/image-privacy` | `ImageMetadataTool clean-exif` | 保留（细分意图） |
| `/exif-editor` | `ExifEditorTool` | **保留**：全站唯一能「编辑」EXIF/GPS 的工具，非重复页 |
| `/image-metadata` | 无 | 工具目录页（hub），不是工具本身 |

> 计划初稿曾把 `/metadata-analyzer` 指向 `/image-metadata`，但 `/image-metadata` 只是 hub；真正同组件的存活页是 `/image-info`。已按此修正。

| 旧 URL | 目标 | 依据 |
|---|---|---|
| `/metadata-analyzer` | `/image-info` | 渲染同一组件（仅 i18n 文案不同） |
| `/image-metadata-remover` | `/remove-exif` | 渲染同一组件（仅 i18n 文案不同） |

**改动 A — `nuxt.config.ts` `routeRules`**：2 个路径 × 6 个 locale = 12 条：

```ts
    '/metadata-analyzer': { redirect: { to: '/image-info', statusCode: 301 } },
    '/zh/metadata-analyzer': { redirect: { to: '/zh/image-info', statusCode: 301 } },
    // …ja / de / fr / ar 同理
    '/image-metadata-remover': { redirect: { to: '/remove-exif', statusCode: 301 } },
    // …5 个 locale
```

**改动 B — 删页面文件**：`pages/metadata-analyzer.vue`、`pages/image-metadata-remover.vue`（删除后 `collectStaticRoutes()` 自然不再 prerender，也不会进 sitemap；不必再加 `PRERENDER_EXCLUDE`）。`pages/exif-editor.vue` **不动**。

**改动 C — 合并内容**：把两页的 `data/tool-content.ts` 条目要点并进目标页，然后删掉这 2 个 key：
- `/image-info`：加 bullet `GPS, owner and serial-number fields deserve the first review before publishing.`
- `/remove-exif`：加 bullet `The cleanup also drops IPTC, XMP and comment fields, not just EXIF.`

**改动 D — 修站内链接（2 个文件）**

| 文件 | 行 | 处理 |
|---|---|---|
| `pages/alternatives/toolmole.vue` | 267、402 | `path: '/metadata-analyzer'` → `'/image-info'` |
| `pages/image-metadata.vue` | 5、8 | 删除这两条列表项（保留 `:6` 的 `/exif-editor`） |

**风险**：`/image-metadata-remover` 有 1 次曝光（均位 3，样本极小）；`/image-info` 是 0 点击簇的「查看」入口。301 后观察 4 周，若 `/image-info` 起不来，则元数据簇整体降级为「内链支撑页」（见审计文档 8 周验收线）。

**验收**：2 个旧 URL 全部 301；`__sitemap__/en.xml` 不再含这 2 条；`/exif-editor` 仍 200；8 周内 `/image-info` 曝光 ≥ 100/月。

**未做（显式记录）**：i18n 里 `imageTools.metadataAnalyzer` / `imageTools.metadataRemover` 两个 key 现已无引用，但保留不删（死文案，无功能影响）。

---

## P0-7 7 个孤儿约束页补内链

**现状（已核实）**：以下 7 页在全站 0 入链，但它们各自**已经**有一条指向族内兄弟的出链（`*.vue:9`）。因此只要在兄弟页反向补一条链接即可让爬虫到达，不需要新建 hub。

| 孤儿页（0 入链） | 在哪个页面补入链 | 插入位置 |
|---|---|---|
| `/compress-image-to-5mb` | `pages/compress-image-to-2mb.vue` | 第 9 行 `.cta-row` 内 |
| `/compress-jpg-to-50kb` | `pages/compress-jpg-to-100kb.vue` | 第 9 行 |
| `/compress-jpg-to-150kb` | `pages/compress-jpg-to-200kb.vue` | 第 9 行 |
| `/compress-jpg-to-5mb` | `pages/compress-jpg-to-2mb.vue` | 第 9 行 |
| `/compress-png-to-100kb` | `pages/compress-png-to-200kb.vue` | 第 9 行 |
| `/compress-png-to-5mb` | `pages/compress-png-to-2mb.vue` | 第 9 行 |
| `/reduce-image-size-to-5mb` | `pages/reduce-image-size-to-2mb.vue` | 第 9 行 |

每一处的改法（以 `compress-image-to-2mb.vue` 为例）：

```vue
      <div class="cta-row">
        <NuxtLinkLocale :to="{ path: '/image-compress', query: { size: 2000 } }" class="primary-btn">{{ $t('imageTarget.compressNow', { format: format.value }) }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/image-compress-to-1mb" class="secondary-btn">1MB</NuxtLinkLocale>
+       <NuxtLinkLocale to="/image-compress-to-5mb" class="secondary-btn">5MB</NuxtLinkLocale>
      </div>
```

**另外**：把「保留的 3 页」从主压图页显式链出（这些是 8 周后要留的页面，需要权重）：

在 `pages/image-compress.vue:168-172` 的 related `<nav>` 里加 3 条：

```vue
      <NuxtLinkLocale to="/compress-png-to-200kb" class="text-primary transition hover:underline">PNG 200 KB</NuxtLinkLocale>
      <NuxtLinkLocale to="/compress-jpg-to-200kb" class="text-primary transition hover:underline">JPG 200 KB</NuxtLinkLocale>
      <NuxtLinkLocale to="/image-compress-to-100kb" class="text-primary transition hover:underline">Image 100 KB</NuxtLinkLocale>
```

> 说明：`image-compress.vue` 的 `sizePresets`（第 188-195 行）虽然有 `path` 字段，但模板里只渲染成「设置目标体积」的按钮，**不产生 `<a>`**，所以这些页面至今 0 入链。本次不改按钮行为（会改变交互），只加静态链接。

**验收**：7 页各自 ≥ 1 入链（构建后对 `dist` 或线上 HTML 做一次入链统计，脚本见下）；8 周后单页曝光 < 50 的直接 301 到族内最强页。

---

## 部署与验证

```bash
# 1) 构建（含 prerender）
npm run build

# 2) prerender 产物：4 个 WebP 页应各有 HTML（证明进了 prerender）
ls .output/public/png-to-webp/index.html .output/public/jpg-to-webp/index.html \
   .output/public/webp-to-png/index.html .output/public/webp-to-jpg/index.html

# 3) 本地预览跑一遍重定向
npm run preview
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:8787/image-to-webp
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:8787/metadata-analyzer
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:8787/image-metadata-remover
# /exif-editor 应仍为 200（保留的编辑工具）
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8787/exif-editor

# 4) 部署
npm run deploy
```

线上复核（走本地 SOCKS5 代理）：

```bash
# sitemap 里应有 4 条 webp URL（改前是 0）
curl --proxy socks5h://127.0.0.1:4080 --ssl-no-revoke -s https://onlitools.com/__sitemap__/en.xml \
  | grep -o 'png-to-webp\|jpg-to-webp\|webp-to-png\|webp-to-jpg' | sort | uniq -c

# 301 链（/exif-editor 应保持 200，不在 301 列表里）
for u in /image-to-webp /metadata-analyzer /image-metadata-remover /uppercase; do
  curl --proxy socks5h://127.0.0.1:4080 --ssl-no-revoke -s -o /dev/null -w "$u -> %{http_code} %{redirect_url}\n" "https://onlitools.com$u"
done
curl --proxy socks5h://127.0.0.1:4080 --ssl-no-revoke -s -o /dev/null -w "/exif-editor -> %{http_code}\n" https://onlitools.com/exif-editor

# 标题/canonical 抽查
curl --proxy socks5h://127.0.0.1:4080 --ssl-no-revoke -s https://onlitools.com/png-to-webp | grep -o '<title>[^<]*</title>\|rel="canonical" href="[^"]*"'
```

入链回归（可选，复用上一轮的脚本思路）：

```bash
node C:\Users\Administrator\AppData\Local\Temp\opencode\link-graph.cjs   # 改前 11 个孤儿
```

**提交建议**：按 P0 编号拆 5 个 commit（4+2+7 一个、1 一个、3 一个、5 一个、6 一个），便于逐项回滚。301 类改动（5、6）单独一个 commit，回滚时只需删掉 `routeRules` 条目并恢复页面文件。

## 本次不做（防 scope creep）

- 不新增任何页面（含约束页、AI 页）。
- 不改 `image-compress` 的 `sizePresets` 交互（只加静态链接）。
- 不动 `/json-formatter`、`/image-cropper`、`/id-photo`、AI 页。
- 不删 `[format]-to-webp.vue` / `webp-to-[target].vue` 模板（P0-5 的 301 依赖它们）。
- 不改 `sitemap.exclude`（P0-6 靠删页面文件达成，不动排除列表）。
- 不删 `/exif-editor`（全站唯一的 EXIF 编辑工具，非重复页；P0-6 只做 2 条真重复 301）。
- 不删 i18n 里已无引用的 `imageTools.metadataAnalyzer` / `imageTools.metadataRemover` 两个死 key（无功能影响）。

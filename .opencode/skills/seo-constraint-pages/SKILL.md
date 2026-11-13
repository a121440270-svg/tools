---
name: "seo-constraint-pages"
description: "Build batches of constraint-intent SEO landing pages (\"compress png to 1mb\", \"reduce image size to 250kb\", \"ttf to woff2\") in a Nuxt i18n site: page skeleton with exact-match H1, prefilled-CTA, FAQ schema, sibling cross-links, long-form section, plus the full wiring checklist (sidebar, tool-content, prerenderRoutes, sitemap) and the pre-deploy link/title audit. Triggers: 约束意图页, 生成落地页, 批量新页面, compress png to 1mb, reduce image size to, 新页接线, SEO landing page, 长尾页, i18n 六语言页面."
---

# 约束意图页工厂（批量长尾页 + 全链路接线）

搜索需求里最大的一块是「动词 + 格式 + 目标值」（`compress png to 1mb`、`compress jpg to 50kb`）。
每个精确短语一页，比做一个大而全的工具页更容易拿排名。

## 何时用

- 需求分析产出了 P1 约束意图清单（见 `demand-mining`）
- 要给已有真工具补充长尾入口
- 一次要上 5~20 个结构相同的页面

## 页面骨架（照抄 `pages/compress-png-to-200kb.vue`）

1. **eyebrow**：`PNG COMPRESSION`
2. **H1 = 精确短语**（`Compress PNG to 1 MB`），不要写「图片压缩工具」
3. **CTA → 真工具 + query 预填**：`/image-compress?target=1mb&format=png`
4. **3 条 FAQ + `faqItems` schema**
5. **兄弟页交叉内链**（同族 5~8 条）
6. **`toolContentSection` 长文**（300~600 字，来自 `data/tool-content.ts`）

## 接线清单（漏一条就等于没上线）

- [ ] `pages/<slug>.vue` 新建
- [ ] `layouts/default.vue` 侧边栏入口（只在真工具级新增，约束页走内链）
- [ ] `data/tool-content.ts` 的 `compressTargets` / 长文条目
- [ ] 兄弟页互链（新页 ↔ 老页，双向）
- [ ] `i18n/locales/{en,zh,ja,de,fr,ar}.json` **六语言同批**
- [ ] `nuxt.config.ts` 的 `prerenderRoutes`（本项目自动扫 `pages/`，确认新路由在数组里）
- [ ] sitemap `urls: prerenderRoutes` 生效（否则运行时模式会把预渲染页丢掉）

## 坑 → 根因 → 规避

| 坑 | 根因 | 规避 |
|---|---|---|
| 只有英文页被索引，其他语言不收录 | 只写了 EN，其他 locale 回退到英文 = 重复内容 | 六语言**同一批**交付；用脚本校验「段落齐全 + 占位符与 EN 一致」 |
| 两个路由共享同一个 title | 动态路由没做路由感知（`[format]-to-webp`） | title/H1 必须从 `route.params` 派生 |
| 交叉内链 404 | 家族命名不统一（`image-compress-to-*` vs `compress-image-to-*`） | 生成后**跑一遍死链核对**，只链真实存在的路由 |
| 页面 200 但搜不到 | 没进 sitemap / 没进 prerenderRoutes | 部署后 grep 子图 `<loc>` 确认命中 |
| 做了落地页但需求其实是「独立工具」 | 意图判断错（`ttf-to-woff2` 是转换器，不是压缩器） | 有独立 job 就做真工具页；约束页只做「目标值」变体 |
| 标题里 `—` 在 PowerShell 输出成乱码 | 控制台代码页非 UTF-8 | 落盘后用 UTF-8 读文件再正则；只看 ASCII 字段判断 |
| 新页面上线后 sitemap 数量没变 | sitemap runtime 缓存 600s | 等缓存过期或看 `x-sitemap-generated` 时间戳 |

## 部署前自检（脚本：`scripts/verify-pages.mjs`）

```bash
node verify-pages.mjs https://example.com ttf-to-woff2,font-subsetter,compress-woff2
# 对每个 URL（含 /zh /ja 前缀变体）检查：HTTP 200 + <title> 非空且不重复 + canonical 自指
```

再核对：
- 同一批页面之间 title 两两不相同
- canonical 指向自身语言版本
- 新路由在 sitemap 子图里能 grep 到
- 每个新页至少 2 条入站内链（兄弟页或侧边栏）

---
name: "article-publishing"
description: "Use when writing and publishing a screenshot-rich product or tool article (Chinese + English) to Bilibili 专栏 (bilibili.com/read) and/or dev.to, including capturing UI screenshots with Playwright, composing hero images, uploading images to each platform's CDN, and driving the TipTap / dev.to editors to publish. Triggers: publish an article, 发专栏, 写一篇推广文章, 图文并茂, B站专栏, dev.to, bilingual article."
---

# Article Publishing (screenshots → bilingual article → Bilibili 专栏)

This skill covers the whole pipeline used to ship a product article: verify the product page, capture clean screenshots, compose a hero image, write a Chinese + English Markdown pair, and publish both to Bilibili 专栏 with images.

Treat the published article as the deliverable. A draft is not done.

## When to use

- "写一篇文章介绍一下这个工具 / 页面"
- "中文和英文各一篇"
- "图文并茂，要截图"
- "发到 B站专栏 / 公众号 / 博客"

## Pipeline

### 0. Verify the live page before writing anything

Do not trust locale URL guesses. `https://site.com/en/page` is often a 404 while `https://site.com/page` is the English one. Check:

```bash
curl -s -o /dev/null -w "%{http_code}" https://site.com/en/page
```

If the page has a language `<select>` (not links), drive it:

```js
await page.selectOption('select', 'en')
await page.waitForURL('**/en/page') // only if the URL actually changes
```

Record the real URL for each language. A wrong link in a published article cannot be fixed by "it redirects".

### 1. Build a demo asset (when the topic needs private data)

For privacy/EXIF topics, do **not** use a real photo. Generate one:

- `sharp` for the image, `piexifjs` for EXIF/GPS/thumbnail.
- Label it clearly in the article: coordinates, device, timestamp and author are synthetic.

Keep the generator under `articles/<topic>/assets/make-demo-photo.cjs` so the demo is reproducible.

### 2. Capture screenshots with Playwright

Use element screenshots, not viewport screenshots. Hiding unrelated children gives clean crops:

```js
const setVisible = (keep) =>
  page.evaluate((keep) => {
    const panel = document.querySelector('.info-panel')
    ;[...panel.children].forEach((el, i) => {
      el.style.display = keep.includes(i) ? '' : 'none'
    })
  }, keep)

await setVisible([0, 1])
await page.locator('.info-panel').screenshot({ path: 'assets/zh-01-overview.png' })
```

Rules that matter later:

- Keep one width per language (e.g. 663px) so the article grid stays tidy.
- **Flatten to an opaque background** before upload: crop edges often carry alpha, and Bilibili's WebP conversion of transparent PNGs is unreliable.
- Never fake UI content. Hiding elements is fine; inventing values is not.
- Verify `sharp(...).metadata()` on every output.

### 3. Hero image

Render an HTML layout in Chromium at the target size (1200×750) and screenshot it.
`file://` is blocked in Playwright by default — serve the folder over HTTP (see `scripts/static-server.cjs`), then:

```bash
playwright-cli screenshot --filename assets/hero-zh.jpg --type jpeg
```

### 4. Write the articles

- Chinese and English are **independent** pieces, not translations pasted through a machine. Same structure, natural phrasing.
- Bilibili title limit is **50 characters** (the counter suggests ≤30). English titles run long — shorten before publishing instead of truncating after.
- Include: what the thing is, the two or three concrete questions it answers, one worked example with screenshots, limitations, and the link.
- Put images where the reader needs them, each followed by a caption-worthy sentence.
- Disclose synthetic demo data in a closing note.

### 5. Publish to Bilibili 专栏

Full editor mechanics live in `references/bilibili-editor.md`. Short version:

1. Open `https://member.bilibili.com/platform/upload/text/new-edit`.
2. The editor is an iframe (`member.bilibili.com/york/read-editor?`) containing a TipTap `.ProseMirror.eva3-editor`.
3. Upload images with the page's own cookies:
   ```js
   const fd = new FormData()
   fd.append('file_up', file); fd.append('biz', 'new_dyn'); fd.append('category', 'daily')
   fd.append('csrf', document.cookie.match(/bili_jct=([^;]+)/)[1])
   await fetch('https://api.bilibili.com/x/dynamic/feed/draw/upload_bfs',
     { method: 'POST', body: fd, credentials: 'include' })
   ```
   Response: `data.image_url` (rewrite `http:` → `https:`), plus width/height.
4. Convert Markdown to HTML with `{{IMG:<file>}}` placeholders (`scripts/build-article-html.cjs`) and swap in the uploaded URLs.
5. Insert body: `editor.commands.clearContent(true)`, focus the editor, then dispatch a `ClipboardEvent('paste')` carrying `text/html` through a `DataTransfer`. Paste is what triggers Bilibili's image wrapping (`eva3-enhanced-image-wrapper`).
6. Links: the editor schema has `link` as an **inline atom node**, not a mark. Pasted `<a>` tags silently become plain text. Re-insert them with a ProseMirror transaction (see reference).
7. Title: set through the native textarea setter + `input` event.
8. Publish with **one** click. Two quick clicks return `您操作的太快啦~` and nothing happens.
9. Success shows `你的专栏已提交成功`; get the id from
   `https://api.bilibili.com/x/article/creative/article/list?pn=1&ps=5`.
   Public URL: `https://www.bilibili.com/read/cv<id>` → resolves to `/opus/<opus_id>`.

### 6. Publish the English version to dev.to

Full mechanics live in `references/devto-editor.md`. Short version:

1. Editor: `https://dev.to/new` (or `<public-url>/edit` for an existing post).
   Title `#article-form-title`, Markdown body `#article_body_markdown` — both
   plain textareas, set with the native setter + `input` event.
2. Tags: `#tag-input` + `#tag-input-listbox1 li[role=option][id="<tag>"]`,
   dispatched with a full pointer sequence (`.click()` alone does nothing).
3. **Never hotlink the Bilibili CDN.** `i0.hdslb.com` answers 403 to a `dev.to`
   Referer, so every image silently renders blank. Re-upload to dev.to:
   - make `#image-upload-field` visible with inline CSS, snapshot it, then
     `browser.files.upload({ ref, paths: [file] })` — one file per call;
   - the editor inserts `![Image description](https://dev-to-uploads.s3...)` at
     the cursor (top of the doc), so upload all images, map them by dimensions,
     then overwrite the whole body once with the final Markdown.
4. `Publish` posts immediately, no confirm panel. Verify with
   `document.querySelectorAll('#article-body img')`: set `loading="eager"`,
   scroll each into view, then read `naturalWidth`.

### 7. Verify after publishing

Open the public URL and check in the page:

```js
[...document.querySelectorAll('img')].filter(i => i.src.includes('new_dyn'))
  .map(i => ({ w: i.naturalWidth, h: i.naturalHeight }))
```

Images are `loading="lazy"`: `naturalWidth === 0` below the fold is **not** a failure — scroll to each image and re-check before concluding anything.

Also verify: title, section headings (Bilibili builds a table of contents from `h2`), lists, code block, horizontal rules, links, and that the first image is usable as the auto cover.

### 8. Turn the run into a skill (optional but recommended)

When the user asks for a reusable skill, write it in `.opencode/skills/<name>/SKILL.md` with `name` + `description` frontmatter, keep scripts under `scripts/`, and put deep detail in `references/` so the main file stays scannable.

## Gotchas

| Symptom | Cause | Fix |
| --- | --- | --- |
| `npx` fails with `ENOSPC` | system drive full | clear `npm-cache\_cacache`, retry |
| `Screenshot needs a visible tab` | in-app browser tab not focused/visible | use Playwright for screenshots |
| `file:` protocol blocked | Playwright blocks file URLs | serve over `http://127.0.0.1` |
| Image upload 404 | `member.bilibili.com` host | use `api.bilibili.com` |
| Uploaded image never renders | transparent PNG → broken WebP | flatten onto opaque background, re-upload |
| `您操作的太快啦~` | double publish click | wait, click once |
| Links disappeared after paste | `link` is a node, not a mark | insert link nodes via transaction |
| English title rejected | > 50 chars | shorten the title |
| dev.to images all blank | Bilibili CDN 403s a `dev.to` Referer | re-upload to `dev-to-uploads` via `#image-upload-field` |
| dev.to tag not selected | suggestion list stale / `.click()` is not enough | clear input, wait, dispatch pointer sequence |
| dev.to image inserted at top of doc | paste-at-cursor behaviour | upload all, map by pixel size, overwrite the whole body |
| dev.to `#image-upload-field` missing from snapshot | 1px hidden file input | inline-style it visible, then snapshot |
| Bilibili daily article limit | LV level quota is one article/day | save a draft, publish after 00:00 Beijing |

## QA checklist

- [ ] Both language URLs return 200 and the copy matches that page's UI language
- [ ] Every screenshot has real content and no invented values
- [ ] Title ≤ 50 chars in both languages
- [ ] All body images load on the published page (scroll each into view)
- [ ] Images are hosted on the platform's own CDN, not a cross-platform hotlink
- [ ] Internal links resolve to the correct locale
- [ ] Synthetic demo data disclosed
- [ ] Published URLs recorded (in the article folder README or session summary)

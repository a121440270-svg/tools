# Bilibili 专栏 editor reference

Verified against the `eva3-4.0.0` editor (2026).

## Page structure

```
tab: https://member.bilibili.com/platform/upload/text/new-edit
└── iframe name="113" src="https://member.bilibili.com/york/read-editor?"
    ├── textarea.title-input__inner        (maxlength 50, placeholder 请输入标题（建议30字以内）)
    ├── div.tiptap.ProseMirror.eva3-editor (body, contenteditable)
    ├── div.toolbar.eva3-toolbar
    │   ├── eva3-toolbar-image   (shadow DOM dropdown: 上传图片 / 上传图片并添加水印)
    │   └── eva3-toolbar-import  (hidden input accept=".docx,.md")
    └── buttons: 保存为草稿, 发布
```

Both frames are same-origin with `member.bilibili.com`, so `fetch` from the editor frame carries the login cookies.

`document.querySelector('.eva3-editor').editor` is the TipTap instance (`schema`, `state`, `view`, `commands`).

## Image upload

The toolbar's "上传图片" item does not create a reachable `input[type=file]` (it is created and clicked inside a shadow root). Bypass the UI:

```js
const csrf = (document.cookie.match(/bili_jct=([^;]+)/) || [])[1] || ''
const fd = new FormData()
fd.append('file_up', new File([blob], name, { type: blob.type }))
fd.append('biz', 'new_dyn')
fd.append('category', 'daily')
if (csrf) fd.append('csrf', csrf)

const res = await fetch('https://api.bilibili.com/x/dynamic/feed/draw/upload_bfs', {
  method: 'POST',
  body: fd,
  credentials: 'include',
})
// { code: 0, data: { image_url, image_width, image_height, img_size, ai_gen_pic } }
```

Notes:

- Host must be `api.bilibili.com`. `member.bilibili.com/x/dynamic/...` returns an HTML 404 page.
- `image_url` comes back as `http://`, rewrite to `https://`.
- Optional watermark: append `wm_text=<uname>&watermark=1`.
- Uploading triggers a `transfer_image` on publish, so the published `img src` hash differs from the upload response. Do not use the upload URL to look up the published image.

Getting bytes into the page: serve the assets from a local static server that sends `Access-Control-Allow-Origin: *` (see `scripts/static-server.cjs`) and `fetch('http://127.0.0.1:PORT/...')` from the editor frame. Chrome allows http loopback from an https page.

## Inserting the body

Markdown → HTML with `{{IMG:file}}` placeholders, then:

```js
const ed = document.querySelector('.eva3-editor')
ed.editor.commands.clearContent(true)
ed.focus()

const dt = new DataTransfer()
dt.setData('text/html', html)
dt.setData('text/plain', text)
ed.dispatchEvent(new ClipboardEvent('paste', {
  clipboardData: dt, bubbles: true, cancelable: true,
}))
```

Why paste instead of `setContent`: the paste handler runs Bilibili's sanitizer and wraps every `<img>` in `div.eva3-enhanced-image-wrapper > figure.eva3-image-element > img.eva3-image-content`, which is what the published renderer expects.

What survives paste: `h2`, `p`, `strong`, `ol`, `ul`, `li`, `pre > code`, `hr`, `img`.
What does not: `<a>` tags (converted to plain text), `target`, inline styles.

## Links

`link` is an inline **atom node** in the schema (attrs include `href`, `text`, `target`, `data-type`, `biz-type`), not a mark. There is no `setLink` command. Insert with a transaction:

```js
const editor = document.querySelector('.eva3-editor').editor
const label = 'Image Info Viewer'
let target = null
editor.state.doc.descendants((node, pos) => {
  if (target) return false
  if (node.isText && node.text.includes(label)) {
    target = { pos: pos + node.text.indexOf(label), len: label.length }
    return false
  }
})

const tr = editor.state.tr.delete(target.pos, target.pos + target.len)
tr.insert(target.pos, editor.schema.nodes.link.create({
  href: 'https://example.com',
  text: label,
  target: '_blank',
}))
editor.view.dispatch(tr)
```

The rendered anchor gets `class="eva3-link eva3-unknown-link"`, a link icon, and `rel="noopener noreferrer nofollow"`.

Loop over every label you want linked; skip labels that are already inside an atom node (they will not match as text nodes).

## Title

```js
const t = document.querySelector('textarea.title-input__inner')
const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set
setter.call(t, title)
t.dispatchEvent(new Event('input', { bubbles: true }))
t.dispatchEvent(new Event('change', { bubbles: true }))
```

`maxlength` is 50. The counter element is `.title-input__indicator`.

## Publishing

```js
const btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === '发布')
btn.focus()
btn.click()
```

- Click **once**. A second click within a few seconds returns the toast `您操作的太快啦~` and the publish is dropped.
- The autosave toast (`保存成功`) fires around the same time; it is not a publish.
- `browser.click({ref})` can fail with `UnknownVizError` for elements inside this iframe; a focused JS click works.
- On success the editor replaces the page with a dialog: `.publish-success-dialog` containing `你的专栏已提交成功` and a button `.success-check` ("点击查看").

## Finding the result

```js
// from any bilibili.com page, with cookies
await (await fetch('https://api.bilibili.com/x/article/creative/article/list?pn=1&ps=5',
  { credentials: 'include' })).json()
// artlist.articles[0].id
```

Public URL: `https://www.bilibili.com/read/cv<id>`, which 302s to `https://www.bilibili.com/opus/<opus_id>`.

`https://api.bilibili.com/x/space/article?mid=<mid>&pn=1&ps=5&sort=publish_time` also works and does not need WBI signing.

## Post-publish checks

- Body images are `loading="lazy"`; `naturalWidth === 0` just means "not in view yet". Scroll each image into view and re-read `.naturalWidth/.naturalHeight`.
- Bilibili re-encodes to `@1192w.webp` / `.avif` proxies. Transparent PNGs can convert to a broken payload; flatten onto white before upload.
- The table of contents is generated from `h2` headings.
- Without a custom cover, Bilibili grabs the opening content; a wide (1200×750) hero as the first element makes a decent auto cover.

# Publishing to dev.to (DEV Community)

Verified against the v2 editor at `https://dev.to/new` and
`https://dev.to/<user>/<slug>/edit`, October 2026.

## 1. Editor surface

| Element | Selector | Notes |
| --- | --- | --- |
| Title | `#article-form-title` | plain `<textarea>` |
| Body | `#article_body_markdown` | plain `<textarea>`, raw Markdown |
| Tag input | `#tag-input` | autocomplete combobox |
| Tag options | `#tag-input-listbox1 li[role=option][id="<tag>"]` | ids are the tag slugs |
| Selected tags | `#tag-input-combo-selected [aria-label^="Remove"]` | author labels |
| Publish | `button` with text `Publish` | publishes immediately, **no confirmation panel** |
| Save draft | `button` with text `Save Draft` | |
| Save edits | `button` with text `Save changes` | on the `/edit` page of a live post |
| Image input | `#image-upload-field` | hidden `input[type=file]`, single file |

Set title/body with the native setter so React picks it up:

```js
const setVal = (el, v) => {
  const proto = el instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}
setVal(document.querySelector('#article-form-title'), title)
setVal(document.querySelector('#article_body_markdown'), markdown)
```

## 2. Tags

Typing alone is not enough; the option must receive a full pointer sequence:

```js
const input = document.querySelector('#tag-input')
const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
for (const tag of ['webdev', 'security', 'productivity']) {
  setter.call(input, ''); input.dispatchEvent(new Event('input', { bubbles: true }))
  await new Promise(r => setTimeout(r, 300))
  setter.call(input, tag); input.dispatchEvent(new Event('input', { bubbles: true }))
  await new Promise(r => setTimeout(r, 900))
  const opt = document.querySelector(`#tag-input-listbox1 li[role=option][id="${tag}"]`)
  const target = opt.querySelector('.c-autocomplete--multi__tag-option') || opt
  for (const type of ['pointerover','pointerenter','mouseover','mouseenter',
                      'pointerdown','mousedown','pointerup','mouseup','click']) {
    const Ev = type.startsWith('pointer') ? PointerEvent : MouseEvent
    target.dispatchEvent(new Ev(type, { bubbles: true, cancelable: true, view: window,
      pointerId: 1, isPrimary: true, button: 0 }))
  }
  await new Promise(r => setTimeout(r, 600))
}
```

Gotchas:

- The suggestion list is debounced and **stale**: if you type `tools` right after
  `security` you may still see `security`'s results. Clear the field and wait
  before typing the next tag.
- `opt.click()` alone often does nothing. Dispatch the pointer sequence.
- Max 4 tags. Verify by counting `Remove <tag>` buttons.

## 3. Images — never hotlink another platform's CDN

Bilibili's CDN (`i0.hdslb.com`) returns **403 to a `dev.to` Referer** and 200
with no Referer. So a Markdown image that works on Bilibili renders blank on
dev.to. Check before publishing:

```js
const r = await fetch(imgUrl, { referrer: 'https://dev.to/' })
// 403 + text/html => must re-upload to dev.to's own CDN
```

Upload through the editor so the image lands on `dev-to-uploads.s3...`:

1. The input is `#image-upload-field`, 1px tall and absent from accessibility
   snapshots. Temporarily make it visible:

   ```js
   const f = document.querySelector('#image-upload-field')
   f.style.cssText = 'display:block!important;visibility:visible!important;opacity:1!important;' +
     'position:fixed;top:10px;left:10px;width:200px;height:60px;z-index:99999;'
   f.setAttribute('aria-label', 'Image upload field')
   ```

2. Snapshot the tab; the input now appears as `[button] "Image upload field"`.
3. `browser.files.upload({ tabID, ref, paths: [file] })` — **one file per call**
   (`multiple` is false).
4. Wait ~5s, then read the textarea. The editor inserts
   `![Image description](https://dev-to-uploads.s3.../uploads/articles/<id>.<ext>)`
   **at the cursor**, which is usually the very top of the document, not where
   you wanted it.

Practical loop: upload all images, collect the inserted URLs, then overwrite the
whole body once with your final Markdown (native setter) so the stray insertions
disappear and the URLs sit in the right order.

Because the inserted alt text is always `Image description`, identify which
upload is which by image dimensions:

```js
const d = await new Promise(res => { const i = new Image()
  i.onload = () => res(i.naturalWidth + 'x' + i.naturalHeight)
  i.onerror = () => res('ERR'); i.src = url })
```

Then match against local `sharp(...).metadata()` / `System.Drawing` sizes. Do not
guess by upload order — the change event can fire twice and you will get
duplicates.

Restore `f.style.cssText = ''` when done.

### API keys (not useful for images)

`https://dev.to/settings/extensions` → "Generate API Key" creates a key; it is
rendered as a `hidden` input `value` in the active-key list, so read it from the
DOM:

```js
[...document.querySelectorAll('input[type=hidden]')].map(i => i.value)
```

`POST https://dev.to/api/images` with an `api-key` header returned **404** in
October 2026, so the editor upload above is the working path. Keep keys out of
the repo and article Markdown.

## 4. Publish and verify

- `Publish` posts immediately; afterwards the tab redirects to the public URL.
- Editing a live post: open `<public-url>/edit`, change fields, click
  `Save changes`, which navigates back to the article.
- Article images are `loading="lazy"` through a resize proxy
  (`media2.dev.to/dynamic/image/width=800,...`). In a headless browser they stay
  `naturalWidth === 0` until visible — that is not a failure. Force and check:

```js
const imgs = [...document.querySelectorAll('#article-body img')]
for (const i of imgs) i.setAttribute('loading', 'eager')
for (const i of imgs) { i.scrollIntoView({ block: 'center' })
  await new Promise(r => setTimeout(r, 1200)) }
imgs.map(i => [i.naturalWidth, i.naturalHeight])
```

- Sanity-check the raw URL too: `fetch(src)` → 200 and `image/webp` proves the
  upload is good even before the lazy loader runs.

## 5. Limits to plan around

- **Do not put an `# h1` in the Markdown body.** dev.to already renders the post
  title as `h1`, so a body heading duplicates it right under the tags. Start with
  the hero image or a paragraph.
- Titles can be long, but the feed truncates around 60 characters — put the
  promise first and let the body carry the subtitle.
- Tags: 4 max, must already exist in dev.to's tag list.
- Each upload is rate-limited; space calls out and expect occasional silent
  drops (body length does not change → retry that file).
- dev.to renders Markdown only. HTML you paste is sanitized, so
  `referrerpolicy="no-referrer"` tricks on `<img>` do not survive — re-host
  instead.

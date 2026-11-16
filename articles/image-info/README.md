# Image Info Viewer — published articles

Product page: <https://onlitools.com/zh/image-info> (zh) / <https://onlitools.com/image-info> (en)

| Lang | Platform | URL | Status |
| --- | --- | --- | --- |
| 中文 | Bilibili 专栏 | <https://www.bilibili.com/opus/1264486097645207576> (`cv53661629`) | published, 4 images |
| English | dev.to | <https://dev.to/damon_0b020d3d5ba9cb/what-a-photo-reveals-image-urls-exif-privacy-5c0h> | published, 4 images, tags `#security #privacy #webdev #productivity` |
| English | Bilibili 专栏 | draft id `391270` (title "What a Photo Reveals: Image URLs & EXIF Privacy") | draft — account is LV3, one article per day |

## Files

- `zh.md` / `en.md` — source articles (single-language Markdown).
- `zh-body.html` / `en-body.html` — generated HTML for the Bilibili editor (`build-bili.cjs`).
- `en-devto.md` — dev.to variant; images point at `dev-to-uploads.s3...` because
  `i0.hdslb.com` returns 403 with a dev.to Referer.
- `assets/` — screenshots (663px wide), 1200×750 heroes, the synthetic demo photo,
  hero HTML, capture scripts.

## Notes

- The demo photo is generated. GPS, device, timestamp and author are fictional;
  this is disclosed at the end of both articles.
- Bilibili images live on `i0.hdslb.com/bfs/new_dyn/...`; dev.to images live on
  `dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/...`. Do not mix them.

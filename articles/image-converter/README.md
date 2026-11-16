# Image Converter — published article

Tool page: <https://onlitools.com/image-converter> (English) / <https://onlitools.com/zh/image-converter>

| Platform | URL | Status |
| --- | --- | --- |
| dev.to | <https://dev.to/damon_0b020d3d5ba9cb/convert-an-image-without-uploading-it-8nf> | published, 5 images, tags `#productivity #webdev #beginners #tools` |

## Files

- `en.md` — source article, uses `{{IMG:...}}` placeholders.
- `en-devto.md` — published variant: placeholders replaced with `dev-to-uploads` URLs, leading `#` heading removed (it duplicates the post title).
- `capture.cjs` — Playwright capture: hero (1200×750), drop zone, queued files, converted rows, AVIF failure.
- `probe.cjs` — throwaway DOM probe, not needed to reproduce.
- `assets/` — `hero-en.jpg`, `conv-01-dropzone.png` … `conv-04-avif.png` (1131 px wide, 1.5× DPR).

## Measured numbers used in the article

Six files, Chrome on Windows, output JPG:

| Input | Before | After |
| --- | --- | --- |
| demo-photo-exif.jpg | 309.1 KB | 403.4 KB |
| en-01-overview.png | 236.0 KB | 77.6 KB |
| zh-03-technical.png | 35.7 KB | 53.6 KB |
| sample.heic | 286.7 KB | 630.1 KB |
| sample2.heic | 701.3 KB | 454.4 KB |
| alpha-test.png (400×300, transparent) | 4.7 KB | 6.3 KB |

WebP run: photo 309.1 → 465.5 KB, `en-01` 236.0 → 57.8 KB, `zh-03` 35.7 → 27.0 KB.
Transparent PNG → JPG filled white (`255,255,255`), not black.
AVIF output in this Chromium: `This browser cannot encode AVIF. Choose another output format.`

Sample HEIC files live in `../image-info/assets/` (`sample.heic`, `sample2.heic`, `alpha-test.png`).

{{IMG:hero}}

# Convert an image without uploading it: what OnliTool's image converter is actually good for

Every "free online converter" asks you to upload the file first. For a passport scan, a client mockup, or a photo of your ID, that is a strange thing to do — you are handing a stranger's server a copy of the file and hoping it gets deleted.

[OnliTool's Image Converter](https://onlitools.com/image-converter) takes the opposite route: the file never leaves the tab. It decodes the image with the browser, re-encodes it with the browser's own encoder, and hands you a download. No account, no queue, no server-side copy.

Here is what you can actually do with it, then how it behaves when you push real files through.

## Five situations where this earns its place

**1. A portal only accepts JPG, and your phone shoots HEIC.**

Job applications, visa forms, insurance claims and school portals are still built around `.jpg`. An iPhone writes `.heic`. The converter reads HEIC/HEIF and writes JPG, PNG or WebP, so you can satisfy the form without installing anything or emailing the file to yourself.

**2. A design site handed you AVIF or WebP, and PowerPoint refuses it.**

Modern stock sites and CDNs serve `.avif` and `.webp`. Word, PowerPoint and plenty of desktop apps still do not open them. Drop the file in, pick PNG (or JPG), done.

**3. Your blog screenshots are PNG and weigh too much.**

A screenshot of a UI is mostly flat colour and text, which is exactly where WebP wins. In my test a 236 KB PNG screenshot came out at **57.8 KB** as WebP — same pixels, a quarter of the bytes.

**4. You have a whole folder to fix, not one file.**

Product shots, scanned paperwork, a folder of client logos. Select them all at once; every file gets a row, one click converts the batch, and "Download all" gives you a single ZIP with the original names and the new extension.

**5. You just need to see whether the other side can open it.**

Sometimes the goal is not size, it is compatibility: turning an exotic format into the boring one the recipient's machine understands. That is a two-second job here, and nothing is uploaded while you check.

## What the tool is

Three properties matter more than the feature list:

- **Batch input.** The file picker accepts multiple files and `image/*` plus `.heic`, `.heif`, `.avif`. JPG, PNG, WebP, AVIF, GIF, BMP, SVG and HEIC all come in.
- **Four outputs.** JPG, PNG, WebP, AVIF. That is the whole settings panel — no quality slider, no resize field.
- **Local execution.** Decoding and encoding happen in the page. The page states it, and there is no upload step anywhere in the flow — you pick a format and get a `blob:` download link.

## A four-step walkthrough

**Step 1 — drop files in.** Click the dashed area or drag images onto it. Multiple files are fine.

{{IMG:step1}}

**Step 2 — pick the output format.** Each queued file shows its name, size and a `Ready` badge. Choose JPG, PNG, WebP or AVIF from the "Convert to" row. Nothing is converted yet, so changing your mind costs nothing.

{{IMG:step2}}

**Step 3 — convert.** Press "Convert images". Each row updates in place with `input size → output size`, a `Done` badge and a **Download** link. Failures are shown per file rather than as one vague error.

{{IMG:step3}}

**Step 4 — take the files.** Download them one by one, or hit "Download all" for a ZIP. Output names are the input names with a new extension: `en-01-overview.png` becomes `en-01-overview.jpg`, `IMG_4821.heic` becomes `IMG_4821.jpg`. Your naming survives the round trip.

## What happened when I fed it six files

I ran a batch through Chrome on Windows: a 1600 × 1067 photo with EXIF, two PNG screenshots, two HEIC samples and a 400 × 300 PNG with transparency. Output: JPG.

| Input | Before | After (JPG) | Verdict |
| --- | --- | --- | --- |
| Photo with EXIF (`demo-photo-exif.jpg`) | 309.1 KB | 403.4 KB | **grew 30%** |
| UI screenshot (`en-01-overview.png`) | 236.0 KB | 77.6 KB | shrank 67% |
| Small diagram (`zh-03-technical.png`) | 35.7 KB | 53.6 KB | **grew 50%** |
| iPhone-style HEIC (`sample.heic`) | 286.7 KB | 630.1 KB | grew 120% |
| Second HEIC (`sample2.heic`) | 701.3 KB | 454.4 KB | shrank 35% |
| Transparent PNG, 400 × 300 | 4.7 KB | 6.3 KB | grew, alpha flattened |

Two useful conclusions, both slightly uncomfortable:

**Conversion is not compression.** A JPEG that was already saved at a modest quality can get *bigger* when re-encoded, because the browser writes it at its own default quality. WebP behaved the same way on the photo (309.1 KB → 465.5 KB) while shrinking the screenshots (236.0 KB → 57.8 KB, 35.7 KB → 27.0 KB). If your goal is "smaller file", converting first and then compressing is the wrong order — use the [Image Compressor](https://onlitools.com/image-compress) or [Image Resizer](https://onlitools.com/image-resizer) for that job, and convert only when the *format* is the problem.

**Transparency does not survive JPG.** The 400 × 300 transparent PNG came out as a JPG with a **white** background — I checked the corner pixels: `255, 255, 255`. Not black, which is the usual ugly surprise. If you need the transparency, output PNG or WebP instead.

## Four limitations worth knowing before you rely on it

1. **AVIF output depends on your browser.** Chromium on this machine cannot encode AVIF from a canvas, and the tool says so per file: *"This browser cannot encode AVIF. Choose another output format."* That is the correct behaviour — it fails loudly instead of writing a broken file — but it means the AVIF button is not a promise on every browser.
2. **No quality, no dimensions.** You choose a format, not a bitrate. If you need 200 KB exactly, or 1200 px wide, convert with this and resize/compress after, or start from the [Image Resizer](https://onlitools.com/image-resizer).
3. **HEIC decoding can pause.** HEIC is not natively decodable in most desktop browsers, so the tool ships a decoder. The first HEIC in a batch can sit at `Processing 3/6…` for a while before finishing. My six-file batch did complete; the wait was the decoder warming up, not a hang.
4. **It is memory-bound, not server-bound.** Fifty 40-megapixel photos in one batch means fifty decodes in one tab. Batching twenty at a time is kinder to your laptop than dragging in a whole photo library.

{{IMG:step4}}

## Which tool to reach for

The converter is one of a set that all run locally, and they compose badly if you pick the wrong one first:

- **Format is wrong** → [Image Converter](https://onlitools.com/image-converter) (this one)
- **File is too big, format is fine** → [Image Compressor](https://onlitools.com/image-compress)
- **Dimensions are wrong** → [Image Resizer](https://onlitools.com/image-resizer)
- **Just an iPhone HEIC photo** → [HEIC to JPG](https://onlitools.com/heic-to-jpg), a one-format shortcut
- **Suspicious about what the file carries** → [Image Info Viewer](https://onlitools.com/image-info) and [Remove EXIF Metadata](https://onlitools.com/remove-exif)

A sane order for a photo bound for the web: strip metadata, resize to the width you actually need, then convert or compress. Doing it in that order keeps quality and avoids re-encoding the same pixels three times.

## Try it

Open [onlitools.com/image-converter](https://onlitools.com/image-converter), drag in three files you already have, and watch the before/after column. Nothing is uploaded, so the only thing you can lose is thirty seconds.

*Screenshots were taken from the live tool in Chrome. The sample photo and HEIC files used in the test are generic samples, not personal images.*

// Long-form, tool-specific copy rendered under every tool page.
// The AdSense reviewer (and search engines) need more than a bare widget, so each
// entry explains what the tool does, when to use it and what its limits are.
export interface ToolContent {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

const compressTargets: Array<{ path: string; format: 'JPG' | 'PNG'; size: string }> = [
  { path: '/compress-jpg-to-100kb', format: 'JPG', size: '100 KB' },
  { path: '/compress-jpg-to-200kb', format: 'JPG', size: '200 KB' },
  { path: '/compress-jpg-to-500kb', format: 'JPG', size: '500 KB' },
  { path: '/compress-png-to-100kb', format: 'PNG', size: '100 KB' },
  { path: '/image-compress-to-20kb', format: 'JPG', size: '20 KB' },
  { path: '/image-compress-to-50kb', format: 'JPG', size: '50 KB' },
  { path: '/image-compress-to-100kb', format: 'JPG', size: '100 KB' },
  { path: '/image-compress-to-200kb', format: 'JPG', size: '200 KB' },
  { path: '/image-compress-to-500kb', format: 'JPG', size: '500 KB' },
  { path: '/image-compress-to-1mb', format: 'JPG', size: '1 MB' },
]

function compressContent(format: 'JPG' | 'PNG', size: string): ToolContent {
  const losslessNote = format === 'PNG'
    ? 'PNG is lossless, so the compressor reduces colour depth and strips ancillary chunks rather than throwing away pixels. Screenshots and flat graphics usually shrink the most.'
    : 'JPG uses lossy compression, so the tool lowers quality in small steps until the file fits your target while keeping the image visually acceptable.'
  const useCase = format === 'PNG'
    ? 'This is the right page when a portal, CMS or email template rejects uploads above the stated PNG limit.'
    : 'Use this page when a job application, ID portal, marketplace listing or email attachment enforces a hard size limit.'

  return {
    heading: `Compress ${format} images to ${size}`,
    paragraphs: [
      `This page opens the OnliTool image compressor with a ${size} target preset for ${format} files. ${useCase} Everything runs in your browser, so the picture is never uploaded to a server.`,
      `${losslessNote} After compression the tool shows the original and final size so you can confirm the file really fits the limit before downloading it.`,
    ],
    bullets: [
      `Works best on photos and screenshots that are only slightly above ${size}.`,
      'If quality drops too far, resize the image first and compress afterwards.',
      'The target is advisory: the result stays at or below the limit whenever the source has enough detail to remove.',
    ],
  }
}

const toolContent: Record<string, ToolContent> = {
  '/base64-to-image': {
    heading: 'Decode Base64 text back into an image',
    paragraphs: [
      'Paste a data URI or raw Base64 string and this tool turns it back into a downloadable PNG, JPG, GIF or WebP file. It is useful when an API, database dump or CSS file contains an inline image and you need the original asset again.',
      'Decoding happens locally. Nothing is uploaded, so it is safe for internal screenshots and design assets. Very large strings may be limited by your browser memory.',
    ],
    bullets: [
      'Accepts both `data:image/png;base64,...` and plain Base64 payloads.',
      'Detects common image signatures when the MIME type is missing.',
      'Use the reverse tool, Image to Base64, to embed an image in HTML or CSS.',
    ],
  },
  '/case-converter': {
    heading: 'Convert text between upper, lower, title and sentence case',
    paragraphs: [
      'The case converter rewrites text without touching its meaning. Paste a paragraph, headline, list of tags or variable names and switch between UPPERCASE, lowercase, Title Case, Sentence case and camel/Pascal/snake/kebab styles.',
      'It is handy for cleaning imported data, normalising CSV columns, fixing shouting headlines and preparing identifiers for code. Processing is instant and happens in the browser.',
    ],
    bullets: [
      'Title Case ignores short articles and prepositions for cleaner headlines.',
      'camelCase, PascalCase, snake_case and kebab-case help when renaming fields.',
      'Line breaks are preserved so lists stay lists.',
    ],
  },
  '/date-format': {
    heading: 'Format, convert and inspect dates and timestamps',
    paragraphs: [
      'This date tool converts between Unix timestamps, ISO 8601 strings and human-readable local dates, and formats output with custom patterns such as YYYY-MM-DD or DD/MM/YYYY HH:mm. It also shows the current timestamp so you can copy one immediately.',
      'Developers use it to debug timezone offsets, check what a stored epoch value really means, and generate consistent dates for logs, filenames and API payloads.',
    ],
    bullets: [
      'Supports seconds and milliseconds since the Unix epoch.',
      'Shows UTC and your local timezone side by side.',
      'Copy-ready output for SQL, JSON and JavaScript.',
    ],
  },
  '/exif-editor': {
    heading: 'Inspect and edit EXIF metadata',
    paragraphs: [
      'The EXIF editor reads the metadata stored inside JPG and TIFF photos — camera model, lens, exposure, capture date, orientation and GPS coordinates — and lets you change the fields you want to keep or overwrite. Editing happens locally in your browser.',
      'Photographers use it to correct a wrong capture date, add a copyright notice or remove location data before publishing. Always keep an untouched copy of the original file.',
    ],
    bullets: [
      'Review GPS, serial number and owner fields before sharing a photo.',
      'Edited files are re-encoded, so keep the original for archival use.',
      'Pair with Remove EXIF when you want to strip metadata entirely.',
    ],
  },
  '/exif-guide': {
    heading: 'What EXIF data is and why it matters',
    paragraphs: [
      'EXIF is the block of information cameras and phones write into a photo: shutter speed, aperture, ISO, lens, capture time, software and often the exact GPS position. It is useful for learning from your own shots, but it can expose more than you expect when a file is published.',
      'This guide explains the common fields, where they are stored, which ones survive editing and how to remove or keep them. It is the companion reference for the EXIF Editor and Remove EXIF tools.',
    ],
    bullets: [
      'GPS coordinates can reveal a home or workplace address.',
      'Screenshots usually have little EXIF, camera photos have a lot.',
      'Some platforms strip metadata automatically, many do not.',
    ],
  },
  '/font-compress': {
    heading: 'Shrink web fonts without breaking glyphs',
    paragraphs: [
      'The font compressor subsets TTF, OTF and WOFF files so only the characters you actually use are shipped. A full CJK font can weigh several megabytes; a subset containing a few hundred glyphs often lands in the low tens of kilobytes.',
      'Paste your text or choose a language preset, then download a smaller WOFF or WOFF2 file. The tool reports the glyph count and size saving so you can verify the result before adding it to a site.',
    ],
    bullets: [
      'Include Latin letters, digits and punctuation if the page mixes languages.',
      'Keep the original font file for future edits — subsets cannot regain glyphs.',
      'WOFF2 is the best default for modern browsers.',
    ],
  },
  '/font-css-generator': {
    heading: 'Generate @font-face CSS for a web font',
    paragraphs: [
      'Upload a font and this generator produces a ready-to-paste @font-face block with the correct formats, font-weight, font-style and optional unicode-range. It also previews the family name so you can confirm the CSS matches your file.',
      'Use it when moving a custom brand font into a project and you want to avoid hand-writing format hints or guessing weights. The generated CSS works with plain sites and with frameworks such as Tailwind or Nuxt.',
    ],
    bullets: [
      'Use font-display: swap so text stays visible while the font loads.',
      'Provide WOFF2 first, then WOFF as a fallback.',
      'Set unicode-range when you split Latin and CJK subsets.',
    ],
  },
  '/font-inspector': {
    heading: 'Inspect the details of a font file',
    paragraphs: [
      'Font Inspector opens a TTF, OTF or WOFF file and reports its family name, style, weight, glyph count, units per em and supported character ranges. It also renders a sample so you can see how the font actually looks before installing it.',
      'This is useful when a downloaded font has an unexpected name, when you need to confirm that Chinese or Arabic glyphs are present, or when you are choosing between several versions of the same family.',
    ],
    bullets: [
      'Check the internal family name, not just the file name.',
      'Verify that the character set covers your target language.',
      'Compare weights before pairing fonts in a design system.',
    ],
  },
  '/font-size-analyzer': {
    heading: 'Measure how large a font will be on the web',
    paragraphs: [
      'Font Size Analyzer estimates the transfer size of a font in TTF, OTF, WOFF and WOFF2 form and shows how much each format saves. It helps you decide whether a font is realistic for a landing page or needs subsetting first.',
      'Large fonts are one of the most common causes of slow first render. Running a font through this analyzer before shipping it makes the trade-off between typography and performance visible.',
    ],
    bullets: [
      'WOFF2 is usually 25–35% smaller than WOFF.',
      'Compare against a subsetted file for a realistic number.',
      'Remember that every additional weight is another download.',
    ],
  },
  '/font-unicode-checker': {
    heading: 'Check which characters a font supports',
    paragraphs: [
      'The Unicode checker verifies whether a font contains the glyphs needed for a piece of text or a language preset. Paste your copy and the tool lists missing characters instead of letting them fall back to a different font mid-sentence.',
      'It is especially useful for multilingual sites, where a Latin font may silently lack accented letters, currency signs or CJK characters. The check runs locally on the file you select.',
    ],
    bullets: [
      'Test real copy, including punctuation and symbols.',
      'Missing glyphs often show up as boxes or fallback fonts.',
      'Use the result to decide which characters to include in a subset.',
    ],
  },
  '/font-validator': {
    heading: 'Validate a font file before you ship it',
    paragraphs: [
      'The validator parses a font and reports structural problems: broken tables, missing required names, invalid checksums and unsupported formats. Catching these issues locally avoids a font that fails silently in some browsers.',
      'It is a quick pre-flight check for fonts downloaded from marketplaces, converted from another format, or produced by a subsetting step.',
    ],
    bullets: [
      'A file can look fine in one browser and fail in another.',
      'Re-export broken fonts from the original source when possible.',
      'Combine validation with a glyph coverage check.',
    ],
  },
  '/gps-remover': {
    heading: 'Remove GPS coordinates from photos',
    paragraphs: [
      'This tool strips latitude, longitude, altitude and direction from image metadata while leaving the picture itself untouched. It is the fastest way to share a photo without revealing where it was taken.',
      'Many phones embed precise GPS data by default. Removing it is a sensible habit before posting images of your home, workplace or children. Processing is local, and the cleaned file is downloaded directly.',
    ],
    bullets: [
      'Check both GPS and camera serial fields before publishing.',
      'Keep the original if you need the location for your own archive.',
      'Some messaging apps re-add location data if you resend the original.',
    ],
  },
  '/hash-text': {
    heading: 'Generate MD5, SHA-1, SHA-256 and SHA-512 hashes',
    paragraphs: [
      'Hash Text computes cryptographic digests of any text directly in your browser. Paste a password, a token, a file fragment or a sentence and compare the MD5, SHA-1, SHA-256 and SHA-512 results.',
      'Hashes are useful for verifying data integrity, generating deterministic identifiers and checking that two strings are identical without storing the original. They are not encryption and cannot be reversed.',
    ],
    bullets: [
      'Use SHA-256 or SHA-512 for security-related work; MD5 is legacy.',
      'The same input always produces the same digest.',
      'Never treat a plain hash as password storage without salting and stretching.',
    ],
  },
  '/heic-to-jpg': {
    heading: 'Convert iPhone HEIC photos to JPG',
    paragraphs: [
      'HEIC is the default photo format on modern iPhones, but many websites, Windows apps and older editors cannot open it. This converter turns one or several HEIC files into standard JPG images that work everywhere.',
      'The conversion runs in your browser, so personal photos are not uploaded. Batch mode lets you convert a whole album and download the results as a ZIP archive.',
    ],
    bullets: [
      'Keep the HEIC originals if you may edit them later.',
      'JPG conversion is lossy; choose a high quality setting for print.',
      'Conversion preserves orientation but not every metadata field.',
    ],
  },
  '/id-photo': {
    heading: 'Create passport and ID photos online',
    paragraphs: [
      'The ID photo maker crops a portrait to common document sizes such as 1-inch, 2-inch, passport and visa, with guides for head position and background. You can adjust brightness, contrast, saturation and crop before exporting.',
      'It is intended for quick home printing and online applications. Official documents have strict rules about background colour, expression and resolution, so always check the requirements of the authority receiving the photo.',
    ],
    bullets: [
      'Use a plain, evenly lit background and face the camera directly.',
      'Export at the resolution the application asks for.',
      'The tool does not guarantee acceptance by any government agency.',
    ],
  },
  '/image-aspect-ratio': {
    heading: 'Calculate and change image aspect ratios',
    paragraphs: [
      'Enter the original and target dimensions to see whether cropping or padding is needed, or resize an image to a common ratio such as 16:9, 4:3, 1:1 or 9:16. The tool shows the exact pixel sizes required to avoid distortion.',
      'Aspect ratio mistakes are a common reason thumbnails look stretched on social platforms. Working out the numbers first saves a second export.',
    ],
    bullets: [
      'Crop when the subject can lose edges; pad when it cannot.',
      'Social platforms often crop again, so leave safe margins.',
      'Keep the largest reasonable source for future reuse.',
    ],
  },
  '/image-color-picker': {
    heading: 'Pick colours and coordinates from an image',
    paragraphs: [
      'Upload a picture and click any pixel to read its HEX, RGB and HSL values. The picker is useful for matching a brand colour from a screenshot, sampling a palette from a photo or checking that a design uses consistent tones.',
      'The image stays in your browser; no upload occurs. You can copy a value with one click and paste it into CSS, Figma or a design token file.',
    ],
    bullets: [
      'HEX is the most common format for web CSS.',
      'HSL makes it easier to adjust lightness and saturation.',
      'Sample several pixels to average out compression noise.',
    ],
  },
  '/image-compress': {
    heading: 'Compress images to a target size',
    paragraphs: [
      'The image compressor reduces JPG, PNG and WebP files to a size you choose, balancing quality against file weight. Use it to meet upload limits, speed up a page or shrink an email attachment.',
      'You can compress a single image or a batch, preview the result and download everything as a ZIP. All processing happens locally, so private photos never leave your device.',
    ],
    bullets: [
      'Start with a target slightly below the limit for safety.',
      'Resize before compressing when the pixel dimensions are excessive.',
      'PNG screenshots often benefit from conversion to WebP or JPG.',
    ],
  },
  '/image-converter': {
    heading: 'Convert images between JPG, PNG, WebP and more',
    paragraphs: [
      'This converter changes an image from one format to another without installing software. Choose the output format, adjust quality where relevant and download the converted file or a ZIP for a batch.',
      'It is useful when a platform only accepts JPG, when you want the smaller size of WebP, or when a transparent PNG needs to become a flattened JPG with a chosen background.',
    ],
    bullets: [
      'WebP is usually smaller than JPG at similar quality.',
      'JPG does not support transparency; the background becomes solid.',
      'Convert after cropping and resizing to avoid repeated quality loss.',
    ],
  },
  '/image-cropper': {
    heading: 'Crop images precisely in the browser',
    paragraphs: [
      'Crop a photo to a square, a story format, a banner or any custom rectangle. Drag the selection, lock an aspect ratio and export only the area you need. The crop is applied locally, so the original file is untouched.',
      'Cropping is often better than resizing alone: it removes distracting edges and lets a subject fill the frame at the dimensions a platform expects.',
    ],
    bullets: [
      'Lock 1:1 for avatars and 9:16 for stories.',
      'Leave headroom when the platform may overlay UI.',
      'Export at the largest size the target supports.',
    ],
  },
  '/image-generator': {
    heading: 'Generate images from a text prompt',
    paragraphs: [
      'The AI image generator creates pictures from a written description. Describe the subject, style, lighting and composition, choose an aspect ratio and generate. Results are best when the prompt is specific rather than a single word.',
      'Use it for mood boards, blog illustrations, social posts and concept art. Check the licence terms before commercial use and avoid prompts that imitate a living artist or produce misleading depictions of real people.',
    ],
    bullets: [
      'Mention medium, lighting and camera angle for control.',
      'Iterate on one detail at a time instead of rewriting everything.',
      'Review hands, text and symmetry before publishing.',
    ],
  },
  '/image-info': {
    heading: 'Read image dimensions, format and metadata',
    paragraphs: [
      'Image Info shows the pixel dimensions, file size, MIME type, colour space and metadata of an uploaded picture. It answers questions like “is this actually 3000 px wide?” or “why is this PNG so large?” without opening an editor.',
      'The file is inspected in your browser. Use the result to decide whether an image needs resizing, format conversion or metadata removal before it goes on a website.',
    ],
    bullets: [
      'Check dimensions before uploading to print or marketplace portals.',
      'A large file size with small dimensions often means metadata or noise.',
      'Compare formats to pick the smallest acceptable one.',
    ],
  },
  '/image-metadata': {
    heading: 'View all metadata stored in an image',
    paragraphs: [
      'This viewer lists EXIF, IPTC and XMP fields in a readable table: camera, lens, exposure, dates, software, copyright and GPS. It is a quick way to see what a photo reveals before you publish it.',
      'Metadata is read locally. Export the table when you need a record for an archive, or open the EXIF editor to change individual values.',
    ],
    bullets: [
      'GPS and serial numbers are the most sensitive fields.',
      'Editing software often rewrites the Software tag.',
      'Screenshots usually contain very little metadata.',
    ],
  },
  '/image-metadata-remover': {
    heading: 'Strip metadata from images',
    paragraphs: [
      'Remove EXIF, IPTC, XMP and comments from JPG, PNG and WebP files while keeping the visual content unchanged. This is the broadest cleanup option when you want a file with no hidden information at all.',
      'It is useful before publishing photos, sending documents to clients or uploading images to platforms that display metadata. Processing stays on your device.',
    ],
    bullets: [
      'Keep a private copy if you rely on capture dates for archiving.',
      'Some formats re-add a minimal header after editing.',
      'Combine with a visual check to confirm orientation is still correct.',
    ],
  },
  '/image-privacy': {
    heading: 'Check an image for privacy leaks',
    paragraphs: [
      'Photos can carry GPS position, device serial numbers, owner names and editing history. This page explains the risks and points to the tools that inspect or remove each kind of metadata.',
      'Run a photo through the metadata viewer before sharing it publicly, then strip location and personal fields. It takes less than a minute and prevents accidental disclosure of where you live or work.',
    ],
    bullets: [
      'Phones often embed precise GPS by default.',
      'Screenshots can leak account names and file paths.',
      'Removing metadata does not alter the visible pixels.',
    ],
  },
  '/image-resizer': {
    heading: 'Resize images to exact pixel dimensions',
    paragraphs: [
      'Set a width, height or percentage and resize an image without distortion. The tool keeps the aspect ratio locked unless you deliberately unlock it, and shows the resulting dimensions before export.',
      'Resizing is the first step before compression when a photo is far larger than the place it will be displayed. Smaller dimensions reduce file size more reliably than aggressive quality reduction.',
    ],
    bullets: [
      'Never upscale a small image for print; it will look soft.',
      'Resize to roughly twice the CSS display size for retina screens.',
      'Resize first, then compress to the final target.',
    ],
  },
  '/image-to-base64': {
    heading: 'Convert an image to a Base64 data URI',
    paragraphs: [
      'This tool encodes an image as Base64 and produces a data URI you can paste into HTML, CSS or JSON. It is convenient for tiny icons, email templates and offline single-file demos where an extra request is undesirable.',
      'Encoding increases the payload by roughly a third, so use it only for small assets. The conversion runs locally and never uploads your file.',
    ],
    bullets: [
      'Keep data URIs under a few kilobytes.',
      'Prefer normal image files for photos and large graphics.',
      'Use Base64 to Image to reverse the process.',
    ],
  },
  '/increase-image-size': {
    heading: 'Upscale an image to larger dimensions',
    paragraphs: [
      'Increase the pixel dimensions of an image for a marketplace, print template or retina layout. The tool resamples the picture and lets you compare the result, but it cannot invent detail that was never captured.',
      'For modest enlargements, a good resampling filter is enough. For very large jumps, start from the highest-resolution original you have rather than upscaling a compressed copy.',
    ],
    bullets: [
      'Upscaling cannot restore lost sharpness.',
      'Avoid repeated upscale/downscale cycles.',
      'Check the final size against the portal requirement.',
    ],
  },
  '/json-compare': {
    heading: 'Compare two JSON documents',
    paragraphs: [
      'Paste two JSON payloads and see exactly which keys were added, removed or changed. The diff highlights values at field level instead of showing two long text blocks, which makes API response changes much easier to review.',
      'It is useful for debugging webhooks, checking configuration drift and reviewing changes before deploying. Both documents are processed in your browser.',
    ],
    bullets: [
      'Format both sides first for a readable diff.',
      'Nested objects are compared key by key.',
      'Use it to confirm that a migration changed only what you expected.',
    ],
  },
  '/json-csv-convert': {
    heading: 'Convert between JSON and CSV',
    paragraphs: [
      'Turn a JSON array into a CSV spreadsheet, or import CSV rows as JSON objects. Choose the delimiter, handle nested fields and copy or download the result. This is a common step when moving data between an API and Excel or Google Sheets.',
      'Conversion is local, so customer data does not leave your machine. Check that column names and types survive the round trip before importing into production.',
    ],
    bullets: [
      'CSV is flat; nested objects need flattening or stringification.',
      'Quote fields that contain commas or line breaks.',
      'Keep a JSON copy if you need to preserve types.',
    ],
  },
  '/json-formatter': {
    heading: 'Format, validate and minify JSON',
    paragraphs: [
      'Paste JSON and the formatter indents it into a readable tree, highlights syntax errors with a line number and lets you minify it again for production. You can copy the result or download it as a file.',
      'It is the quickest way to inspect an API response, clean up a config file or check that a payload is valid before sending it. The JSON is parsed in your browser and never uploaded.',
    ],
    bullets: [
      'Validation stops at the first syntax error and reports its position.',
      'Minify after editing to remove insignificant whitespace.',
      'Large payloads may be limited by available browser memory.',
    ],
  },
  '/metadata-analyzer': {
    heading: 'Analyse image metadata at a glance',
    paragraphs: [
      'The metadata analyser groups EXIF, IPTC and XMP fields into categories and flags the ones that carry privacy or compliance risk, such as GPS, owner and serial number. It turns a wall of tags into a short review list.',
      'Use it before publishing a photo library or sending images to a client. Once you know what is present, the editor or remover tools can act on it.',
    ],
    bullets: [
      'GPS and owner fields deserve the first review.',
      'Dates help verify that a photo is recent.',
      'Software tags reveal the editing pipeline.',
    ],
  },
  '/remove-exif': {
    heading: 'Remove EXIF data from photos',
    paragraphs: [
      'Strip EXIF metadata from JPG and PNG images without changing how they look. Camera model, capture time, software history and GPS coordinates are removed, leaving a clean file that is safe to publish.',
      'This is a one-click privacy step for photos taken on a phone. If you only need to hide the location, the GPS remover is a narrower option.',
    ],
    bullets: [
      'Keep the original for your own dated archive.',
      'Removing metadata does not reduce the visible quality.',
      'Some platforms strip metadata automatically; many do not.',
    ],
  },
  '/send-script-to-remote-user': {
    heading: 'Share a note or snippet with another person',
    paragraphs: [
      'Create a note, choose an expiry time and share a link instead of pasting a long block into chat. The recipient can read it in the browser, and the note disappears automatically when it expires.',
      'It is designed for short-lived handoffs such as a command, a configuration fragment or a draft message. Do not use it for passwords, keys or other long-term secrets.',
    ],
    bullets: [
      'Set the shortest expiry that still works for the recipient.',
      'Anyone with the link can read the note, so share it privately.',
      'Assume the content is public and avoid confidential data.',
    ],
  },
  '/svg-converter': {
    heading: 'Convert SVG files to PNG or JPG',
    paragraphs: [
      'Rasterise an SVG logo or illustration to PNG or JPG at the size you need. Vector source stays crisp, while a raster export is accepted by platforms that do not support SVG uploads.',
      'Choose a background colour when exporting to JPG, because JPG cannot store transparency. The conversion happens in your browser and the original SVG is not modified.',
    ],
    bullets: [
      'Export at 2× the display size for sharp retina images.',
      'Use PNG when transparent areas are needed.',
      'Keep the SVG as the editable master file.',
    ],
  },
  '/token-generator': {
    heading: 'Generate random tokens and passwords',
    paragraphs: [
      'Create cryptographically random strings for API keys, session tokens, invite codes and test data. Choose the length and character set, then copy the result. Generation uses the browser crypto API and nothing is sent to a server.',
      'Longer tokens are exponentially harder to guess. For production secrets, generate at least 32 bytes and store them in a secret manager rather than in source code.',
    ],
    bullets: [
      'Use letters, digits and symbols for passwords.',
      'Hex is convenient for keys and identifiers.',
      'Rotate tokens regularly and never reuse them across services.',
    ],
  },
  '/video-generator': {
    heading: 'Generate short videos from text or an image',
    paragraphs: [
      'The AI video generator turns a text prompt or a still image into a short clip. Describe the subject, motion, camera move and mood, then choose a duration and aspect ratio. Short, specific prompts usually produce the most coherent results.',
      'Use it for social teasers, concept previews and background loops. Review faces, text and physics before publishing, and check the licence terms for commercial use.',
    ],
    bullets: [
      'Describe motion explicitly, for example “slow dolly forward”.',
      'Keep clips short; longer generations are harder to control.',
      'Generate several variants and pick the best one.',
    ],
  },
  '/uppercase': {
    heading: 'Convert text to uppercase',
    paragraphs: [
      'Paste text and convert every letter to uppercase instantly. Useful for labels, banners, code constants and legacy systems that expect capitalised input. The original text is not stored.',
      'For mixed formatting such as title case or camelCase, open the full case converter instead.',
    ],
    bullets: [
      'Uppercase text is harder to read in long paragraphs.',
      'Use CSS text-transform when the original text should stay editable.',
      'Switch to the case converter for more styles.',
    ],
  },
  '/prompts': {
    heading: 'A curated prompt library for everyday AI work',
    paragraphs: [
      'The prompt library collects reusable instructions for writing, coding, image generation and analysis. Open a prompt, copy it and replace the placeholders with your own context.',
      'Prompts are community contributions. They are reviewed for obvious problems, but results always depend on the model you use. Do not paste confidential data into a third-party model.',
    ],
    bullets: [
      'Adapt the role, audience and output format to your task.',
      'Ask for a specific structure instead of “make it better”.',
      'Report prompts that are unsafe or misleading.',
    ],
  },
  '/image-to-webp': {
    heading: 'Convert JPG and PNG images to WebP',
    paragraphs: [
      'WebP usually produces smaller files than JPG or PNG at comparable quality, which makes pages load faster. This converter accepts one image or a batch and writes WebP files you can upload directly.',
      'Transparency is supported, so WebP can replace PNG for UI assets as well as photos. Check that your target platform accepts WebP; older email clients often do not.',
    ],
    bullets: [
      'Use quality around 75–85 for photos.',
      'Keep a PNG or SVG master for flat graphics.',
      'Provide a JPG fallback for very old browsers if needed.',
    ],
  },
  '/webp-to-jpg': {
    heading: 'Convert WebP images to JPG',
    paragraphs: [
      'Some editors, marketplaces and email tools still reject WebP. This converter turns WebP files into standard JPG images with a quality setting you control.',
      'Transparency becomes a solid background in JPG, so choose a background colour that matches where the image will appear.',
    ],
    bullets: [
      'JPG is universally supported but does not keep transparency.',
      'Use PNG instead when transparent areas matter.',
      'Convert back to WebP for the final website asset.',
    ],
  },
  '/webp-to-png': {
    heading: 'Convert WebP images to PNG',
    paragraphs: [
      'Convert WebP to PNG when you need lossless output or transparency support in an application that cannot read WebP. PNG files are larger, but they preserve sharp edges and alpha channels.',
      'This is a good choice for logos, icons and screenshots that will be edited further. For photos destined for the web, keep WebP or JPG instead.',
    ],
    bullets: [
      'PNG is best for text, line art and transparency.',
      'Expect a larger file than the WebP original.',
      'Optimise the PNG afterwards if page weight matters.',
    ],
  },
}

for (const target of compressTargets) {
  toolContent[target.path] = compressContent(target.format, target.size)
}

export default toolContent

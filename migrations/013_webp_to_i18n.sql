DELETE FROM page_lang
WHERE route = 'all'
  AND key IN (
    'webpTo.title',
    'webpTo.description',
    'webpTo.keywords',
    'webpTo.seoSuffix',
    'webpTo.intro'
  );

INSERT INTO page_lang (route, key, value, lang) VALUES
  ('all', 'webpTo.title', 'WebP转{format}在线工具', 'zh'),
  ('all', 'webpTo.description', '在线批量将 WebP 图片转换为 {format}，支持一次处理多张图片并打包下载 ZIP，文件仅在浏览器本地处理，不上传服务器。', 'zh'),
  ('all', 'webpTo.keywords', 'WebP转{format},WebP批量转换,批量图片转换,{format}在线工具,本地图片处理,不上传文件', 'zh'),
  ('all', 'webpTo.seoSuffix', '图片格式转换 | 批量处理', 'zh'),
  ('all', 'webpTo.intro', 'WebP 支持多种图片格式批量转换，单图直接下载，多图打包下载。', 'zh'),
  ('all', 'webpTo.title', 'WebP to {format} Online Tool', 'en'),
  ('all', 'webpTo.description', 'Convert WebP images to {format} in batches. Process multiple images at once and download them as a ZIP file. Files are processed locally in your browser and never uploaded.', 'en'),
  ('all', 'webpTo.keywords', 'WebP to {format}, WebP batch converter, batch image conversion, {format} online tool, local image processing, no upload', 'en'),
  ('all', 'webpTo.seoSuffix', 'Image Converter | Batch Processing', 'en'),
  ('all', 'webpTo.intro', 'Convert WebP images to multiple formats in batches, with direct downloads for single images and ZIP downloads for multiple images.', 'en');
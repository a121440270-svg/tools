-- 先删除本次新增的批量 WebP SEO 词条，再插入多语言版本。
-- 原有 webp.* 词条不做修改。
DELETE FROM page_lang
WHERE route = 'all'
  AND key IN (
    'webp.seo_title',
    'webp.seo_desc',
    'webp.seo_keywords',
    'webp.batch_message',
    'webp.local_message',
    'webpTo.batch_message',
    'webpTo.local_message',
    'webpTo.batch_success'
  );

INSERT INTO page_lang (route, key, value, lang) VALUES
  ('all', 'webp.seo_title', '批量 JPG/PNG 转 WebP 在线工具', 'zh'),
  ('all', 'webp.seo_desc', '在线批量将 JPG、JPEG、PNG 图片转换为 WebP，支持一次选择多张图片并打包下载 ZIP，文件仅在浏览器本地处理，不会上传。', 'zh'),
  ('all', 'webp.seo_keywords', '批量图片转换, JPG转WebP, PNG转WebP, 批量WebP转换器, 在线图片格式转换', 'zh'),
  ('all', 'webp.batch_message', '支持一次选择多张 JPG、PNG 图片，批量转换为 WebP。', 'zh'),
  ('all', 'webp.local_message', '文件仅在浏览器本地处理，不会上传到服务器。', 'zh'),

  ('all', 'webp.seo_title', 'Batch JPG/PNG to WebP Converter Online', 'en'),
  ('all', 'webp.seo_desc', 'Convert multiple JPG, JPEG, and PNG images to WebP online. Select images in bulk and download the converted files as a ZIP archive. Files are processed locally in your browser and never uploaded.', 'en'),
  ('all', 'webp.seo_keywords', 'batch image converter, JPG to WebP, PNG to WebP, bulk WebP converter, online image converter', 'en'),
  ('all', 'webp.batch_message', 'Select multiple JPG and PNG images to convert them to WebP in one batch.', 'en'),
  ('all', 'webp.local_message', 'Files are processed locally in your browser and are never uploaded.', 'en'),

  ('all', 'webp.seo_title', 'JPG/PNG stapelweise in WebP konvertieren', 'de'),
  ('all', 'webp.seo_desc', 'Mehrere JPG-, JPEG- und PNG-Bilder online in WebP konvertieren. Bilder gesammelt auswählen und die Ergebnisse als ZIP-Datei herunterladen. Die Dateien werden lokal im Browser verarbeitet und nicht hochgeladen.', 'de'),
  ('all', 'webp.seo_keywords', 'Bildkonverter stapelweise, JPG in WebP, PNG in WebP, WebP-Batch-Konverter, Online-Bildkonverter', 'de'),
  ('all', 'webp.batch_message', 'Mehrere JPG- und PNG-Bilder auswählen und in einem Durchgang in WebP konvertieren.', 'de'),
  ('all', 'webp.local_message', 'Die Dateien werden lokal im Browser verarbeitet und nicht hochgeladen.', 'de'),

  ('all', 'webp.seo_title', 'Convertisseur JPG/PNG vers WebP par lots', 'fr'),
  ('all', 'webp.seo_desc', 'Convertissez plusieurs images JPG, JPEG et PNG en WebP en ligne. Sélectionnez plusieurs images et téléchargez les résultats dans une archive ZIP. Les fichiers sont traités localement dans votre navigateur et ne sont jamais téléversés.', 'fr'),
  ('all', 'webp.seo_keywords', 'convertisseur d images par lots, JPG vers WebP, PNG vers WebP, convertisseur WebP en masse, convertisseur d images en ligne', 'fr'),
  ('all', 'webp.batch_message', 'Sélectionnez plusieurs images JPG et PNG pour les convertir en WebP en une seule fois.', 'fr'),
  ('all', 'webp.local_message', 'Les fichiers sont traités localement dans votre navigateur et ne sont jamais téléversés.', 'fr'),

  ('all', 'webpTo.batch_message', '支持一次选择多张 WebP 图片，批量转换后自动打包为 ZIP 下载。', 'zh'),
  ('all', 'webpTo.local_message', '文件仅在浏览器本地处理，不会上传到服务器。', 'zh'),
  ('all', 'webpTo.batch_success', '已批量转换 {count} 张图片', 'zh'),

  ('all', 'webpTo.batch_message', 'Select multiple WebP images and download batch results as a ZIP file.', 'en'),
  ('all', 'webpTo.local_message', 'Files are processed locally in your browser and are never uploaded.', 'en'),
  ('all', 'webpTo.batch_success', 'Batch converted {count} images', 'en'),

  ('all', 'webpTo.batch_message', 'Mehrere WebP-Bilder auswählen und die Ergebnisse gesammelt als ZIP-Datei herunterladen.', 'de'),
  ('all', 'webpTo.local_message', 'Die Dateien werden lokal im Browser verarbeitet und nicht hochgeladen.', 'de'),
  ('all', 'webpTo.batch_success', '{count} Bilder wurden stapelweise konvertiert', 'de'),

  ('all', 'webpTo.batch_message', 'Sélectionnez plusieurs images WebP et téléchargez les résultats dans une archive ZIP.', 'fr'),
  ('all', 'webpTo.local_message', 'Les fichiers sont traités localement dans votre navigateur et ne sont jamais téléversés.', 'fr'),
  ('all', 'webpTo.batch_success', '{count} images converties par lots', 'fr');
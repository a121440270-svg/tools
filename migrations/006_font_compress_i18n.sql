-- 先删除，再插入：font compress 页面中英双语词条
DELETE FROM page_lang
WHERE route = 'all'
  AND key IN (
    'font.title',
    'font.desc',
    'font.h1',
    'font.lead',
    'font.upload',
    'font.selected',
    'font.origin_size',
    'font.input_chars',
    'font.input_placeholder',
    'font.char_count',
    'font.upload_text',
    'font.text_selected',
    'font.output_type',
    'font.start',
    'font.clear',
    'font.success',
    'font.download',
    'font.only_glyphs',
    'font.compressed_size',
    'font.error',
    'font.preview_generating',
    'font.section.subsetting_title',
    'font.section.subsetting_text',
    'font.section.steps_title',
    'font.section.steps_1',
    'font.section.steps_2',
    'font.section.steps_3',
    'font.section.steps_4',
    'font.section.why_title',
    'font.section.why_text',
    'font.section.faq_title',
    'font.section.faq_1_q',
    'font.section.faq_1_a',
    'font.section.faq_2_q',
    'font.section.faq_2_a',
    'font.section.faq_3_q',
    'font.section.faq_3_a',
    'font.section.faq_4_q',
    'font.section.faq_4_a'
  );

INSERT INTO page_lang (route, key, value, lang) VALUES
  ('all', 'font.title', '免费字体压缩与子集化工具', 'zh'),
  ('all', 'font.title', 'Free Font Compressor & Subsetter', 'en'),

  ('all', 'font.desc', '上传 TTF 字体，输入需要保留的字符，移除未使用字形，生成更小的字体文件，适合网页性能优化。', 'zh'),
  ('all', 'font.desc', 'Upload a TTF font, enter the characters you need, remove unused glyphs, and generate a smaller font file for better web performance.', 'en'),

  ('all', 'font.h1', '免费字体压缩与子集化工具', 'zh'),
  ('all', 'font.h1', 'Free Font Compressor & Subsetter', 'en'),

  ('all', 'font.lead', '在线压缩 TTF 字体，移除未使用的字形和字符，减少字体文件大小，适合网页和前端性能优化。', 'zh'),
  ('all', 'font.lead', 'Compress TTF fonts online, remove unused glyphs and characters, and reduce font file size for better web and frontend performance.', 'en'),

  ('all', 'font.upload', '上传 TTF 字体', 'zh'),
  ('all', 'font.upload', 'Upload TTF Font', 'en'),

  ('all', 'font.selected', '已选择: {name}', 'zh'),
  ('all', 'font.selected', 'Selected: {name}', 'en'),

  ('all', 'font.origin_size', '原始大小: {size}', 'zh'),
  ('all', 'font.origin_size', 'Original size: {size}', 'en'),

  ('all', 'font.input_chars', '输入字符', 'zh'),
  ('all', 'font.input_chars', 'Input Characters', 'en'),

  ('all', 'font.input_placeholder', '请输入需要保留的字符', 'zh'),
  ('all', 'font.input_placeholder', 'Enter the characters you want to keep', 'en'),

  ('all', 'font.char_count', '去重后共 {count} 个', 'zh'),
  ('all', 'font.char_count', 'Deduplicated: {count}', 'en'),

  ('all', 'font.upload_text', '或上传文本', 'zh'),
  ('all', 'font.upload_text', 'Or upload text', 'en'),

  ('all', 'font.text_selected', '已选择: {name}', 'zh'),
  ('all', 'font.text_selected', 'Selected: {name}', 'en'),

  ('all', 'font.output_type', '输出格式', 'zh'),
  ('all', 'font.output_type', 'Output Format', 'en'),

  ('all', 'font.start', '开始压缩', 'zh'),
  ('all', 'font.start', 'Start Compression', 'en'),

  ('all', 'font.clear', '全部清空', 'zh'),
  ('all', 'font.clear', 'Clear All', 'en'),

  ('all', 'font.success', '压缩完成', 'zh'),
  ('all', 'font.success', 'Compression Complete', 'en'),

  ('all', 'font.download', '点击下载压缩后的字体文件', 'zh'),
  ('all', 'font.download', 'Click to download the compressed font', 'en'),

  ('all', 'font.only_glyphs', '(仅包含所需字形)', 'zh'),
  ('all', 'font.only_glyphs', '(Only contains required glyphs)', 'en'),

  ('all', 'font.compressed_size', '压缩后: {size}', 'zh'),
  ('all', 'font.compressed_size', 'Compressed: {size}', 'en'),

  ('all', 'font.error', '字体压缩失败: {msg}', 'zh'),
  ('all', 'font.error', 'Font compression failed: {msg}', 'en'),

  ('all', 'font.preview_generating', '字体预览生成中...', 'zh'),
  ('all', 'font.preview_generating', 'Generating font preview...', 'en'),

  ('all', 'font.section.subsetting_title', '什么是字体子集化', 'zh'),
  ('all', 'font.section.subsetting_title', 'What is font subsetting?', 'en'),

  ('all', 'font.section.subsetting_text', '字体子集化会删除未使用的字形和字符，只保留当前项目真正需要的字符，从而显著减少字体文件体积。', 'zh'),
  ('all', 'font.section.subsetting_text', 'Font subsetting removes unused glyphs and characters, keeping only the ones your project actually needs to significantly reduce font file size.', 'en'),

  ('all', 'font.section.steps_title', '如何压缩 TTF 字体', 'zh'),
  ('all', 'font.section.steps_title', 'How to compress a TTF font', 'en'),

  ('all', 'font.section.steps_1', '上传你的 TTF 字体文件。', 'zh'),
  ('all', 'font.section.steps_1', 'Upload your TTF font file.', 'en'),

  ('all', 'font.section.steps_2', '输入需要保留的字符或文本。', 'zh'),
  ('all', 'font.section.steps_2', 'Enter the characters or text you want to keep.', 'en'),

  ('all', 'font.section.steps_3', '选择输出格式，例如 TTF 或 WOFF。', 'zh'),
  ('all', 'font.section.steps_3', 'Choose the output format, such as TTF or WOFF.', 'en'),

  ('all', 'font.section.steps_4', '点击“开始压缩”，下载优化后的字体。', 'zh'),
  ('all', 'font.section.steps_4', 'Click Start Compression and download the optimized font.', 'en'),

  ('all', 'font.section.why_title', '为什么要使用字体压缩工具', 'zh'),
  ('all', 'font.section.why_title', 'Why use a font compressor?', 'en'),

  ('all', 'font.section.why_text', '大字体会增加页面加载时间，尤其在移动端和多字体场景下更明显。通过字体压缩和子集化，可以显著优化网页性能并减少下载体积。', 'zh'),
  ('all', 'font.section.why_text', 'Large fonts increase page load time, especially on mobile devices or when multiple font files are used. Font compression and subsetting can significantly improve web performance and reduce download size.', 'en'),

  ('all', 'font.section.faq_title', '常见问题', 'zh'),
  ('all', 'font.section.faq_title', 'Frequently asked questions', 'en'),

  ('all', 'font.section.faq_1_q', '什么是字体子集化工具？', 'zh'),
  ('all', 'font.section.faq_1_q', 'What is a font subsetting tool?', 'en'),

  ('all', 'font.section.faq_1_a', '字体子集化工具会保留你真正需要的字符，并删除不需要的字形，从而生成更小的字体文件。', 'zh'),
  ('all', 'font.section.faq_1_a', 'A font subsetting tool keeps the characters you actually need and removes the rest to create a smaller font file.', 'en'),

  ('all', 'font.section.faq_2_q', '如何减小 TTF 文件大小？', 'zh'),
  ('all', 'font.section.faq_2_q', 'How do I reduce the size of a TTF file?', 'en'),

  ('all', 'font.section.faq_2_a', '上传 TTF 文件，并输入所需字符，再生成子集字体即可移除未使用字形，减少文件体积。', 'zh'),
  ('all', 'font.section.faq_2_a', 'Upload the TTF file, input the required characters, and generate a subset font to remove unused glyphs and shrink the file size.', 'en'),

  ('all', 'font.section.faq_3_q', '字体子集化是否能提升网页性能？', 'zh'),
  ('all', 'font.section.faq_3_q', 'Does font subsetting improve web performance?', 'en'),

  ('all', 'font.section.faq_3_a', '可以。较小的字体文件意味着更少的下载量，也能让页面更快加载，同时保留所需字符。', 'zh'),
  ('all', 'font.section.faq_3_a', 'Yes. Smaller font files mean less downloaded data and faster page loading while keeping the required characters available.', 'en'),

  ('all', 'font.section.faq_4_q', 'WOFF 是否比 TTF 更小？', 'zh'),
  ('all', 'font.section.faq_4_q', 'Is WOFF smaller than TTF?', 'en'),

  ('all', 'font.section.faq_4_a', '对于网页交付来说，WOFF 通常更适合使用，因为它对浏览器传输更友好。将 WOFF 输出与字体子集化结合是常见优化方案。', 'zh'),
  ('all', 'font.section.faq_4_a', 'For web delivery, WOFF is often more suitable because it is optimized for browser transfer. Combining WOFF output with font subsetting is a common optimization strategy.', 'en');

-- Add the JSON comparison tool to the homepage directory.
INSERT INTO page_lang (route, key, value, lang) VALUES
('all', 'home.tools.jsonCompare.name', 'JSON Compare', 'en'),
('all', 'home.tools.jsonCompare.description', 'Compare two JSON documents with field-level highlighting and a change summary.', 'en'),
('all', 'home.tools.jsonCompare.name', 'JSON 差异对比', 'zh'),
('all', 'home.tools.jsonCompare.description', '对比两份 JSON 文档，并按字段高亮差异与汇总变更。', 'zh'),
('all', 'home.tools.jsonCompare.name', 'JSON-Vergleich', 'de'),
('all', 'home.tools.jsonCompare.description', 'Zwei JSON-Dokumente vergleichen und Unterschiede nach Feldern hervorheben.', 'de'),
('all', 'home.tools.jsonCompare.name', 'Comparaison JSON', 'fr'),
('all', 'home.tools.jsonCompare.description', 'Comparez deux documents JSON et mettez en évidence les différences par champ.', 'fr')
ON CONFLICT(route, key, lang) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP;
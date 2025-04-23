-- 工具信息表
CREATE TABLE IF NOT EXISTS tools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  route TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 示例数据
INSERT INTO tools (name, description, route) 
VALUES 
  ('QR Generator', 'Generate QR codes from text', '/qr-generator'),
  ('URL Shortener', 'Shorten long URLs', '/url-shortener');

-- Cloudflare D1 图片表
CREATE TABLE IF NOT EXISTS img (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  path TEXT,
  type TEXT,
  relId INTEGER,
  alt TEXT,
  createAt TEXT,
  isDel BOOLEAN DEFAULT 0
);

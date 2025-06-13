CREATE TABLE IF NOT EXISTS page_lang (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  lang TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_unique_lang_entry ON page_lang(route, key, lang);

CREATE TRIGGER IF NOT EXISTS trg_page_lang_updated_at
AFTER UPDATE ON page_lang
FOR EACH ROW
BEGIN
  UPDATE page_lang SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;


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

CREATE TABLE IF NOT EXISTS  article (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  title TEXT NOT NULL,
  hits INTEGER DEFAULT 0,
  type TEXT,
  chapter INTEGER,
  posted_time TEXT NOT NULL,
  last_mod_time TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  toc_id INTEGER,
  status TEXT,
  fee INTEGER,
  keywords TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS  article_l (
    id INTEGER NOT NULL,
    lang_code TEXT NOT NULL, -- 存储语言代码，如 'en' for English, 'zh' for Chinese
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT,
    description TEXT,
    PRIMARY KEY (id, lang_code), -- 联合主键，确保每篇文章的每种语言都是唯一的
    FOREIGN KEY(id) REFERENCES article(id)
);

CREATE TABLE IF NOT EXISTS  users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT DEFAULT '佚名',
  email TEXT,
  avatar TEXT DEFAULT 'noavatar.gif',
  psw TEXT,
  type INTEGER,
  create_time TEXT,
  position TEXT,
  signature TEXT,
  ip TEXT,
  last_active_time TEXT,
  is_active INTEGER DEFAULT 0,
  paymentcode TEXT DEFAULT 'nopaymentcode.png',
  active_code TEXT,
  points INTEGER DEFAULT 0,
  is_consult BLOB,
  sid TEXT,
  wechatAccount TEXT,
  aliAccount TEXT,
  amount REAL DEFAULT 0.00
);

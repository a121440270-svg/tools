-- Migration 007: Baidu ordinary inclusion submissions
CREATE TABLE IF NOT EXISTS baidu_url_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  baiduSuccess INTEGER DEFAULT 0,
  remain INTEGER,
  error TEXT,
  createAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updateAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_baidu_url_submissions_status
  ON baidu_url_submissions(status);
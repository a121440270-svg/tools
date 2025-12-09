-- Prompts + i18n tables
-- 主表：存储与提示词相关的元数据（不包含多语言文本）
CREATE TABLE IF NOT EXISTS prompt (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ai_app TEXT,           -- 提示词适用的 AI 名称，例如 GPT-4
  ai_app_id TEXT,        -- 可选的 AI 平台标识或模型 id
  tags TEXT,             -- 可选标签，逗号分隔
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 多语言表：每条 prompt 的不同语言版本，包含标题、提示内容与使用说明
CREATE TABLE IF NOT EXISTS prompt_l (
  id INTEGER NOT NULL,           -- 对应 prompt.id
  lang_code TEXT NOT NULL,       -- 语言代码，例如 'en', 'zh'
  title TEXT NOT NULL,           -- 标题
  content TEXT NOT NULL,         -- 提示词文本
  instructions TEXT,             -- 使用说明或示例
  PRIMARY KEY (id, lang_code),
  FOREIGN KEY(id) REFERENCES prompt(id) ON DELETE CASCADE
);

-- 索引：按更新时间倒序查询主表
CREATE INDEX IF NOT EXISTS idx_prompt_updated_at ON prompt(updated_at DESC);

-- 触发器：在更新主表时自动维护 updated_at
CREATE TRIGGER IF NOT EXISTS trg_prompt_updated_at
AFTER UPDATE ON prompt
FOR EACH ROW
BEGIN
  UPDATE prompt SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

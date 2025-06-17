// server/database/schema.ts
export interface Tool {
  id: number;
  name: string;
  description?: string;
  route: string;
  created_at: string; // SQLite 日期字段返回字符串
}
export interface Article {
  id: number;
  content: string;
  title: string;
  hits: number;
  type?: string;
  chapter?: number;
  posted_time: string;
  last_mod_time: string;
  author_id: number;
  toc_id?: number;
  status?: string;
  fee?: number;
  keywords?: string;
  description?: string;
}

export interface ArticleL {
  id: number;
  lang_code: string;
  title: string;
  content: string;
  keywords?: string;
  description?: string;
}

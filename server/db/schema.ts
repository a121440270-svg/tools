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
  hits: number;
  type?: string;
  chapter?: number;
  posted_time: string;
  last_mod_time: string;
  author_id: number;
  toc_id?: number;
  status?: string;
  fee?: number;
}

export interface ArticleL {
  id: number;
  article_id: number;
  lang_code: string;
  title: string;
  content: string;
  keywords?: string;
  description?: string;
}

export interface PageLang {
  id: number;
  route: string;
  key: string;
  value: string;
  lang: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  psw: string;
  type: number;
  create_time: string;
  position: string;
  signature: string;
  ip: string;
  last_active_time: string;
  is_active: number;
  paymentcode: string;
  active_code: string;
  points: number;
  is_consult: any;
  sid: string;
  wechatAccount: string;
  aliAccount: string;
  amount: number;
}

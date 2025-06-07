// server/database/schema.ts
export interface Tool {
  id: number;
  name: string;
  description?: string;
  route: string;
  created_at: string; // SQLite 日期字段返回字符串
}

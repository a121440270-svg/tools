// server/database/tools.ts
import type { Tool } from './schema';
import { select, insert, update, remove } from './orm';

const TABLE = 'tools';

export function findTools(where?: Partial<Tool>) {
  return  select<Tool>(TABLE, where);
}

export function createTool(data: Pick<Tool, 'name' | 'route'> & Partial<Pick<Tool, 'description'>>) {
  return insert<Tool>(TABLE, data);
}

export function updateTool(id: number, data: Partial<Omit<Tool, 'id' | 'created_at'>>) {
  return update<Tool>(TABLE, data, { id });
}

export function deleteTool(id: number) {
  return remove(TABLE, { id });
}

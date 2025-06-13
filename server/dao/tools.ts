// server/database/tools.ts
import type { Tool } from '../db/schema';
import type { ToolQo } from '../qo/ToolQo';
import { select, insert, update, remove ,selectCon} from '../db/orm';

const TABLE = 'tools';

export function findTools(where?: Partial<Tool>) {
  return select<Tool>(TABLE, where);
}

export function findToolsCon(query?: Partial<ToolQo>) {
  
  if (null == query) {
    return findTools()
  } else {
    const builder = selectCon('tools');
    if (query.name) builder.where('name', 'LIKE', `%${query.name}%`);
    if (query.description) builder.orWhere('description', 'LIKE', `%${query.description}%`);

    if (query.limit) builder.limit(query.limit);
    if (query.offset) builder.offset(query.offset);

    return builder.all(); // 直接返回查询 Promise
  }
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

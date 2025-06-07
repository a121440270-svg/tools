// server/api/tools/[id].delete.ts
import { deleteTool } from '~/server/db/tools';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  await deleteTool(id);
  return { success: true };
});

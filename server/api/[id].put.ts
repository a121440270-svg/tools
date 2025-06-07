// server/api/tools/[id].put.ts
import { updateTool } from '~/server/db/tools';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const data = await readBody(event);
  await updateTool(id, data);
  return { success: true };
});

import { selectCon, remove, select,update } from '../db/orm';
import type { Img } from '../models/img';

const TABLE = 'img';

class ImgDao {
  private static instance: ImgDao;
  private readonly TABLE = 'img';

  private constructor() {}

  public static getInstance(): ImgDao {
    if (!ImgDao.instance) {
      ImgDao.instance = new ImgDao();
    }
    return ImgDao.instance;
  }

  public async pageImg(where?: Partial<Img> & { page?: number; pageSize?: number; sort?: string }) {
    const query = selectCon(this.TABLE).select('*');

    const { page = 1, pageSize = 10, sort = 'id', ...filters } = where || {};

    // Add where conditions
    Object.entries(filters).forEach(([key, value]) => {
      if (isValidFilterValue(value)) {
        query.where(key, '=', value);
      }
    });

    // Pagination
    query.limit(Number(pageSize)).offset((Number(page) - 1) * Number(pageSize));

    // Fetch data
    const list = await query.all<Img>();

    // Count total
    const countQuery = selectCon(this.TABLE);
    Object.entries(filters).forEach(([key, value]) => {
      if (isValidFilterValue(value)) {
          countQuery.where(key, '=', value);
      }
    });
    countQuery.count();
    const [{ count }] = await countQuery.all<{ count: number }>();

    return { list, total: count };
  }

  /**
   * 删除图片记录（数据库）
   * 返回被删除的记录（如果存在）
   */
  public async deleteById(id: number) {
    if (!id) return { success: false, error: 'invalid id' };
    // 先查出记录（以便返回或删除存储对象）
    const rows = await select<Img>(this.TABLE, { id });
    const record = (rows && rows.length > 0) ? rows[0] : null;
    // 在删除之前，检查关联表（如果存在）中是否有引用当前文件的记录
    try {
      // 有些项目可能使用 img_rel 或 imgrel 之类的表名，优先尝试常见名称
      const relTables = ['img_rel', 'imgrel', 'img_relations'];
      for (const t of relTables) {
        try {
          const relRows = await select<any>(t, { fileid: id });
          if (relRows && relRows.length > 0) {
            return { success: false, error: '存在关联，不能删除', code: 409 };
          }
        } catch (e) {
          // 如果表不存在或查询失败，继续尝试下一个表名
          // 不要把底层错误抛出出去，避免因不存在表而导致整个删除失败
        }
      }
    } catch (e) {
      // 如果检查过程发生不可预期的错误，记录并继续（以防万一）
      console.warn('relation check failed', e);
    }

    await remove(this.TABLE, { id });
    return { success: true, record };
  }
/**
 * Link an array of images to a target id and type.
 * imgs can be array of ids or objects containing { id }
 */
public async linkImagesToTarget(targetId: number, type = 'article', imgs: Array<any> = []) {
  console.log('linkImagesToTarget', targetId, type, imgs)
  if (!targetId || !Array.isArray(imgs) || imgs.length === 0) return { success: true, updated: 0 }
  let updated = 0
  await Promise.all(imgs.map(async (img) => {
    const id = typeof img === 'number' ? img : (img && (img.id || img.ID || img.imgId))
    if (!id) return
    try {
      await update<Img>(TABLE, { relId: targetId, reltype:type }, { id:id })
      updated += 1
    } catch (e) {
      console.warn('linkImagesToTarget update failed for id', id, e)
    }
  }))
  return { success: true, updated }
}

}

function isValidFilterValue(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string' && value.trim() === '') return false
  if (Array.isArray(value) && value.length === 0) return false
  if (typeof value === 'number' && isNaN(value)) return false
  return true
}

export const imgDao = ImgDao.getInstance();
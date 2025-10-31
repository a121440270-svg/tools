import { update } from '~/server/db/orm';
import { Img } from '../models/img';


const TABLE = 'img';
/**
 * Link an array of images to a target id and type.
 * imgs can be array of ids or objects containing { id }
 */
export async function linkImagesToTarget(targetId: number, type = 'article', imgs: Array<any> = []) {
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

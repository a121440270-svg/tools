import { defineEventHandler, readBody } from 'h3'
import { replaceInto } from '../../../db/orm'

export default defineEventHandler(async (event) => {
  const data = await readBody(event)
  if (!Array.isArray(data)) {
    throw new Error('批量添加数据必须为数组')
  }
  for (const item of data) {
    await replaceInto('page_lang', item)
  }
  return { success: true }
})
      lang: item.lang
    }
    const updateResult = await update('page_lang', item, where)
    if (!updateResult || updateResult.affectedRows === 0) {
      // 没有更新到则插入
      await insert('page_lang', item)
    }
  }
  return { success: true }
})

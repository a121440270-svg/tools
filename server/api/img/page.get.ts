import { imgDao } from '../../dao/ImgDao';
// /api/img/page - 用于处理分页查询
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const pageSize = parseInt(query.pageSize as string) || 10;
  const filters = { ...query };
  delete filters.page;
  delete filters.pageSize;

  const result = await imgDao.pageImg({ ...filters, page, pageSize });

  return {
    status: 200,
    data: result,
  };
});
// import { defineEventHandler, getQuery } from 'h3'
// import { productDao } from '../../dao/productDao'

// export default defineEventHandler(async (event) => {
//   const query = getQuery(event)
//   const where: any = {}
//   if (query.title) {
//     where.title = query.title
//   }
//   if (query.categoryId) {
//     where.categoryId = Number(query.categoryId)
//   }
//   // 可扩展更多条件
//   const products = await productDao.pageProduct(where) 
//   return { data: products }
// })
export default defineEventHandler(async (event) => {
  const { id } = event.context.params
  
  // 模拟数据库查询
  const articles = [
    {
      id: 1,
      title: 'Vue3 Composition API 最佳实践',
      content: '这里是文章详细内容...',
      author: '前端专家',
      last_mod_time: '2024-03-22',
      hits: 256
    },
    // 添加更多模拟数据
  ]

  const article = articles.find(a => a.id === Number(id))
  
  if (!article) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Article Not Found'
    })
  }

  return article
})
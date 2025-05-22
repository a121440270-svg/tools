export default defineEventHandler(async (event) => {
  const { id } = event.context.params
  
  // 添加模拟数据
  const mockArticles = [
    {
      id: 1,
      title: 'Vue3 Composition API 最佳实践',
      content: '深入讲解Vue3组合式API的使用技巧...',
      author: '前端专家',
      posted_time: '2024-03-22',
      hits: 256
    },
    {
      id: 2, 
      title: 'Nuxt3服务端渲染指南',
      content: '从零开始构建Nuxt3 SSR应用...',
      author: '全栈工程师',
      posted_time: '2024-03-21',
      hits: 189
    }
  ]

  return mockArticles.find(a => a.id === Number(id))
})
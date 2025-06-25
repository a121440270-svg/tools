<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-medium dark:text-white">发表文章</h1>
    </div>

    <div class="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-lg border dark:border-gray-700">
      <div class="space-y-6">
        <div>
          <label class="block font-medium mb-2 dark:text-white">文章标题</label>
          <input
            v-model="form.title"
            type="text"
            class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
            placeholder="请输入文章标题"
          >
        </div>

        <div>
          <label class="block font-medium mb-2 dark:text-white">分类</label>
          <input
            v-model="form.category"
            type="text"
            class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
            placeholder="请输入分类，如：前端、后端、随笔"
          >
        </div>

        <div>
          <label class="block font-medium mb-2 dark:text-white">目录（可选，逗号分隔）</label>
          <input
            v-model="form.catalog"
            type="text"
            class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
            placeholder="如：简介,使用方法,注意事项"
          >
        </div>

        <div>
          <label class="block font-medium mb-2 dark:text-white">文章内容</label>
          <textarea id="tinymce-editor"></textarea>
        </div>

        <div class="flex justify-end">
          <button 
            @click="submitArticle"
            class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            提交文章
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useUser } from '~/composables/useAuth'

const user = useUser()
const router = useRouter()

const form = reactive({
  title: '',
  content: '',
  category: '',
  catalog: '' // 目录，逗号分隔
})

let editorInstance = null

onMounted(async () => {
  if (process.client) {
    await nextTick()
    // 防止多次初始化
    if (window.tinymce) {
      initTinymce()
    } else {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/tinymce@6.8.2/tinymce.min.js'
      script.onload = () => {
        // 等待DOM渲染后再初始化
        setTimeout(initTinymce, 0)
      }
      document.body.appendChild(script)
    }
  }
})

function initTinymce() {
  // 销毁已存在的编辑器实例，防止重复初始化
  if (window.tinymce.get('tinymce-editor')) {
    window.tinymce.get('tinymce-editor').remove()
  }
  window.tinymce.init({
    selector: '#tinymce-editor',
    language: 'zh_CN',
    plugins: 'link image code lists table autoresize',
    toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code',
    min_height: 400,
    height: 500,
    setup(editor) {
      editor.on('Change KeyUp', () => {
        form.content = editor.getContent()
      })
      editorInstance = editor
    }
  })
}

const submitArticle = async () => {
  if (!form.title.trim()) {
    ElMessage.error('标题不能为空')
    return
  }
  if (!form.category.trim()) {
    ElMessage.error('分类不能为空')
    return
  }
  // 获取编辑器内容
  if (window.tinymce && window.tinymce.get('tinymce-editor')) {
    form.content = window.tinymce.get('tinymce-editor').getContent()
  }
  if (!form.content || form.content === '<p><br></p>') {
    ElMessage.error('内容不能为空')
    return
  }
  // 这里添加提交逻辑
  // await $fetch('/api/article/post', { method: 'POST', body: form })
  ElMessage.success('发布成功')
  router.push('/blog')
}
</script>
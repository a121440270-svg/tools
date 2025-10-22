<template>
  <div>
    <div class="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-lg border dark:border-gray-700">
      <div class="space-y-6">
        <div>
          <label class="block font-medium mb-2 dark:text-white">文章标题</label>
          <div class="flex items-center">
          <el-row :gutter="12" class="w-full">
          <el-col :span="15">
            <input
                    v-model="form.title"
                    type="text"
                    class="w-[100%] px-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
                    placeholder="请输入文章标题"
                  />
          </el-col>
            <el-col :span="6">
            <el-select
                  v-model="form.language"
                  @change="onLanguageChange"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  :reserve-keyword="false"
                  placeholder="选择语言"
                  class=" px-4 py-3 "
                >
                  <el-option
                    v-for="opt in languageOptions"
                    :key="opt.code"
                    :label="opt.label"
                    :value="opt.code"
                  />
              </el-select>
            </el-col>
        </el-row>
            
            
          </div>
        </div>

        <div>
          <label class="block font-medium mb-2 dark:text-white">文章内容</label>
          <textarea id="tinymce-editor"></textarea>
        </div>

        <div>
          <label class="block font-medium mb-2 dark:text-white">用户分类</label>
          <div class="flex flex-wrap gap-3 mb-2">
            <label
              v-for="cat in userCategories"
              :key="cat"
              class="flex items-center space-x-1 text-sm dark:text-white"
            >
              <input
                type="checkbox"
                :value="cat"
                v-model="form.categories"
                class="rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700"
              />
              <span>{{ cat }}</span>
            </label>
          </div>
                    <el-row :gutter="12" class="w-full">
          <el-col :span="15">
            <input
            v-model="newCategory"
            @keyup.enter="addCategory"
            @blur="addCategory"
            type="text"
            class="w-[60%] w-full px-4 py-2 border dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white"
            placeholder="输入逗號分隔的分类"
            />
          </el-col>
          <el-col :span="6">
            <select
              v-model="form.type"
              class="w-[40%] w-full px-4 py-2 border dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white"
              :placeholder="'请选择类型'"
            >
              <option value="" disabled selected>请选择类型</option>
              <option value="original">原创</option>
              <option value="repost">转载</option>
            </select>
          </el-col>
                    </el-row>
        </div>
<div class="mt-3">
  
            
  </div>
  <div class="mt-3">
    <label class="block text-sm font-medium mb-2 dark:text-white">Keywords</label>
    <input v-model="form.keywords" type="text" placeholder="输入关键词，逗号分隔" class="w-full px-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white" />
  </div>
  <div class="mt-3">
    <label class="block text-sm font-medium mb-2 dark:text-white">Meta Description</label>
    <textarea v-model="form.description" placeholder="输入用于SEO的描述（可选）" class="w-full px-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white" rows="3"></textarea>
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
import { useI18n } from 'vue-i18n'

const user = useUser()
const router = useRouter()
const route = useRoute()

const { locales } = useI18n()
function normalizeLocales(rawLocales) {
  let src = rawLocales
  // if it's a function (some i18n implementations expose a getter)
  if (typeof src === 'function') src = src()
  // if it's a ref
  if (src && typeof src === 'object' && 'value' in src) src = src.value
  // if it's an array already, keep
  if (Array.isArray(src)) return src
  // if it's an object/map, transform to array of { code, name }
  if (src && typeof src === 'object') {
    return Object.keys(src).map(k => ({ code: k, name: src[k]?.name || k }))
  }
  return []
}

async function onLanguageChange(val) {
  debugger
  // val may be array (multiple) or string; pick the first selected language for simplicity
  const lang = Array.isArray(val) ? (val[0] || '') : val || ''
  const q = route.query || {}
  const qid = q.id || ''
  if (!qid || !lang) return
  try {
    const l = await $fetch(`/api/articlel?id=${qid}&lang=${encodeURIComponent(lang)}`).catch(() => null)
    let articleL = null
    if (Array.isArray(l) && l.length) articleL = l[0]
    else if (l && typeof l === 'object') articleL = l
    if (articleL) {
      form.title = articleL.title || form.title
      form.description = articleL.description || form.description
      form.keywords = articleL.keywords || form.keywords
      // set editor content
      if (window.tinymce && window.tinymce.get('tinymce-editor')) {
        window.tinymce.get('tinymce-editor').setContent(articleL.content || '')
      } else {
        initialEditorContent.value = articleL.content || ''
      }
    }
  } catch (e) {
    console.error('onLanguageChange error', e)
  }
}

const languageOptions = ref(normalizeLocales(locales).map(l => ({ code: l.code || l.name || l, label: l.name || l.code || l })))

const userCategories = ref([])
const newCategory = ref('')

const form = reactive({
  id:'',
  title: '',
  content: '',
  category: '',
  catalog: '',
  type: 'original',
  categories: [],
  language: [],
  keywords: '',
  description: ''
})

const initialEditorContent = ref('')

function addCategory() {
  debugger
  const val = newCategory.value.trim()
  if (val && !userCategories.value.includes(val)) {
    userCategories.value.push(val)
  }
  if (val && !form.categories.includes(val)) {
    form.categories.push(val)
  }
  newCategory.value = ''
}

let editorInstance = null

onMounted(async () => {
  // If query contains id/lang, try to load existing article and localized row first
  if (process.client) {
    const q = route.query || {}
    const qid = q.id || ''
    const qlang = q.lang || ''
    if (qid) {
      try {
        
        // load main article
        const main = await $fetch(`/api/article?id=${qid}&lang=${qlang}`).catch(() => null)
        if (main) {
          // populate form fields from main
          form.id = qid
          form.title = main.articlel.title || ''
          form.category = main.article.category || ''
          form.language =[ main.articlel.lang_code || '']
          form.categories = (main.article.category && String(main.article.category).split(',').map(s => s.trim()).filter(Boolean)) || []
          userCategories.value = form.categories
          form.type = main.article.type || form.type
          form.keywords = main.articlel.keywords || ''
          form.description = main.articlel.description || ''
          // author_id if present
          form.author_id = main.article.author_id || main.authorId || main.author_id || ''
          // main content as fallback
          initialEditorContent.value = main.articlel.content || ''
        }
      } catch (e) {
        console.error('load article for edit error', e)
      }
    }

    await nextTick()
    // 初始化编辑器后设置内容
    if (window.tinymce) {
      initTinymce()
    } else {
      const script = document.createElement('script')
      script.src = '/libs/tinymce/js/tinymce/tinymce.min.js'
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
    language:'zh_CN',
    plugins: 'print preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template code codesample table charmap hr pagebreak nonbreaking anchor insertdatetime advlist lists wordcount imagetools textpattern help emoticons autosave bdmap indent2em autoresize formatpainter axupimgs',
    toolbar: 'code undo redo restoredraft | cut copy paste pastetext | forecolor backcolor bold italic underline strikethrough link anchor | alignleft aligncenter alignright alignjustify outdent indent | \
    styleselect formatselect fontselect fontsizeselect | bullist numlist | blockquote subscript superscript removeformat | \
    table image media charmap emoticons hr pagebreak insertdatetime print preview | fullscreen | bdmap indent2em lineheight formatpainter axupimgs',
    height: 650, //编辑器高度
    min_height: 400,
    /*content_css: [ //可设置编辑区内容展示的css，谨慎使用
        '/static/reset.css',
        '/static/ax.css',
        '/static/css.css',
    ],*/
    fontsize_formats: '12px 14px 16px 18px 24px 36px 48px 56px 72px',
    font_formats: '微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;',
    importcss_append: true,
    //自定义文件选择器的回调内容
      //   file_picker_callback: function (callback, value, meta) {
      //       if (meta.filetype === 'file') {
      //         callback('https://www.baidu.com/img/bd_logo1.png', { text: 'My text' });
      //       }
      //       if (meta.filetype === 'image') {
      //         callback('https://www.baidu.com/img/bd_logo1.png', { alt: 'My alt text' });
      //       }
      //       if (meta.filetype === 'media') {
      //         callback('movie.mp4', { source2: 'alt.ogg', poster: 'https://www.baidu.com/img/bd_logo1.png' });
      //       }
      //   },
      images_upload_handler: async function (blobInfo, success, failure, progress) {
          const formData = new FormData()
          formData.append('file', blobInfo.blob(), blobInfo.filename())
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            })
            const data = await res.json()
            success(location.protocol + "//" + location.host + "/api/file/"+data.name)
            // success(data)
          } catch (err) {
            failure(err)
          }
      },convert_urls: false,
      toolbar_sticky: true,
      autosave_ask_before_unload: false,
  });
  // 如果有初始内容，填入编辑器
  setTimeout(() => {
    try {
      const ed = window.tinymce.get('tinymce-editor')
      if (ed && initialEditorContent.value) {
        ed.setContent(initialEditorContent.value)
      }
    } catch (e) {
      console.warn('set editor content failed', e)
    }
  }, 100)
}

const submitArticle = async () => {
  if (!form.title.trim()) {
    ElMessage.error('标题不能为空')
    return
  }
  debugger
  form.category = form.categories.join(',')
  form.author_id = user.value?.id || ''
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
  await $fetch('/api/article', { method: 'POST', body: form })
  ElMessage.success('发布成功')
  router.push('/blog')
}

useHead({
  title: '发表文章 - 博客后台'
})
</script>
<template>
  <div>
    <div class="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-lg border dark:border-gray-700">
      <div class="space-y-6">
        <div>
          <label class="block font-medium mb-2 dark:text-white">文章标题</label>
          <div class="flex items-center">
            <input
              v-model="form.title"
              type="text"
              class="w-[60%] px-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
              placeholder="请输入文章标题"
            />
            <select
              v-model="form.type"
              class="w-[20%] ml-4 px-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
              :placeholder="'请选择类型'"
            >
              <option value="" disabled selected>请选择类型</option>
              <option value="original">原创</option>
              <option value="repost">转载</option>
            </select>
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
            <input
            v-model="newCategory"
            @keyup.enter="addCategory"
            type="text"
            class="w-full px-4 py-2 border dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white"
            placeholder="输入逗號分隔的分类"
            />
        </div>
<div class="mt-3">
            <div class="flex items-center gap-6">
              <label class="flex items-center dark:text-white">
                <input type="radio" v-model="form.language" value="zh" class="mr-1" /> 中文
              </label>
              <label class="flex items-center dark:text-white">
                <input type="radio" v-model="form.language" value="en" class="mr-1" /> English
              </label>
            </div>
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

const userCategories = ref([])
const newCategory = ref('')

const form = reactive({
  title: '',
  content: '',
  category: '',
  catalog: '',
  type: 'original',
  categories: [],
  language: 'zh'
})

function addCategory() {
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
  if (process.client) {
    await nextTick()
    // 防止多次初始化
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
      images_upload_handler: function (blobInfo, success, failure, progress) {
          let fd = new FormData();
          fd.append("uploadfile",blobInfo.blob(), blobInfo.filename()); //这里挂载的是一个文件
          $.ajax({
              url: "/blog/user/upload",
              type: "post",
              data: fd,
              cache: false,
              contentType: false,
              processData: false,
              success: function (data) {
                  success(location.protocol + "//" + location.host + "/blog/"+data)
              },
          });
      },convert_urls: false,
      toolbar_sticky: true,
      autosave_ask_before_unload: false,
  });
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

useHead({
  title: '发表文章 - 博客后台'
})
</script>
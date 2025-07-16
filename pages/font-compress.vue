<template>
  <div class="max-w-2xl mx-auto py-10">
    <h1 class="text-2xl font-bold mb-4">TTF字体抽取压缩工具</h1>
    <p class="mb-4 text-gray-600">
      通过输入需要的字符或上传包含字符的文本，提取并压缩TTF字体文件，仅保留所需字形，极大减小字体体积。
    </p>
    <el-form label-width="100px" class="mb-6">
      <el-form-item label="上传TTF字体">
        <input type="file" accept=".ttf" @change="onFontFileChange" ref="fontInputRef" />
        <span v-if="fontName" class="ml-2 text-green-600">已选择: {{ fontName }}</span>
        <span v-if="originSize" class="ml-4 text-xs text-gray-500">原始大小: {{ prettySize(originSize) }}</span>
      </el-form-item>
      <el-form-item label="输入字符">
        <el-input
          v-model="charInput"
          type="textarea"
          :rows="3"
          placeholder="请输入需要保留的字符"
        />
        <span class="ml-2 text-xs text-gray-500">去重后共 {{ charSet.length }} 个</span>
      </el-form-item>
      <el-form-item label="或上传文本">
        <input type="file" accept=".txt" @change="onTextFileChange" ref="textInputRef" />
        <span v-if="textName" class="ml-2 text-green-600">已选择: {{ textName }}</span>
      </el-form-item>
      <el-form-item label="输出格式">
        <el-radio-group v-model="outputType">
          <el-radio label="ttf">TTF</el-radio>
          <el-radio label="woff">WOFF</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :disabled="!fontBuffer || !charSet.length || loading" @click="extractFont">
          开始压缩
        </el-button>
        <el-button size="default" class="ml-2" @click="clearAll">全部清空</el-button>
      </el-form-item>
    </el-form>
    <el-progress v-if="loading" :percentage="progress" status="active" class="mb-4" />
    <!-- <div v-if="fontBuffer && charSet.length" class="mb-6">
      <div class="font-bold mb-2">压缩后字符预览：</div>
      <div v-if="fontPreviewUrl" :style="{ fontFamily: previewFontFamily }">
        <div style="font-size:2rem;word-break:break-all;line-height:2.5rem;">
          {{ charSet.join('') }}
        </div>
      </div>
      <div v-else class="text-xs text-gray-400">字体预览生成中...</div>
    </div> -->
    <div v-if="downloadUrl" class="mt-6">
      <el-alert type="success" show-icon title="压缩完成">
        <template #default>
          <a :href="downloadUrl" :download="downloadName" class="text-primary underline">点击下载压缩后的字体文件</a>
          <span class="ml-2 text-xs text-gray-400">(仅包含所需字形)</span>
          <span v-if="compressedSize" class="ml-4 text-xs text-gray-500">压缩后: {{ prettySize(compressedSize) }}</span>
        </template>
      </el-alert>
    </div>
    <div v-if="errorMsg" class="mt-4 text-red-600">{{ errorMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Font } from 'fonteditor-core'
const { t } = useI18n()

const fontBuffer = ref(null)
const fontName = ref('')
const charInput = ref('')
const textName = ref('')
const downloadUrl = ref('')
const downloadName = ref('compressed.ttf')
const errorMsg = ref('')
const originSize = ref(0)
const compressedSize = ref(0)
const loading = ref(false)
const progress = ref(0)
const outputType = ref('ttf')

const fontInputRef = ref(null)
const textInputRef = ref(null)

useHead({
  title: t('menu.ttf') || 'TTF extraction/compression'
})


const charSet = computed(() => {
  // 去重排序
  return Array.from(new Set(charInput.value.split(''))).filter(Boolean).sort()
})

function prettySize(size) {
  if (!size) return ''
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / 1024 / 1024).toFixed(2) + ' MB'
}

function onFontFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  fontName.value = file.name
  downloadUrl.value = ''
  errorMsg.value = ''
  originSize.value = file.size
  compressedSize.value = 0
  const reader = new FileReader()
  reader.onload = function(evt) {
    fontBuffer.value = evt.target.result
  }
  // 只支持 ttf
  if (file.name.endsWith('.ttf')) {
    reader.readAsArrayBuffer(file)
  } else {
    errorMsg.value = '仅支持上传 ttf 格式字体文件'
  }
}

function onTextFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  textName.value = file.name
  const reader = new FileReader()
  reader.onload = function(evt) {
    // 合并后去重排序
    charInput.value += evt.target.result
  }
  reader.readAsText(file)
}

function clearFontFile() {
  fontBuffer.value = null
  fontName.value = ''
  originSize.value = 0
  compressedSize.value = 0
  downloadUrl.value = ''
  errorMsg.value = ''
  if (fontInputRef.value) fontInputRef.value.value = ''
}

function clearTextFile() {
  textName.value = ''
  if (textInputRef.value) textInputRef.value.value = ''
}

function clearAll() {
  clearFontFile()
  clearTextFile()
  charInput.value = ''
  downloadUrl.value = ''
  errorMsg.value = ''
  compressedSize.value = 0
}

async function extractFont() {
  errorMsg.value = ''
  downloadUrl.value = ''
  compressedSize.value = 0
  loading.value = true
  progress.value = 10
  try {
    // 使用 fonteditor-core 的 Font 对象进行子集化
    await new Promise(resolve => setTimeout(resolve, 100)) // 模拟进度
    progress.value = 30
    const font = Font.create(fontBuffer.value, {
      type: 'ttf',
      subset: charSet.value.join(''),
      hinting: true,
      compound2simple: true,
      inflate: null,
      combinePath: false
    })
    await new Promise(resolve => setTimeout(resolve, 100))
    progress.value = 60
    let buffer, mime, ext
    if (outputType.value === 'woff') {
      buffer = font.write({
        type: 'woff',
        hinting: true
      })
      mime = 'font/woff'
      ext = '.woff'
    } else {
      buffer = font.write({
        type: 'ttf',
        hinting: true
      })
      mime = 'font/ttf'
      ext = '.ttf'
    }
    await new Promise(resolve => setTimeout(resolve, 100))
    progress.value = 90
    const blob = new Blob([buffer], { type: mime })
    downloadName.value = 'compressed-' + fontName.value.replace(/\.\w+$/, ext)
    downloadUrl.value = URL.createObjectURL(blob)
    compressedSize.value = blob.size
    progress.value = 100
  } catch (e) {
    errorMsg.value = '字体压缩失败: ' + (e.message || e)
  } finally {
    setTimeout(() => { loading.value = false }, 300)
  }
}

const fontPreviewUrl = ref('')
const previewFontFamily = 'preview-font'

// 动态插入 @font-face 样式
function injectFontFace(url) {
  removeFontFace()
  if (!url) return
  const style = document.createElement('style')
  style.setAttribute('type', 'text/css')
  style.setAttribute('id', 'preview-font-face-style')
  style.innerHTML = `
    @font-face {
      font-family: '${previewFontFamily}';
      src: url('${url}');
    }
  `
  document.head.appendChild(style)
}
function removeFontFace() {
  const old = document.getElementById('preview-font-face-style')
  if (old) old.remove()
}

// 生成预览字体（ttf格式即可）
async function updateFontPreview() {
  fontPreviewUrl.value = ''
  removeFontFace()
  if (!fontBuffer.value || !charSet.value.length) return
  try {
    const font = Font.create(fontBuffer.value, {
      type: 'ttf',
      subset: charSet.value.join(''),
      hinting: true,
      compound2simple: true,
      inflate: null,
      combinePath: false
    })
    const ttfBuffer = font.write({
      type: 'ttf',
      hinting: true
    })
    const blob = new Blob([ttfBuffer], { type: 'font/ttf' })
    const url = URL.createObjectURL(blob)
    fontPreviewUrl.value = url
    injectFontFace(url)
  } catch (e) {
    fontPreviewUrl.value = ''
    removeFontFace()
  }
}

// 监听字体和字符变化，自动生成预览
watch([fontBuffer, charSet], () => {
  updateFontPreview()
})

// 保证每次文本变化都同步去重排序显示
watch(charInput, (val) => {
  // 触发 charSet 变化
}, { immediate: true })
</script>
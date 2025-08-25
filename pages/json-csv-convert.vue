<template>
  <div class="max-w-5xl mx-auto py-8">
    <h1 class="text-2xl font-bold mb-4">{{ t('jsoncsv.title') }}</h1>
    <div class="flex flex-col md:flex-row gap-4">
      <!-- 输入区 -->
      <div class="flex-1 md:min-w-[400px] lg:min-w-[520px] pt-0">
        <el-input
          type="textarea"
          v-model="inputText"
          :rows="18"
          :placeholder="t('jsoncsv.input_placeholder')"
          style="min-width:420px; max-width:100%; font-family:monospace;"
        />
        <div class="flex gap-2 mt-3">
          <el-button type="primary" @click="jsonToCsv">{{ t('jsoncsv.json_to_csv') }}</el-button>
          <el-button type="primary" @click="csvToJson">{{ t('jsoncsv.csv_to_json') }}</el-button>
          <el-button @click="clearAll">{{ t('jsoncsv.clear') }}</el-button>
          <el-button type="default" @click="pasteInput">{{ t('jsoncsv.paste') }}</el-button>
        </div>
      </div>
      <!-- 结果区 -->
      <div class="flex-1">
        <div v-if="outputText">
          <el-alert type="success" show-icon :title="t('jsoncsv.result_title')">
            <template #default>
              <el-input
                type="textarea"
                :value="outputText"
                :rows="18"
                readonly
                style="min-width:420px; max-width:100%; font-family:monospace;"
              />
              <div class="flex gap-2 mt-4">
                <el-button type="primary" @click="downloadResult">{{ t('jsoncsv.download') }}</el-button>
                <el-button type="default" @click="copyResult">{{ t('jsoncsv.copy') }}</el-button>
              </div>
            </template>
          </el-alert>
        </div>
        <div v-if="errorMsg" class="mt-4 text-red-600">{{ errorMsg }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

// 粘贴剪贴板内容到输入框
function pasteInput() {
  if (navigator.clipboard) {
    navigator.clipboard.readText()
      .then(text => {
        inputText.value = text
        ElMessage.success('已粘贴剪贴板内容')
      })
      .catch(() => {
        ElMessage.error('粘贴失败')
      })
  } else {
    ElMessage.error('当前浏览器不支持自动粘贴')
  }
}
const inputText = ref('')
const outputText = ref('')
const errorMsg = ref('')

const lastType = ref('') // 记录最后一次转换类型

function clearAll() {
  inputText.value = ''
  outputText.value = ''
  errorMsg.value = ''
  lastType.value = ''
}

function jsonToCsv() {
  errorMsg.value = ''
  outputText.value = ''
  lastType.value = 'csv'
  try {
    let json = JSON.parse(inputText.value)
    if (!Array.isArray(json)) {
      // 如果是对象，自动包裹为数组
      json = [json]
    }
    if (json.length === 0) {
      outputText.value = ''
      return
    }
    const keys = Object.keys(json[0])
    const csvRows = [keys.join(',')]
    for (const obj of json) {
      const row = keys.map(k => {
        let val = obj[k] ?? ''
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
          val = '"' + val.replace(/"/g, '""') + '"'
        }
        return val
      })
      csvRows.push(row.join(','))
    }
    outputText.value = csvRows.join('\n')
  } catch (e) {
    errorMsg.value = 'JSON 转 CSV 失败: ' + (e.message || e)
  }
}

function csvToJson() {
  errorMsg.value = ''
  outputText.value = ''
  lastType.value = 'json'
  try {
    const lines = inputText.value.split(/\r?\n/).filter(l => l.trim())
    if (lines.length < 2) throw new Error('CSV 至少需要表头和一行数据')
    const headers = parseCsvLine(lines[0])
    const result = []
    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i])
      const obj = {}
      headers.forEach((h, idx) => {
        obj[h] = values[idx] ?? ''
      })
      result.push(obj)
    }
    outputText.value = JSON.stringify(result, null, 2)
  } catch (e) {
    errorMsg.value = 'CSV 转 JSON 失败: ' + (e.message || e)
  }
}

// 简单 CSV 行解析，支持逗号和双引号包裹
function parseCsvLine(line) {
  const result = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += char
      }
    } else {
      if (char === ',') {
        result.push(cur)
        cur = ''
      } else if (char === '"') {
        inQuotes = true
      } else {
        cur += char
      }
    }
  }
  result.push(cur)
  return result
}

function downloadResult() {
  if (!outputText.value) return
  let blob, filename
  if (lastType.value === 'csv') {
    // 添加 BOM 解决中文乱码
    blob = new Blob(['\uFEFF' + outputText.value], { type: 'text/csv;charset=utf-8' })
    filename = 'result.csv'
  } else {
    blob = new Blob([outputText.value], { type: 'application/json;charset=utf-8' })
    filename = 'result.json'
  }
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

// 复制结果到剪贴板
function copyResult() {
  if (!outputText.value) return
  if (navigator.clipboard) {
    navigator.clipboard.writeText(outputText.value)
      .then(() => {
        ElMessage.success('已复制到剪贴板')
      })
      .catch(() => {
        ElMessage.error('复制失败')
      })
  } else {
    // 兼容旧浏览器
    const textarea = document.createElement('textarea')
    textarea.value = outputText.value
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      ElMessage.success('已复制到剪贴板')
    } catch {
      ElMessage.error('复制失败')
    }
    document.body.removeChild(textarea)
  }
}
useHead({
  title: 'JSON与CSV互转工具 - 在线转换、复制、下载',
  meta: [
    { name: 'description', content: '在线JSON与CSV互转工具，支持粘贴、复制、下载，轻松实现JSON转CSV、CSV转JSON，支持中文，适合数据处理、表格转换、开发者使用。' },
    { name: 'keywords', content: 'JSON转CSV, CSV转JSON, 在线转换, 数据格式转换, 表格转化, 粘贴复制, 下载, 中文支持, 数据处理, 前端工具' }
  ]
})
</script>

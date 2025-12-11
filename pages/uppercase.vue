<template>
  <div class="page-root">
    <div class="container-card">
      <h1 class="title">{{ $t('menu.uppercase') || '文本转大写工具' }}</h1>
      <p class="desc">{{ $t('uppercase.desc') || '粘贴文本后自动转换为大写并复制到剪贴板' }}</p>

      <div class="io-grid">
        <div class="panel">
          <label class="label">{{ $t('uppercase.inputLabel') || '输入文本' }}</label>
          <textarea
            ref="area"
            v-model="text"
            @paste="handlePaste"
            @input="onInput"
            :placeholder="$t('uppercase.placeholder') || '请在此处粘贴或输入文本...'
            "
            class="input-area"
          ></textarea>
        </div>

        <div class="panel">
          <label class="label">{{ $t('uppercase.outputLabel') || '大写文本' }}</label>
          <textarea
            :value="uppercaseText"
            readonly
            class="output-area"
            placeholder="转换后的大写文本将显示在这里..."
          ></textarea>
        </div>
      </div>

      <div class="button-row">
        <button @click="copyText" class="btn primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          {{ $t('uppercase.copyBtn') || '复制到剪贴板' }}
        </button>

        <button @click="clearText" class="btn ghost">
          {{ $t('uppercase.clearBtn') || '清空' }}
        </button>

        <div class="status-container">
          <div v-if="status" :class="['status-message', statusType]">{{ status }}</div>
        </div>
      </div>

      <div class="instructions">
        <h3>使用说明</h3>
        <ul>
          <li>在输入框中粘贴或输入文本</li>
          <li>文本将自动转换为大写并显示在右侧</li>
          <li>点击"复制到剪贴板"复制转换后的文本</li>
          <li>点击"清空"清除输入内容</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const text = ref('')
const status = ref('')
const statusType = ref('')
let timer = null

const area = ref(null)

const uppercaseText = computed(() => (text.value || '').toUpperCase())

const setStatus = (msg, type = 'success') => {
  clearTimeout(timer)
  status.value = msg
  statusType.value = type
  if (msg) {
    timer = setTimeout(() => {
      status.value = ''
      statusType.value = ''
    }, 4000)
  }
}

const handlePaste = (e) => {
  try {
    // we still allow default so mobile paste works; but capture clipboard if available
    const pasted = (e.clipboardData && e.clipboardData.getData('text')) || ''
    if (!pasted) return
    // set raw text (so user can still edit) — uppercase will be shown in output
    text.value = pasted
    // try to copy uppercase to clipboard immediately
    const upper = pasted.toUpperCase()
    navigator.clipboard && navigator.clipboard.writeText(upper).then(() => {
      setStatus('复制成功', 'success')
    }).catch(() => {
      // ignore; user can still press copy
    })
  } catch (err) {
    console.error(err)
  }
}

const onInput = () => {
  // clear any existing status when user types
  if (!text.value) setStatus('', '')
}

const copyText = async () => {
  if (!uppercaseText.value) {
    setStatus('没有文本可复制', 'error')
    return
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(uppercaseText.value)
    } else {
      // fallback for old browsers
      const ta = document.createElement('textarea')
      ta.value = uppercaseText.value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setStatus('复制成功', 'success')
  } catch (err) {
    console.error(err)
    setStatus('复制失败', 'error')
  }
}

const clearText = () => {
  text.value = ''
  setStatus('', '')
  area.value && area.value.focus()
}
</script>

<style scoped>
/* Root background and centering (mimic reference gradient) */
.page-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
}

.container-card {
  width: 100%;
  max-width: 900px;
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.18);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.container-card:hover { transform: translateY(-6px); }

.title { font-size: 24px; font-weight: 700; color: #111827; text-align: center; margin-bottom: 6px; }
.desc { color: #6b7280; text-align: center; margin-bottom: 18px; }

.io-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.panel { display: flex; flex-direction: column; }
.label { font-weight: 600; margin-bottom: 8px; color: #374151; }
.input-area, .output-area {
  width: 100%;
  padding: 14px;
  border: 2px solid #e6e6f0;
  border-radius: 10px;
  min-height: 160px;
  font-size: 15px;
  resize: vertical;
  transition: border-color .2s ease, box-shadow .2s ease;
}
.input-area:focus, .output-area:focus { outline: none; border-color: #6a11cb; box-shadow: 0 0 0 6px rgba(106,17,203,0.06); }
.output-area { background: #fbfbff; color: #111827; font-weight: 600; }

.button-row { display:flex; align-items:center; gap:12px; margin-top:18px; }
.btn { display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius:10px; font-weight:600; cursor:pointer; border:none; }
.btn .icon{ width:18px; height:18px; }
.btn.primary { background: linear-gradient(90deg,#6a11cb,#2575fc); color:#fff; box-shadow: 0 8px 20px rgba(38, 50, 150, 0.12); }
.btn.primary:hover { transform: translateY(-2px); }
.btn.ghost { background:#f3f4f6; color:#374151; }

.status-container { margin-left:auto; }
.status-message { padding:8px 12px; border-radius:8px; font-weight:600; }
.status-message.success { background:#e8f5e9; color:#2e7d32; }
.status-message.error { background:#ffebee; color:#c62828; }

.instructions { margin-top:20px; background:#f8fafc; padding:12px; border-radius:10px; }
.instructions h3 { margin-bottom:8px; }
.instructions ul { padding-left:18px; color:#6b7280; }

@media (max-width: 880px) {
  .io-grid { grid-template-columns: 1fr; }
  .container-card { padding: 20px; }
  .button-row { flex-direction: column; align-items: stretch; }
  .status-container { margin-left: 0; }
}
</style>

<template>
  <div class="p-4">
    <h2 class="text-lg font-medium mb-4">{{ isNew ? '新建提示词' : '编辑提示词' }}</h2>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">标题</label>
        <input v-model="form.title" class="w-full px-3 py-2 border rounded" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">提示词应用AI</label>
        <input v-model="form.ai_app" class="w-full px-3 py-2 border rounded" placeholder="例如：GPT-4, Claude 等" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">提示词内容</label>
        <textarea v-model="form.content" rows="8" class="w-full px-3 py-2 border rounded" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">使用说明</label>
        <textarea v-model="form.instructions" rows="4" class="w-full px-3 py-2 border rounded" />
      </div>

      <div class="flex justify-end gap-2">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from '#imports'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const idParam = route.params.id
const isNew = idParam === 'new'
const id = isNew ? null : Number(idParam)

const form = ref({ title: '', ai_app: '', content: '', instructions: '' })

async function load() {
  if (!isNew) {
    const data = await $fetch(`/api/prompts/${id}`)
    Object.assign(form.value, data)
  }
}

async function save() {
  if (!form.value.title || !form.value.content) {
    ElMessage({ type: 'warning', message: '请填写标题和提示词内容' })
    return
  }
  try {
    if (isNew) {
      await $fetch('/api/prompts', { method: 'POST', body: form.value })
      ElMessage({ type: 'success', message: '已创建' })
    } else {
      await $fetch(`/api/prompts/${id}`, { method: 'PUT', body: form.value })
      ElMessage({ type: 'success', message: '已保存' })
    }
    router.push('/prompts')
  } catch (e) {
    console.error(e)
    ElMessage({ type: 'error', message: '保存失败' })
  }
}

function cancel() { router.push('/prompts') }

onMounted(load)
</script>

<template>
  <div class="p-4">
    <h2 class="text-lg font-medium mb-4">{{ $t(isNew ? 'promptEdit.newTitle' : 'promptEdit.editTitle') }}</h2>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('promptEdit.title') }}</label>
        <input v-model="form.title" class="w-full px-3 py-2 border rounded" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('promptEdit.aiApp') }}</label>
        <input v-model="form.ai_app" class="w-full px-3 py-2 border rounded" :placeholder="$t('promptEdit.aiAppPlaceholder')" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('promptEdit.content') }}</label>
        <textarea v-model="form.content" rows="8" class="w-full px-3 py-2 border rounded" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('promptEdit.instructions') }}</label>
        <textarea v-model="form.instructions" rows="4" class="w-full px-3 py-2 border rounded" />
      </div>

      <div class="flex justify-end gap-2">
        <el-button @click="cancel">{{ $t('promptEdit.cancel') }}</el-button>
        <el-button type="primary" @click="save">{{ $t('promptEdit.save') }}</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from '#imports'
import { ElMessage } from 'element-plus'
const { t } = useI18n()

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
    ElMessage({ type: 'warning', message: t('promptEdit.required') })
    return
  }
  try {
    if (isNew) {
      await $fetch('/api/prompts', { method: 'POST', body: form.value })
      ElMessage({ type: 'success', message: t('promptEdit.created') })
    } else {
      await $fetch(`/api/prompts/${id}`, { method: 'PUT', body: form.value })
      ElMessage({ type: 'success', message: t('promptEdit.saved') })
    }
    router.push('/prompts')
  } catch (e) {
    console.error(e)
    ElMessage({ type: 'error', message: t('promptEdit.failed') })
  }
}

function cancel() { router.push('/prompts') }

onMounted(load)
</script>

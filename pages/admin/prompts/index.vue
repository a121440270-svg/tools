<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-medium">Prompt Templates (Admin)</h2>
      <div class="flex items-center gap-2">
        <el-input v-model="q" placeholder="搜索标题" size="small" clearable @clear="fetchList" />
        <el-button type="primary" @click="goCreate">新建提示词</el-button>
      </div>
    </div>

    <el-table :data="list" style="width: 100%" v-loading="loading">
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="ai_app" label="应用AI" width="160" />
      <el-table-column prop="updated_at" label="更新时间" width="200" />
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="viewRow(row)">查看</el-button>
          <el-button type="text" size="small" @click="editRow(row)">编辑</el-button>
          <el-button type="text" size="small" @click="deleteRow(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="mt-4 flex justify-end">
      <el-pagination
        background
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        @current-change="onPageChange"
        @size-change="onSizeChange"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5,10,20,50]"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from '#imports'

const router = useRouter()
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const q = ref('')
const loading = ref(false)

async function fetchList() {
  loading.value = true
  try {
    const res = await $fetch('/api/prompts', { params: { page: page.value, pageSize: pageSize.value, q: q.value } })
    list.value = res.list || []
    total.value = res.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function viewRow(row) {
  // open public view
  router.push(`/prompts/${row.id}`)
}
function editRow(row) {
  router.push(`/admin/prompts/edit/${row.id}`)
}

async function deleteRow(row) {
  try {
    await ElMessageBox.confirm(`确认删除 "${row.title}" 吗？`, '删除', { type: 'warning' })
    await $fetch(`/api/prompts/${row.id}`, { method: 'DELETE' })
    ElMessage({ type: 'success', message: '已删除' })
    fetchList()
  } catch (e) {
    // cancelled or error
  }
}

function goCreate() {
  router.push('/admin/prompts/edit/new')
}

function onPageChange(p) { page.value = p; fetchList() }
function onSizeChange(sz) { pageSize.value = sz; page.value = 1; fetchList() }

fetchList()
</script>

<style scoped>
.el-table .cell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
</style>

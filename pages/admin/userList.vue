<template>
  <div>
    <div class="flex items-center gap-2 mb-4">
      <el-input v-model="searchEmail" placeholder="邮箱" clearable style="width: 180px" />
      <el-input v-model="searchName" placeholder="用户名" clearable style="width: 180px" />
      <el-select v-model="searchStatus" placeholder="状态" clearable style="width: 120px">
        <el-option label="全部" :value="''" />
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
        <el-option label="废弃" :value="-1" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
    </div>
    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80"/>
      <el-table-column prop="name" label="用户名"/>
      <el-table-column prop="email" label="邮箱"/>
      <el-table-column prop="is_active" label="状态">
        <template #default="scope">
          <el-tag v-if="scope.row.is_active === 1" type="success">启用</el-tag>
          <el-tag v-else-if="scope.row.is_active === 0" type="info">禁用</el-tag>
          <el-tag v-else type="danger">废弃</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="注册时间"/>
      <el-table-column label="操作" width="260">
        <template #default="scope">
          <el-button size="mini" @click="handleEnable(scope.row, 1)" v-if="scope.row.is_active !== 1">启用</el-button>
          <el-button size="mini" @click="handleEnable(scope.row, 0)" v-if="scope.row.is_active !== 0">禁用</el-button>
          <el-button size="mini" type="warning" @click="handleEnable(scope.row, -1)" v-if="scope.row.is_active !== -1">废弃</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next, sizes"
      :total="total"
      :page-size="pageSize"
      :current-page="page"
      :page-sizes="[10, 20, 50, 100]"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      style="margin-top: 16px;"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const searchEmail = ref('')
const searchName = ref('')
const searchStatus = ref('')

async function fetchData() {
  loading.value = true
  const res = await $fetch('/api/admin/user/list', {
    params: {
      page: page.value,
      pageSize: pageSize.value,
      email: searchEmail.value,
      name: searchName.value,
      is_active: searchStatus.value
    }
  })
  tableData.value = res.list
  total.value = res.total
  loading.value = false
}

function handleSearch() {
  page.value = 1
  fetchData()
}

function handlePageChange(val) {
  page.value = val
  fetchData()
}

function handleSizeChange(val) {
  pageSize.value = val
  page.value = 1
  fetchData()
}

async function handleEnable(row, status) {
  await $fetch('/api/admin/user/update-status', {
    method: 'POST',
    body: { id: row.id, is_active: status }
  })
  ElMessage.success('操作成功')
  fetchData()
}

async function handleDelete(row) {
  ElMessageBox.confirm('确定删除该用户吗？', '提示', { type: 'warning' })
    .then(async () => {
      await $fetch('/api/admin/user/delete', {
        method: 'POST',
        body: { id: row.id }
      })
      ElMessage.success('删除成功')
      fetchData()
    })
    .catch(() => {})
}

onMounted(fetchData)
definePageMeta({ layout: 'admin' })
</script>

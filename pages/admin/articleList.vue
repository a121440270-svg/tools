<template>
  <div>
    <div class="flex items-center gap-2 mb-4">
      <el-input v-model="searchTitle" placeholder="标题" clearable style="width: 180px" />
      <el-input v-model="searchCategory" placeholder="分类" clearable style="width: 180px" />
      <el-select v-model="searchStatus" placeholder="状态" clearable style="width: 120px">
        <el-option label="全部" :value="''" />
        <el-option label="待审批" :value="0" />
        <el-option label="已通过" :value="1" />
        <el-option label="已驳回" :value="2" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
    </div>
    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80"/>
      <el-table-column prop="title" label="标题"/>
      <el-table-column prop="category" label="分类"/>
      <el-table-column prop="author" label="作者"/>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 0" type="warning">待审批</el-tag>
          <el-tag v-else-if="scope.row.status === 1" type="success">已通过</el-tag>
          <el-tag v-else type="danger">已驳回</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间"/>
      <el-table-column label="操作" width="260">
        <template #default="scope">
          <el-button size="mini" @click="handleView(scope.row)">查看</el-button>
          <el-button size="mini" type="success" @click="handleApprove(scope.row, 1)" v-if="scope.row.status === 0">通过</el-button>
          <el-button size="mini" type="warning" @click="handleApprove(scope.row, 2)" v-if="scope.row.status === 0">驳回</el-button>
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
    <el-dialog v-model="viewDialog" title="文章详情" width="60%">
      <div v-if="viewArticle">
        <h2 class="text-xl font-bold mb-2">{{ viewArticle.title }}</h2>
        <div class="mb-2 text-gray-500">分类：{{ viewArticle.category }} | 作者：{{ viewArticle.author }}</div>
        <div class="mb-2 text-gray-500">目录：{{ viewArticle.catalog }}</div>
        <div class="mb-2 text-gray-500">状态：<span v-if="viewArticle.status===0">待审批</span><span v-else-if="viewArticle.status===1">已通过</span><span v-else>已驳回</span></div>
        <div class="prose max-w-none" v-html="viewArticle.content"></div>
      </div>
      <template #footer>
        <el-button @click="viewDialog = false">关闭</el-button>
      </template>
    </el-dialog>
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

const searchTitle = ref('')
const searchCategory = ref('')
const searchStatus = ref('')

const viewDialog = ref(false)
const viewArticle = ref(null)

async function fetchData() {
  loading.value = true
  const res = await $fetch('/api/admin/article/list', {
    params: {
      page: page.value,
      pageSize: pageSize.value,
      title: searchTitle.value,
      category: searchCategory.value,
      status: searchStatus.value
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

function handleView(row) {
  viewArticle.value = row
  viewDialog.value = true
}

async function handleApprove(row, status) {
  await $fetch('/api/admin/article/approve', {
    method: 'POST',
    body: { id: row.id, status }
  })
  ElMessage.success(status === 1 ? '已通过' : '已驳回')
  fetchData()
}

async function handleDelete(row) {
  ElMessageBox.confirm('确定删除该文章吗？', '提示', { type: 'warning' })
    .then(async () => {
      await $fetch('/api/admin/article/delete', {
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

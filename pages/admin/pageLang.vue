<template>
    <div>
        <div class="flex items-center gap-2 mb-4">
          <el-input v-model="searchRoute" placeholder="输入路由" clearable style="width: 180px" />
            <el-input v-model="searchKey" placeholder="输入key" clearable style="width: 180px" />
            <el-input v-model="searchValue" placeholder="输入内容" clearable style="width: 180px" />
            <el-select v-model="searchLang" placeholder="选择语言" clearable style="width: 120px">
              <el-option v-for="(label, code) in langOptions" :key="code" :label="label" :value="code" />
            </el-select>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="primary" @click="openDrawer()">批量添加</el-button>
            <el-button type="primary" @click="openDialog()">单条添加</el-button>
            <el-button type="primary" @click="openJsonDrawer()">JSON添加</el-button>
        </div>
        <el-table :data="tableData" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80"/>
            <el-table-column prop="route" label="路由"/>
            <el-table-column prop="key" label="Key"/>
            <el-table-column prop="value" label="Value"/>
            <el-table-column prop="lang" label="语言"/>
            <el-table-column prop="created_at" label="创建时间"/>
            <el-table-column prop="updated_at" label="更新时间"/>
            <el-table-column label="操作" width="180">
                <template #default="scope">
                    <el-button size="mini" @click="openDialog(scope.row)">编辑</el-button>
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

        <el-drawer v-model="drawerVisible" :title="drawerTitle" size="60%">
          <div>
            <el-table :data="batchTableData" style="width: 100%" border>
              <el-table-column prop="route" label="路由">
                <template #default="scope">
                  <el-input v-model="scope.row.route" placeholder="路由" />
                </template>
              </el-table-column>
              <el-table-column prop="key" label="Key">
                <template #default="scope">
                  <el-input v-model="scope.row.key" placeholder="Key" />
                </template>
              </el-table-column>
              <el-table-column prop="value" label="Value">
                <template #default="scope">
                  <el-input v-model="scope.row.value" placeholder="Value" />
                </template>
              </el-table-column>
              <el-table-column prop="lang" label="语言">
                <template #default="scope">
                  <el-select v-model="scope.row.lang" placeholder="请选择语言" style="width: 100px">
                    <el-option v-for="(label, code) in langOptions" :key="code" :label="label" :value="code" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button size="mini" @click="copyBatchRow(scope.$index)">复制</el-button>
                  <el-button size="mini" type="danger" @click="removeBatchRow(scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="mt-2">
              <el-button type="primary" @click="addBatchRow">添加一行</el-button>
            </div>
          </div>
          <template #footer>
            <el-button @click="drawerVisible = false">取消</el-button>
            <el-button type="primary" @click="handleBatchSubmit">批量添加</el-button>
          </template>
        </el-drawer>

        <el-dialog v-model="dialogVisible" :title="dialogTitle">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
                <el-form-item label="路由" prop="route">
                    <el-input v-model="form.route"/>
                </el-form-item>
                <el-form-item label="Key" prop="key">
                    <el-input v-model="form.key"/>
                </el-form-item>
                <el-form-item label="Value" prop="value">
                    <el-input v-model="form.value"/>
                </el-form-item>
                <el-form-item label="语言" prop="lang">
                  <el-select v-model="form.lang" placeholder="请选择语言" style="width: 120px">
                    <el-option v-for="(label, code) in langOptions" :key="code" :label="label" :value="code" />
                  </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>

        <el-drawer v-model="jsonDrawerVisible" title="JSON添加" size="40%">
          <el-form label-width="80px">
            <el-form-item label="路由">
              <el-input v-model="jsonRoute" placeholder="请输入路由" />
            </el-form-item>
            <el-form-item label="语言">
              <el-select v-model="jsonLang" placeholder="请选择语言" style="width: 120px">
                <el-option v-for="(label, code) in langOptions" :key="code" :label="label" :value="code" />
              </el-select>
            </el-form-item>
            <el-form-item label="JSON内容">
              <el-input v-model="jsonInput" type="textarea" :rows="12" placeholder="请输入JSON内容" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="jsonDrawerVisible = false">取消</el-button>
            <el-button type="primary" @click="handleJsonSubmit">批量添加</el-button>
          </template>
        </el-drawer>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const searchKey = ref('')
const searchRoute = ref('')
const searchValue = ref('')
const searchLang = ref('')

const dialogVisible = ref(false)
const dialogTitle = ref('添加')

useHead({
  title: 'Multilingual ​Language Management​'
})


const form = reactive({
  id: null,
  route: '',
  key: '',
  value: '',
  lang: '',
  created_at: '',
  updated_at: ''
})
const rules = {
  route: [{ required: true, message: '请输入路由', trigger: 'blur' }],
  key: [{ required: true, message: '请输入key', trigger: 'blur' }],
  value: [{ required: true, message: '请输入value', trigger: 'blur' }],
  lang: [{ required: true, message: '请输入语言', trigger: 'blur' }]
}
const formRef = ref(null)

const drawerVisible = ref(false)
const drawerTitle = ref('批量添加')
const batchInput = ref('')
const batchForm = reactive({})

const jsonDrawerVisible = ref(false)
const jsonInput = ref('')
const jsonRoute = ref('')
const jsonLang = ref('')

const langOptions = {
  en: '英文',
  ja: '日文',
  ko: '韩文',
  ru: '俄文',
  de: '德文',
  fr: '法文',
  it: '意大利',
  es: '西班牙文',
  pt: '葡萄牙文',
  nl: '荷兰文',
  ch:'瑞士',
   zh: '中文',
   ca: '加拿大',
   br: '巴西',
   ar:'阿根廷',
   mx: '墨西哥',
}
const batchTableData = ref([
  { route: '', key: '', value: '', lang: '' }
])

function openJsonDrawer() {
  jsonInput.value = ''
  jsonRoute.value = ''
  jsonLang.value = ''
  jsonDrawerVisible.value = true
}

// API 方法
async function getPageLangList(params) {
  return await $fetch('/api/admin/page-lang/list', { params })
}
async function addPageLang(data) {
  return await $fetch('/api/admin/page-lang/add', { method: 'POST', body: data })
}
async function updatePageLang(data) {
  return await $fetch('/api/admin/page-lang/update', { method: 'PUT', body: data })
}
async function deletePageLang(id) {
  return await $fetch('/api/admin/page-lang/delete', { method: 'POST', body: { id } })
}
async function addPageLangBatch(data) {
  return await $fetch('/api/admin/page-lang/add-batch', { method: 'POST', body: data })
}

function fetchData() {
  loading.value = true
  getPageLangList({ page: page.value, pageSize: pageSize.value, key: searchKey.value, route: searchRoute.value, lang: searchLang.value, value: searchValue.value }).then(res => {
    tableData.value = res.list
    total.value = res.total
    loading.value = false
  })
}

function handleSearch() {
  page.value = 1
  fetchData()
}

watch(searchLang, () => {
  handleSearch()
})
watch(searchValue, () => {
  handleSearch()
})

function openDialog(row) {
  if (row) {
    dialogTitle.value = '编辑'
    Object.assign(form, row)
    form.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ')
  } else {
    dialogTitle.value = '添加'
    Object.assign(form, { id: null, route: '', key: '', value: '', lang: '', created_at: new Date().toISOString().slice(0, 19).replace('T', ' '), updated_at: '' })
  }
  dialogVisible.value = true
}

function addBatchRow() {
  batchTableData.value.push({ route: '', key: '', value: '', lang: '' })
}
function removeBatchRow(idx) {
  batchTableData.value.splice(idx, 1)
}
function openDrawer() {
  drawerTitle.value = '批量添加'
  batchTableData.value = [{ route: '', key: '', value: '', lang: '' }]
  drawerVisible.value = true
}

function handleSubmit() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      if (form.id != null && form.id !== '') {
        await updatePageLang({
          id: form.id,
          route: form.route,
          key: form.key,
          value: form.value,
          lang: form.lang,
          updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        })
        ElMessage.success('编辑成功')
      } else {
        await addPageLang({
          route: form.route,
          key: form.key,
          value: form.value,
          lang: form.lang,
          created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        })
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      fetchData()
    } catch (e) {
      ElMessage.error('操作失败: ' + (e?.message || e || '请重试'))
    } finally {
      loading.value = false
    }
  })
}

async function handleBatchSubmit() {
  const data = batchTableData.value.filter(item => item.route && item.key && item.value && item.lang)
  if (data.length === 0) {
    ElMessage.warning('请填写完整的批量数据')
    return
  }
  loading.value = true
  try {
    await addPageLangBatch(data)
    ElMessage.success('批量添加成功')
    drawerVisible.value = false
    fetchData()
  } catch (e) {
    ElMessage.error('批量添加失败: ' + (e?.message || e || '请重试'))
  } finally {
    loading.value = false
  }
}

async function handleJsonSubmit() {
  if (!jsonInput.value.trim() || !jsonRoute.value || !jsonLang.value) {
    ElMessage.warning('请填写完整的路由、语言和JSON内容')
    return
  }
  let obj
  try {
    obj = JSON.parse(jsonInput.value)
  } catch (e) {
    ElMessage.error('JSON格式错误: ' + (e?.message || e || ''))
    return
  }
  // 扁平化json
  function flatten(obj, prefix = '') {
    let res = []
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        res = res.concat(flatten(obj[key], prefix ? `${prefix}.${key}` : key))
      } else {
        res.push({ key: prefix ? `${prefix}.${key}` : key, value: obj[key] })
      }
    }
    return res
  }
  const data = flatten(obj).map(item => ({
    route: jsonRoute.value,
    lang: jsonLang.value,
    key: item.key,
    value: item.value
  }))
  if (data.length === 0) {
    ElMessage.warning('无有效数据')
    return
  }
  loading.value = true
  try {
    await addPageLangBatch(data)
    ElMessage.success('批量添加成功')
    // 不自动关闭抽屉
    fetchData()
  } catch (e) {
    ElMessage.error('JSON批量添加失败: ' + (e?.message || e || '请重试'))
  } finally {
    loading.value = false
  }
}

function handleDelete(row) {
  ElMessageBox.confirm('确定删除该项吗？', '提示', { type: 'warning' })
    .then(async () => {
      loading.value = true
      try {
        await deletePageLang(row.id)
        ElMessage.success('删除成功')
        fetchData()
      } catch (e) {
        ElMessage.error('删除失败: ' + (e?.message || e || '请重试'))
      } finally {
        loading.value = false
      }
    })
    .catch(() => {})
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

function copyBatchRow(idx) {
  const row = batchTableData.value[idx]
  batchTableData.value.splice(idx + 1, 0, { ...row })
}

onMounted(fetchData)
definePageMeta({ layout: 'admin' })
</script>

<style scoped>
</style>
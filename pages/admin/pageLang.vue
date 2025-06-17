<template>
    <div>
        <el-button type="primary" @click="openDialog()">添加</el-button>
        <el-table :data="tableData" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80"/>
            <el-table-column prop="lang_key" label="语言键"/>
            <el-table-column prop="lang_value" label="语言值"/>
            <el-table-column prop="description" label="描述"/>
            <el-table-column label="操作" width="180">
                <template #default="scope">
                    <el-button size="mini" @click="openDialog(scope.row)">编辑</el-button>
                    <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page="page"
            @current-change="handlePageChange"
            style="margin-top: 16px;"
        />

        <el-dialog v-model="dialogVisible" :title="dialogTitle">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
                <el-form-item label="语言键" prop="lang_key">
                    <el-input v-model="form.lang_key"/>
                </el-form-item>
                <el-form-item label="语言值" prop="lang_value">
                    <el-input v-model="form.lang_value"/>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="form.description"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 假设有API如下
// import { getPageLangList, addPageLang, updatePageLang, deletePageLang } from '@/api/pageLang'

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 10

const dialogVisible = ref(false)
const dialogTitle = ref('添加')
const form = reactive({
    id: null,
    lang_key: '',
    lang_value: '',
    description: ''
})
const rules = {
    lang_key: [{ required: true, message: '请输入语言键', trigger: 'blur' }],
    lang_value: [{ required: true, message: '请输入语言值', trigger: 'blur' }]
}
const formRef = ref(null)

function fetchData() {
    loading.value = true
    // 这里用模拟数据，实际请替换为API调用
    setTimeout(() => {
        tableData.value = [
            { id: 1, lang_key: 'hello', lang_value: '你好', description: '问候' },
            { id: 2, lang_key: 'bye', lang_value: '再见', description: '告别' }
        ]
        total.value = 2
        loading.value = false
    }, 500)
    // getPageLangList({ page: page.value, pageSize }).then(res => {
    //   tableData.value = res.data.list
    //   total.value = res.data.total
    //   loading.value = false
    // })
}

function openDialog(row) {
    if (row) {
        dialogTitle.value = '编辑'
        Object.assign(form, row)
    } else {
        dialogTitle.value = '添加'
        Object.assign(form, { id: null, lang_key: '', lang_value: '', description: '' })
    }
    dialogVisible.value = true
}

function handleSubmit() {
    formRef.value.validate(async (valid) => {
        if (!valid) return
        loading.value = true
        if (form.id) {
            // await updatePageLang(form)
            ElMessage.success('编辑成功')
        } else {
            // await addPageLang(form)
            ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        fetchData()
    })
}

function handleDelete(row) {
    ElMessageBox.confirm('确定删除该项吗？', '提示', { type: 'warning' })
        .then(async () => {
            loading.value = true
            // await deletePageLang(row.id)
            ElMessage.success('删除成功')
            fetchData()
        })
        .catch(() => {})
}

function handlePageChange(val) {
    page.value = val
    fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
</style>
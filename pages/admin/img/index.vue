<template>
	<div>
		<h2 class="text-xl font-bold mb-4">图片列表</h2>
		<el-form :inline="true" class="mb-4" @submit.prevent>
			<el-form-item label="产品名称">
				<el-input v-model="query.name" placeholder="请输入产品名称" clearable />
			</el-form-item>
			<el-form-item label="分类">
				<el-select v-model="query.type" placeholder="请选择分类" clearable style="width: 180px">
					<el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="fetchImages">查询</el-button>
				<el-button @click="viewMode = 'list'">列表模式</el-button>
			<el-button @click="viewMode = 'grid'">平铺模式</el-button>
			<el-button type="primary" @click="uploadDialogVisible = true">点击上传</el-button>
				<el-button type="danger" class="ml-2" @click="confirmBatchDelete">批量删除</el-button>
			</el-form-item>
		</el-form>
		<el-dialog v-model="editDialogVisible" title="编辑图片">
			<el-form :model="selectedImage">
				<el-form-item label="描述">
					<el-input v-model="selectedImage.alt" placeholder="请输入描述" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="editDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="saveAlt">保存</el-button>
			</template>
		</el-dialog>

		<el-dialog v-model="uploadDialogVisible" title="图片上传">
			<el-upload
				class="upload-demo"
				action="/api/img/upload"
				:auto-upload="false"
				  list-type="picture-card"
				multiple
				:file-list="fileList"
				:on-change="handleFileChange"
				:on-remove="handleFileRemove"
				ref="uploadRef"
			><el-icon><Plus /></el-icon>
			</el-upload>
			<template #footer>
				<el-button @click="uploadDialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="uploading" :disabled="uploading || fileList.length===0" @click="submitUpload">确认</el-button>
			</template>
		</el-dialog>

		<div v-if="viewMode === 'list'">
			<el-table :data="images" style="width: 100%" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55" />
				<el-table-column prop="id" label="ID" width="70" />
				<el-table-column prop="name" label="图片名称" />
				<el-table-column prop="type" label="图片类型" />
				<el-table-column prop="size" label="大小" />
				<el-table-column prop="path" label="图片路径">
					<template #default="{ row }">
					<img :src="getImageUrl(row.path)" loading="lazy" alt="" class="max-h-20" />
					<a :href="getImageUrl(row.path)" target="_blank">查看图片</a>
					</template>
				</el-table-column>
				<el-table-column prop="alt" label="描述" />
						<el-table-column prop="publishTime" label="发布时间">
							<template #default="{ row }">
								{{ formatDate(row.publishTime) }}
							</template>
						</el-table-column>
						<el-table-column prop="updatedat" label="修改时间">
							<template #default="{ row }">
								{{ formatDate(row.updatedat) }}
							</template>
						</el-table-column>
				<el-table-column label="操作" width="220">
					<template #default="scope">
						<el-button type="warning" size="small" class="ml-2" @click="editProduct(scope.row)">修改</el-button>
						<el-button type="danger" size="small" class="ml-2" @click="deleteImage(scope.row)">删除</el-button>
						
					</template>
				</el-table-column>
			</el-table>
		</div>

		<!-- 分页（列表视图） -->
		<div v-if="viewMode === 'list'" class="mt-4 flex justify-end">
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

				<div v-else>
			<div class="grid">
				<div v-for="img in images" :key="img.id" class="grid-item" @click="openPreview(img)">
					<img :src="getImageUrl(img.path)" loading="lazy" alt="" class="grid-image" />
					<p class="grid-name">{{ img.name }}</p>
				</div>
			</div>

			<!-- 分页（网格视图） -->
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

			<!-- 大图预览 Dialog -->
			<el-dialog v-model="showPreviewDialog" width="60%" :close-on-click-modal="true" center>
				<img :src="previewImage" alt="预览" class="preview-large" />
				<template #footer>
					<el-button @click="showPreviewDialog = false">关闭</el-button>
				</template>
			</el-dialog>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// Element Plus message helper
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
const images = ref([])
const categories = ref([])
const query = ref({ name: '', type: '' })
const selectedImage = ref({})
const editDialogVisible = ref(false)
const viewMode = ref('list')
const fileList = ref([])
const uploadDialogVisible = ref(false)
const uploadRef = ref(null)
const uploading = ref(false)

// pagination for image list
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showPreviewDialog = ref(false)
const previewImage = ref('')
const selectedImages = ref([])

definePageMeta({ layout: "admin" });
const router = useRouter()

function formatDate(val) {
	if (!val) return '';
	const d = new Date(val);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	const h = String(d.getHours()).padStart(2, '0');
	const min = String(d.getMinutes()).padStart(2, '0');
	return `${y}-${m}-${day} ${h}:${min}`;
}

/**
 * 返回当前页面的 base URL（SSR 安全）
 */
function getBaseUrl() {
	if (typeof window === 'undefined') return ''
	return window.location.protocol + '//' + window.location.host
}
/**
 * 将给定的图片 path 转成可点击的完整 URL
 * - 如果 path 已经是绝对 URL（http(s)://），直接返回（并追加 client 标签）
 * - 如果是 protocol-relative（//...），补上协议
 * - 否则拼接上当前站点的 base URL
 * - 默认添加 query 参数 client=admin（如果已有 client 参数则不重复添加）
 */
function getImageUrl(p) {
	if (!p) return ''
	const clientTag = 'client=admin'
	const hasClient = p.includes('client=')

	// 绝对 URL
	if (/^https?:\/\//i.test(p)) {
		return hasClient ? p : (p + (p.includes('?') ? '&' : '?') + clientTag)
	}

	// protocol-relative //example.com/...
	if (/^\/\//.test(p)) {
		const full = (typeof window === 'undefined' ? 'https:' : window.location.protocol) + p
		return hasClient ? full : (full + (full.includes('?') ? '&' : '?') + clientTag)
	}

	// 相对路径，拼接 base
	const base = getBaseUrl()
	// 确保斜杠
	const sep = p.startsWith('/') ? 'api/img/' : '/api/img/'
	const full = base ? base + sep + p : p
	return hasClient ? full : (full + (full.includes('?') ? '&' : '?') + clientTag)
}

function editProduct(row) {
	// 跳转到 mew.vue 页面，传递 id 和 slug
	router.push(`/admin/products/new?id=${row.id}&slug=${row.slug}`)
}

async function fetchImages() {
	// 查询接口，传递 name 和 type 和分页
	const res = await $fetch('/api/img/page', {
		params: {
			name: query.value.name,
			type: query.value.type,
			page: page.value,
			pageSize: pageSize.value,
		},
	})
	images.value = (res.data && res.data.list) ? res.data.list : (res.list || [])
	total.value = (res.data && typeof res.data.total !== 'undefined') ? res.data.total : (res.total || 0)
}

async function handleUploadSuccess(response) {
	// 处理上传成功
	console.log('上传成功', response)
}

async function handleUploadError(error) {
	// 处理上传失败
	console.log('上传失败', error)
}

function saveAlt() {
	// 保存 alt 属性
	console.log('保存 alt', selectedImage.value)
}

function handleSelectionChange(rows) {
	selectedImages.value = rows || []
}

async function confirmBatchDelete() {
	if (!selectedImages.value || selectedImages.value.length === 0) {
		ElMessage.warning('请先选择要删除的图片')
		return
	}
	try {
		await ElMessageBox.confirm(`确认删除所选 ${selectedImages.value.length} 张图片？`, '批量删除', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		})
	} catch (e) {
		return
	}
	let loading = null
	try {
		loading = ElLoading.service({ lock: true, text: '处理中,请稍后...', background: 'rgba(0,0,0,0.7)' })
		const ids = selectedImages.value.map((r) => r.id).filter(Boolean)
		const res = await $fetch('/api/img/batch', { method: 'DELETE', body: { ids } })
		if (res && res.success) {
			ElMessage.success(res.message || '批量删除完成')
		} else {
			ElMessage.error(res.message || '部分或全部删除失败')
		}
		await fetchImages()
		selectedImages.value = []
	} catch (err) {
		console.error('批量删除错误', err)
		ElMessage.error('删除发生错误，请查看控制台')
	} finally {
		try { loading && loading.close() } catch (e) {}
	}
}

async function deleteImage(row) {
	const name = row?.name || row?.path || ''
	try {
		await ElMessageBox.confirm(`确定删除图片：${name} ?`, '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		})
	} catch (e) {
		// 用户已取消或对话框被关闭
		return
	}

	try {
		const res = await $fetch(`/api/img/${row.id}`, { method: 'DELETE' })
		if (res && res.success === false) {
			ElMessage.error(res.error || '删除失败')
			return
		}
		ElMessage.success('删除成功')
		await fetchImages()
	} catch (err) {
		console.error('删除图片失败', err)
		ElMessage.error('删除失败')
	}
}

function openPreview(img) {
	const url = getImageUrl(img.path)
	previewImage.value = url
	showPreviewDialog.value = true
}

async function handleFileChange(file) {
	fileList.value.push(file)
}

async function handleFileRemove(file) {
	fileList.value = fileList.value.filter(f => f.uid !== file.uid)
}

function onPageChange(p) {
	page.value = p
	fetchImages()
}

function onSizeChange(sz) {
	pageSize.value = sz
	page.value = 1
	fetchImages()
}

async function submitUpload() {
	if (!fileList.value || fileList.value.length === 0) {
		ElMessage.warning('请选择要上传的文件')
		return
	}

	const formData = new FormData()
	fileList.value.forEach((file, idx) => {
		if (file.raw) formData.append('files', file.raw, file.raw.name || `file-${idx}`)
	})

	uploading.value = true
	let loadingInst = null
	try {
		loadingInst = ElLoading.service({ lock: true, text: '上传中，请稍后...', background: 'rgba(0,0,0,0.7)' })
		const res = await fetch('/api/batchupload', { method: 'POST', body: formData })
		const r = await res.json().catch(() => ({ success: false }))
		if (r && r.success) {
			ElMessage.success('图片上传成功！')
			// 清空上传列表并关闭对话框
			fileList.value = []
			try { if (uploadRef.value && uploadRef.value.clearFiles) uploadRef.value.clearFiles() } catch (e) {}
			uploadDialogVisible.value = false
			// 刷新图片列表
			await fetchImages()
		} else {
			console.error('上传返回', r)
			ElMessage.error(r && r.message ? r.message : '图片上传失败')
		}
	} catch (err) {
		console.error('上传失败', err)
		ElMessage.error('上传失败，请查看控制台')
	} finally {
		try { loadingInst && loadingInst.close() } catch (e) {}
		uploading.value = false
	}
}

onMounted(async () => {
	await fetchImages()
})
useHead({
  title:  '图片管理'
})
</script>

<style scoped>
.grid {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	gap: 12px;
}
.grid-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 8px;
	background: #fff;
	border: 1px solid #eef2f6;
	border-radius: 6px;
	cursor: pointer;
}
.grid-image {
	width: 100%;
	height: 120px;
	object-fit: cover;
	border-radius: 4px;
}
.grid-name {
	margin-top: 6px;
	font-size: 12px;
	color: #333;
	text-align: center;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	width: 100%;
}
.preview-large {
	width: 100%;
	max-height: 70vh;
	object-fit: contain;
	display: block;
	margin: 0 auto;
}
</style>
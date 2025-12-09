import { defineEventHandler, readMultipartFormData } from 'h3'
import { insert, select } from '../db/orm'
import type { Img } from '../models/img'

export default defineEventHandler(async (event) => {
    // 解析 multipart/form-data
    const files = await readMultipartFormData(event)
    const fileList = files?.filter(f => f.name === 'files') || []

    // 获取 Cloudflare R2 绑定
    const r2 = event.context.cloudflare?.env?.imgbucket
    if (!r2) return { success: false, error: 'R2 binding not found' }

    const results: Array<{ id: number | undefined, name: string | undefined }> = []

    for (const file of fileList) {
        // 决定上传到 R2 的文件名：
        // 如果原始文件名包含 uuid_（不区分大小写），则保留原名（去除路径部分），否则生成唯一文件名
        const originalName = (file.filename || '').toString()
        // 防止路径遍历或包含目录，取 basename
        const safeBase = originalName.split(/\\|\//).pop() || ''
        let filename: string
        if (safeBase.toLowerCase().includes('uuid_')) {
            // 保留原始文件名
            filename = safeBase || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
        } else {
            const ext = safeBase.split('.').pop() || 'jpg'
            filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        }

        // 上传到 R2
        await r2.put(filename, file.data, { httpMetadata: { contentType: file.type } })
        // const url = `https://imgbucket.example.com/${filename}`
        const url = filename

        // 计算文件大小文本
        const sizeInBytes = file.data.length
        let sizeText = ''
        if (sizeInBytes >= 1024 * 1024) {
            sizeText = `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
        } else {
            sizeText = `${(sizeInBytes / 1024).toFixed(2)} KB`
        }

        // 保存到 img 表
        const imgObj: Partial<Img> = {
            name: file.filename || filename,
            path: url,
            type: file.type || 'application/octet-stream',
            relId: 0,
            alt: '',
            createAt: new Date().toISOString(),
            isDel: false,
            size: sizeText,
        }
        await insert<Img>('img', imgObj)
        // 查询刚插入的图片（按 path 唯一）
        const imgs = await select<Img>('img', { path: url })
        const img = imgs && imgs.length > 0 ? imgs[0] : null
        results.push({ id: img?.id, name: img?.name })
    }

    return { success: true, files: results }
})
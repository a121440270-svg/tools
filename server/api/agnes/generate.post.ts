import { createError, defineEventHandler, readBody } from 'h3'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function getAgnesConfig(event: any) {
  const baseUrl = process.env.AGNES_API_BASE_URL || event?.context?.cloudflare?.env?.AGNES_API_BASE_URL || 'https://apihub.agnes-ai.cn'
  const apiKey = process.env.AGNES_API_KEY || event?.context?.cloudflare?.env?.AGNES_API_KEY || 'sk-3zxYx2xWoc4RYtoUH6tVKpuGpwhpO0z1TSH4hG7UquPi4B7J'
  return { baseUrl, apiKey }
}

async function requestJson(url: string, headers: Record<string, string>, body: Record<string, any>) {
  console.log('[AGNES REQUEST]', { url, headers, body })

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  const text = await res.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  console.log('[AGNES RESPONSE]', {
    status: res.status,
    ok: res.ok,
    url,
    body: data
  })

  if (!res.ok) {
    throw createError({
      statusCode: res.status || 500,
      statusMessage: data?.error?.message || data?.message || 'Agnes AI request failed'
    })
  }

  return data
}

async function getVideoResult(baseUrl: string, apiKey: string, videoId: string) {
  const url = new URL(`${baseUrl}/agnesapi`)
  url.searchParams.set('video_id', videoId)

  console.log('[AGNES VIDEO STATUS REQUEST]', { url: url.toString(), videoId })

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  })

  const text = await res.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  console.log('[AGNES VIDEO STATUS RESPONSE]', {
    status: res.status,
    ok: res.ok,
    videoId,
    body: data
  })

  if (!res.ok) {
    throw createError({
      statusCode: res.status || 500,
      statusMessage: data?.error?.message || data?.message || 'Unable to fetch video result'
    })
  }

  return data
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const type = body?.type || 'image'
  const { baseUrl, apiKey } = getAgnesConfig(event)

  console.log('[AGNES INPUT]', { type, body, baseUrl, apiKeyLoaded: !!apiKey })

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'AGNES_API_KEY is not configured. Set AGNES_API_KEY in your environment.'
    })
  }

  if (type === 'image') {
    const extraBody: Record<string, any> = { ...(body.extra_body || {}) }
    const imageList = body.image ? (Array.isArray(body.image) ? body.image : [body.image]) : []

    if (imageList.length) {
      extraBody.image = imageList
    }

    if (body.return_base64) {
      extraBody.response_format = 'b64_json'
    } else if (!extraBody.response_format) {
      extraBody.response_format = 'url'
    }

    const payload: Record<string, any> = {
      model: 'agnes-image-2.1-flash',
      prompt: String(body.prompt || '').trim(),
      size: body.size || '2K',
      ...(body.ratio ? { ratio: body.ratio } : {}),
      ...(body.negative_prompt ? { negative_prompt: body.negative_prompt } : {}),
      ...(body.seed !== undefined ? { seed: Number(body.seed) } : {}),
      ...(Object.keys(extraBody).length ? { extra_body: extraBody } : {})
    }

    if (!payload.prompt) {
      throw createError({ statusCode: 400, statusMessage: 'prompt is required' })
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }

    return await requestJson(`${baseUrl}/v1/images/generations`, headers, payload)
  }

  const payload: Record<string, any> = {
    model: 'agnes-video-v2.0',
    prompt: String(body.prompt || '').trim(),
    ...(body.image ? { image: body.image } : {}),
    ...(body.mode ? { mode: body.mode } : {}),
    ...(body.width ? { width: Number(body.width) } : {}),
    ...(body.height ? { height: Number(body.height) } : {}),
    ...(body.num_frames ? { num_frames: Number(body.num_frames) } : {}),
    ...(body.frame_rate ? { frame_rate: Number(body.frame_rate) } : {}),
    ...(body.negative_prompt ? { negative_prompt: body.negative_prompt } : {}),
    ...(body.seed !== undefined ? { seed: Number(body.seed) } : {}),
    ...(body.extra_body ? { extra_body: body.extra_body } : {})
  }

  if (!payload.prompt) {
    throw createError({ statusCode: 400, statusMessage: 'prompt is required' })
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }

  const task = await requestJson(`${baseUrl}/v1/videos`, headers, payload)
  const videoId = task?.video_id || task?.task_id || task?.id

  if (!videoId) {
    return task
  }

  let result = task
  for (let index = 0; index < 30; index++) {
    await sleep(4000)
    try {
      result = await getVideoResult(baseUrl, apiKey, videoId)
      if (result?.status === 'completed' || result?.status === 'failed') {
        break
      }
    } catch (error) {
      if (index >= 29) {
        throw error
      }
    }
  }

  return {
    success: true,
    task,
    result
  }
})

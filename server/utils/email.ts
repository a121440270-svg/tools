export interface EmailMessage {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export interface EmailResult {
  success: boolean
  provider: string
  error?: string
  skipped?: boolean
}

interface EmailConfig {
  provider: string
  apiKey: string
  from: string
  backupApiKey: string
  backupFrom: string
}

function resolveEnv(event?: any): Record<string, any> {
  const cloudflareEnv = event?.context?.cloudflare?.env
  if (cloudflareEnv) return cloudflareEnv as Record<string, any>
  const processEnv = (globalThis as any).process?.env
  return (processEnv || {}) as Record<string, any>
}

function getConfig(event?: any): EmailConfig {
  const env = resolveEnv(event)
  const apiKey = env.RESEND_API_KEY || ''
  const from = env.RESEND_FROM || ''

  return {
    provider: apiKey ? 'resend' : 'none',
    apiKey,
    from,
    backupApiKey: env.SMTP2GO_API_KEY || '',
    backupFrom: env.SMTP2GO_FROM || ''
  }
}

async function sendViaResend(config: EmailConfig, message: EmailMessage): Promise<EmailResult> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: config.from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {})
    })
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    return {
      success: false,
      provider: 'resend',
      error: `HTTP ${response.status}: ${detail.slice(0, 300)}`
    }
  }

  return { success: true, provider: 'resend' }
}

async function sendViaSmtp2Go(config: EmailConfig, message: EmailMessage): Promise<EmailResult> {
  const response = await fetch('https://api.smtp2go.com/v3/email/send', {
    method: 'POST',
    headers: {
      'X-Smtp2go-Api-Key': config.backupApiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: config.backupFrom,
      to: [message.to],
      subject: message.subject,
      text_body: message.text,
      html_body: message.html,
      ...(message.replyTo
        ? { custom_headers: [{ header: 'Reply-To', value: message.replyTo }] }
        : {})
    })
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    return {
      success: false,
      provider: 'smtp2go',
      error: `HTTP ${response.status}: ${detail.slice(0, 300)}`
    }
  }

  const result = await response.json() as { data?: { succeeded?: number }; error?: string }
  if (result.data?.succeeded === 0 || result.error) {
    return {
      success: false,
      provider: 'smtp2go',
      error: result.error || 'SMTP2GO did not accept the email'
    }
  }

  return { success: true, provider: 'smtp2go' }
}

export async function sendEmail(message: EmailMessage, event?: any): Promise<EmailResult> {
  const config = getConfig(event)

  let primaryError = ''
  if (config.apiKey && config.from) {
    const primaryResult = await sendViaResend(config, message).catch((error) => ({
      success: false,
      provider: 'resend',
      error: error instanceof Error ? error.message : String(error)
    }))
    if (primaryResult.success) return primaryResult
    primaryError = primaryResult.error || 'Resend delivery failed'
    console.error('[email] Resend delivery failed:', primaryError)
  } else if (config.apiKey) {
    primaryError = 'RESEND_FROM not configured'
    console.error('[email] RESEND_API_KEY is configured, but RESEND_FROM is missing')
  }

  if (config.backupApiKey && config.backupFrom) {
    const backupResult = await sendViaSmtp2Go(config, message).catch((error) => ({
      success: false,
      provider: 'smtp2go',
      error: error instanceof Error ? error.message : String(error)
    }))
    if (backupResult.success) return backupResult
    console.error('[email] SMTP2GO fallback delivery failed:', backupResult.error || 'Unknown email error')
    return {
      ...backupResult,
      error: [primaryError, backupResult.error].filter(Boolean).join('; ')
    }
  }

  if (config.backupApiKey) {
    const backupError = 'SMTP2GO_FROM not configured'
    console.error('[email] SMTP2GO_API_KEY is configured, but SMTP2GO_FROM is missing')
    return {
      success: false,
      provider: 'smtp2go',
      error: [primaryError, backupError].filter(Boolean).join('; ')
    }
  }

  if (primaryError) {
    return { success: false, provider: 'resend', error: primaryError }
  }

  console.warn('[email] No Resend or SMTP2GO credentials are configured; email was not sent')
  return {
    success: false,
    provider: 'none',
    skipped: true,
    error: 'RESEND_API_KEY and SMTP2GO_API_KEY not configured'
  }
}

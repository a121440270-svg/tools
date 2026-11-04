<template>
  <div class="mx-auto max-w-5xl py-6 sm:py-10">
    <!-- hero -->
    <header
      class="reveal relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_30px_60px_-50px_rgba(0,0,0,0.55)] dark:border-slate-800 dark:bg-slate-900/95"
    >
      <div class="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30"
        style="
          background-image: radial-gradient(circle at 1px 1px, rgb(var(--foreground) / 0.12) 1px, transparent 0);
          background-size: 22px 22px;
        "
        aria-hidden="true"
      />
      <div class="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#ff5a2d]/10 blur-3xl" aria-hidden="true" />
      <div class="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

      <div class="relative p-6 sm:p-10">
        <p class="kicker">{{ copy.kicker }}</p>
        <h1
          class="mt-4 max-w-2xl font-display text-[clamp(2.4rem,6vw,4.2rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-slate-900 dark:text-white"
        >
          {{ copy.title }}
        </h1>
        <p class="mt-5 max-w-2xl text-[15px] leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
          {{ copy.intro }}
        </p>
      </div>
    </header>

    <div class="mt-6 grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
      <!-- direct contact + tips -->
      <div class="reveal space-y-4" style="--rd: 80ms">
        <div class="relative overflow-hidden rounded-2xl bg-[#101c18] p-5 text-white shadow-[0_24px_48px_-34px_rgba(0,0,0,0.9)] sm:p-6">
          <div
            class="pointer-events-none absolute inset-0 opacity-40"
            style="
              background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.12) 1px, transparent 0);
              background-size: 18px 18px;
            "
            aria-hidden="true"
          />
          <div class="relative">
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">{{ copy.emailHeading }}</p>
            <a
              href="mailto:huiqinliu1005@gmail.com"
              class="mt-2 inline-block break-all font-display text-lg font-bold tracking-tight text-white transition hover:text-[#ff8a66]"
            >
              huiqinliu1005@gmail.com
            </a>
            <p class="mt-2 text-[13px] leading-6 text-white/60">{{ copy.emailNote }}</p>
            <div class="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
              <span class="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">{{ copy.responseLabel }}</span>
              <span class="text-[13px] font-medium text-white/90">{{ copy.responseValue }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-[0_20px_44px_-42px_rgba(0,0,0,0.6)] dark:border-slate-800 dark:bg-slate-900/95 sm:p-6">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            {{ copy.includeHeading }}
          </p>
          <ul class="mt-4 space-y-4">
            <li v-for="(item, index) in copy.include" :key="item.title" class="flex gap-3">
              <span
                class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] font-semibold tabular-nums text-primary"
              >
                {{ String(index + 1).padStart(2, '0') }}
              </span>
              <div>
                <p class="text-[13.5px] font-semibold text-slate-900 dark:text-white">{{ item.title }}</p>
                <p class="mt-0.5 text-[12.5px] leading-5 text-slate-500 dark:text-slate-400">{{ item.text }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- form -->
      <div
        class="reveal rounded-[24px] border border-slate-200 bg-white/95 p-5 shadow-[0_30px_60px_-52px_rgba(0,0,0,0.5)] dark:border-slate-800 dark:bg-slate-900/95 sm:p-8"
        style="--rd: 160ms"
      >
        <div class="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200/80 pb-4 dark:border-slate-800/80">
          <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">{{ copy.formHeading }}</h2>
          <p class="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">{{ copy.formNote }}</p>
        </div>

        <form class="mt-5 space-y-4" @submit.prevent="submit">
          <div>
            <label for="contact-message" class="mb-1.5 flex items-baseline justify-between gap-3">
              <span class="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{{ copy.messageLabel }}</span>
              <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">{{ copy.requiredLabel }}</span>
            </label>
            <textarea
              id="contact-message"
              v-model="message"
              rows="7"
              required
              minlength="10"
              maxlength="3000"
              :placeholder="copy.messagePlaceholder"
              class="w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label for="contact-email" class="mb-1.5 block text-[13px] font-semibold text-slate-800 dark:text-slate-200">
              {{ copy.emailInputLabel }}
            </label>
            <input
              id="contact-email"
              v-model="email"
              type="email"
              maxlength="254"
              :placeholder="copy.emailPlaceholder"
              class="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          <!-- honeypot -->
          <input v-model="website" type="text" name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />

          <p
            v-if="status === 'success'"
            class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            {{ copy.success }}
          </p>
          <p
            v-else-if="status === 'error'"
            class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          >
            {{ copy.error }}
          </p>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
            <button type="submit" :disabled="status === 'sending'" class="btn-primary">
              {{ status === 'sending' ? copy.sending : copy.submit }}
              <svg
                v-if="status !== 'sending'"
                class="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <NuxtLink
              :to="localePath('/privacy')"
              class="text-xs text-slate-500 underline decoration-slate-300 underline-offset-2 transition hover:text-primary dark:text-slate-400 dark:decoration-slate-600"
            >
              {{ copy.privacyLink }}
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const isZh = computed(() => locale.value === 'zh')

const message = ref('')
const email = ref('')
const website = ref('')
const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle')

const en = {
  kicker: 'Contact · Get in touch',
  title: 'Talk to the person who builds it.',
  intro:
    'Found a bug, need a tool that does not exist yet, or have a question about privacy, licensing or advertising? Send a message and it lands straight in my inbox.',
  emailHeading: 'Email',
  emailNote: 'For privacy requests, please include the email address linked to your account.',
  responseLabel: 'Typical reply time',
  responseValue: '2–3 business days',
  includeHeading: 'Helpful details',
  include: [
    { title: 'Bug report', text: 'The page URL, your browser, and what you expected to happen.' },
    { title: 'Tool idea', text: 'The task you are trying to finish, not just the format you want.' },
    { title: 'Privacy request', text: 'The email address linked to your account, if you have one.' },
  ],
  formHeading: 'Send a message',
  formNote: 'Up to 3,000 characters',
  messageLabel: 'Your message',
  requiredLabel: 'Required',
  messagePlaceholder: 'Describe the issue, suggestion or question (at least 10 characters)',
  emailInputLabel: 'Your email (optional, so we can reply)',
  emailPlaceholder: 'you@example.com',
  submit: 'Send message',
  sending: 'Sending…',
  success: 'Thank you — your message has been sent. We will get back to you soon.',
  error: 'Sorry, the message could not be sent. Please try again later or email us directly.',
  privacyLink: 'How we handle your data',
}

const zh = {
  kicker: '联系 · 直接沟通',
  title: '直接和开发者聊。',
  intro: '发现 bug、需要尚未提供的工具，或对隐私、授权、广告有疑问？欢迎留言，消息会直接进入我的收件箱。',
  emailHeading: '邮箱',
  emailNote: '涉及隐私的请求，请附上账户绑定的邮箱地址。',
  responseLabel: '通常回复时间',
  responseValue: '2–3 个工作日',
  includeHeading: '写清楚这几点',
  include: [
    { title: '反馈 bug', text: '出问题的页面链接、使用的浏览器，以及你期望的结果。' },
    { title: '工具建议', text: '你想完成的任务，而不只是想要的格式。' },
    { title: '隐私请求', text: '账户绑定的邮箱地址（如果有）。' },
  ],
  formHeading: '发送留言',
  formNote: '最多 3000 个字符',
  messageLabel: '你的留言',
  requiredLabel: '必填',
  messagePlaceholder: '请描述问题、建议或疑问（至少 10 个字符）',
  emailInputLabel: '你的邮箱（选填，便于回复）',
  emailPlaceholder: 'you@example.com',
  submit: '发送留言',
  sending: '发送中…',
  success: '感谢留言，我们已经收到，会尽快回复你。',
  error: '抱歉，留言发送失败。请稍后重试，或直接发邮件给我们。',
  privacyLink: '我们如何处理你的数据',
}

const copy = computed(() => (isZh.value ? zh : en))

async function submit() {
  if (status.value === 'sending') return
  status.value = 'sending'
  try {
    await $fetch('/api/feedback', {
      method: 'POST',
      body: {
        message: message.value,
        email: email.value,
        website: website.value,
        pageUrl: window.location.href,
      },
    })
    status.value = 'success'
    message.value = ''
    email.value = ''
  } catch {
    status.value = 'error'
  }
}

useSeoMeta({
  title: () => (isZh.value ? '联系我们 - OnliTool' : 'Contact OnliTool'),
  description: () =>
    isZh.value
      ? '联系 OnliTool：反馈 bug、建议新工具，或咨询隐私与广告相关问题。'
      : 'Contact OnliTool for bug reports, tool suggestions, privacy questions and advertising enquiries.',
  robots: 'index, follow',
})
</script>

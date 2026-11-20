<template>
  <WheelDecisionLanding :config="copy" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { wheelRelatedEn, wheelRelatedZh } from '~/data/wheel-related'

const { locale } = useI18n()
const isZh = computed(() => locale.value === 'zh')

const en = {
  breadcrumbLabel: 'Spin the Wheel',
  breadcrumbCurrent: 'Yes or No Wheel',
  kicker: 'Random decision · Yes or no',
  title: 'Yes or No Wheel',
  lead: 'A yes-or-no wheel is a two-sided spinner that answers binary questions with a random Yes or No. Use it for quick decisions, tarot-style prompts or classroom voting. OnliTool is free, runs in your browser, needs no sign-up, uses cryptographic randomness and shows an audit note for every spin.',
  updated: 'Last updated: November 20, 2026',
  primaryText: 'Open the free wheel',
  secondaryText: 'See all random tools',
  answerTitle: 'What is a yes or no wheel?',
  answer: 'A yes or no wheel is a random picker with two options — Yes and No — that settles a question when you cannot decide. OnliTool lets you add an optional Maybe slice, type your question above the wheel, and spin once. The result is chosen with the browser Web Crypto API before the animation, and an audit note records the random value and a hash of your options so the answer can be checked later.',
  bullets: [
    'Two slices by default; add a third Maybe slice if you allow undecided outcomes.',
    'Write your question above the wheel so everyone can see what is being decided.',
    'Cryptographic randomness chosen before the spin animation — not a visual trick.',
    'An audit note with every result: random value, entry hash and timestamp.',
    'Free, no sign-up, no ads, no entry limit; your list never leaves the browser.',
    'Fullscreen, sound and confetti for classroom screens or live streams.'
  ],
  stepsTitle: 'How to use a yes or no wheel',
  steps: [
    'Open the wheel tool and replace the default entries with Yes and No.',
    'Add a third Maybe entry if you want to allow an undecided result.',
    'Type your question into the entry box so the context stays visible during the spin.',
    'Press Spin (or the spacebar). The winner is decided cryptographically before the wheel moves.',
    'For tarot-style prompts, focus on one clear yes/no question and spin only once.',
    'Copy the audit note if you need to show that the answer was random.'
  ],
  relatedTitle: 'More random decision tools',
  related: wheelRelatedEn,
  faqTitle: 'Frequently asked questions',
  faqs: [
    {
      q: 'How do I make a yes or no wheel?',
      a: 'Open the free wheel, clear the default entries and add two options: Yes and No. Type your question above the list, then press Spin. The wheel stops on one of the two slices and shows the result with an audit note. No account or download is needed.'
    },
    {
      q: 'Is a yes or no wheel actually random?',
      a: 'OnliTool picks the winner with the browser Web Crypto API before the animation starts, so the spinning is only a visual display. Every spin records a random 32-bit value, a timestamp and a hash of the option list. You can copy that note as evidence that the result was not chosen manually.'
    },
    {
      q: 'Can I use a yes or no wheel for tarot or oracle questions?',
      a: 'Yes. Many people use a yes/no wheel as a light tarot-style prompt: write a clear question that can be answered with Yes or No, focus on it, and spin once. The wheel gives a random answer rather than a prediction — treat it as a decision aid, not a guarantee.'
    },
    {
      q: 'Can I add a Maybe option?',
      a: 'Yes. Add a third entry named Maybe. Each entry can also have a weight, so you can make Yes and No equally likely, or give Maybe a smaller slice if you only want occasional undecided answers.'
    },
    {
      q: 'Is the yes or no wheel free and do I need to sign up?',
      a: 'It is completely free with no account, no ads and no entry limit. The tool runs locally in your browser, so nothing is uploaded and you can use it offline after the page has loaded.'
    },
    {
      q: 'Can I share the question and wheel with someone?',
      a: 'Yes. The Share button copies a link with your option list encoded in the URL. Open it on another device and the same Yes/No wheel appears, ready to spin. The question text is not stored on a server.'
    }
  ],
  footerNote: 'OnliTool is an independent project and is not affiliated with any other wheel or tarot product. Names of other tools are used only for comparison and identification.'
}

const zh = {
  breadcrumbLabel: '转盘抽奖工具',
  breadcrumbCurrent: '是或否转盘',
  kicker: '随机决策 · 是或否',
  title: '是或否转盘',
  lead: '是或否转盘是一种只有「是」和「否」两个扇区的随机转盘，用来回答二选一问题。它适合快速决策、塔罗式提问或课堂投票。OnliTool 免费、在浏览器中运行、无需注册，使用密码学随机数并为每次旋转生成审计记录。',
  updated: '最后更新：2026 年 11 月 20 日',
  primaryText: '打开免费转盘',
  secondaryText: '查看全部随机工具',
  answerTitle: '什么是是或否转盘？',
  answer: '是或否转盘是一个只有「是」与「否」两个选项的随机选择器，在难以决定时替你给出答案。OnliTool 允许增加第三个「也许」扇区，可在转盘上方写下问题，然后旋转一次。结果由浏览器 Web Crypto API 在动画前选出，审计记录会保存随机值与选项列表哈希，方便事后核对。',
  bullets: [
    '默认两个扇区；如需保留不确定结果，可增加第三个「也许」扇区。',
    '把问题写在转盘上方，让所有人都能看到正在决定什么。',
    '结果在动画开始前用密码学随机数选出，不是视觉障眼法。',
    '每次结果都附审计记录：随机值、名单哈希和时间戳。',
    '免费、无需注册、无广告、无数量上限；名单不会离开浏览器。',
    '支持全屏、音效与撒花，适合课堂投屏或直播。'
  ],
  stepsTitle: '如何使用是或否转盘',
  steps: [
    '打开转盘工具，清空默认条目，添加「是」和「否」两个选项。',
    '如果希望保留不确定结果，再加一个「也许」条目。',
    '在输入框写下你的问题，让旋转过程中上下文始终可见。',
    '点击旋转（或按空格键）。结果在转盘转动前已由密码学随机数决定。',
    '用于塔罗式提问时，聚焦一个明确的是/否问题，只旋转一次。',
    '如需证明结果是随机的，可复制当次审计记录。'
  ],
  relatedTitle: '更多随机决策工具',
  related: wheelRelatedZh,
  faqTitle: '常见问题',
  faqs: [
    {
      q: '怎么制作一个是或否转盘？',
      a: '打开免费转盘，清空默认条目，添加「是」和「否」两个选项，在上方写下问题，然后点击旋转。转盘会停在其中一扇区并显示结果及审计记录。无需账号，也无需下载。'
    },
    {
      q: '是或否转盘真的随机吗？',
      a: 'OnliTool 在动画开始前用浏览器 Web Crypto API 选出结果，旋转过程只是视觉展示。每次旋转都会记录 32 位随机值、时间戳和选项列表哈希。你可以复制这份记录，作为结果并非手动选定的证据。'
    },
    {
      q: '可以用是或否转盘做塔罗式提问吗？',
      a: '可以。很多人把它当作轻量塔罗提示：写一个能用「是」或「否」回答的清晰问题，专注后旋转一次。它给出的是随机答案而非预测，请把它当作决策辅助，而不是保证。'
    },
    {
      q: '能加一个「也许」选项吗？',
      a: '可以，添加第三个名为「也许」的条目即可。每个条目还能设置权重，因此你可以让「是」和「否」概率相等，或给「也许」一个较小的扇区，只在偶尔出现不确定答案。'
    },
    {
      q: '是或否转盘免费吗，需要注册吗？',
      a: '完全免费，无需账号、无广告、无数量上限。工具在你的浏览器本地运行，页面加载后即使离线也能使用，不会上传任何内容。'
    },
    {
      q: '可以把问题和转盘分享给别人吗？',
      a: '可以。「分享」按钮会复制一条链接，其中选项列表已编码进 URL。在另一台设备打开后会出现同样的转盘，可以直接旋转。问题文本不会存储在服务器上。'
    }
  ],
  footerNote: 'OnliTool 是独立项目，与任何其他转盘或塔罗产品无关联。其他工具名称仅用于对比与识别。'
}

const copy = computed(() => (isZh.value ? zh : en))

useToolSeo({
  type: 'WebPage',
  title: () =>
    isZh.value
      ? '是或否转盘 — 免费在线 Yes or No 决策工具 | OnliTool'
      : 'Yes or No Wheel — Free Random Yes/No Picker | OnliTool',
  description: () => copy.value.lead,
  keywords: () =>
    'yes or no wheel, yes or no wheel tarot, yes or no wheel with question, spin the wheel yes or no, random yes or no picker, free yes or no wheel, 是或否转盘, 随机决策',
  featureList: () => copy.value.bullets,
  faqItems: () => copy.value.faqs.map((item) => ({ q: item.q, a: item.a })),
  dateModified: '2026-11-20',
  translatedLocales: ['en', 'zh'],
  schemaProperties: { isAccessibleForFree: true }
})
</script>

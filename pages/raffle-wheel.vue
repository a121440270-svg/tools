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
  breadcrumbCurrent: 'Raffle Wheel',
  kicker: 'Giveaway · Raffle draw',
  title: 'Raffle Wheel',
  lead: 'A raffle wheel randomly picks a winner from a list of names or ticket numbers, making prize draws transparent for classrooms, offices and live events. OnliTool is free, runs entirely in your browser, needs no sign-up, and shows an audit note with every result so nobody can claim the draw was rigged.',
  updated: 'Last updated: November 20, 2026',
  primaryText: 'Open the free raffle wheel',
  secondaryText: 'Compare other wheels',
  answerTitle: 'What is a raffle wheel?',
  answer: 'A raffle wheel is a random prize-draw tool: paste your entrants or ticket numbers, press Spin, and one name is selected. OnliTool adds an elimination mode so a winner is removed and cannot be drawn twice, plus fullscreen, sound and confetti for a live draw. The winner is chosen with the browser Web Crypto API before the animation, and each spin records a random value and a hash of the entry list you can copy as proof.',
  bullets: [
    'Paste a list of names or ticket numbers — one per line, comma or semicolon.',
    'Elimination mode removes each winner so the same entrant cannot win twice.',
    'Weighted slices let you give extra entries to a name if your raffle allows it.',
    'No entry limit, no account, no ads; the list stays in your browser.',
    'Fullscreen, sound and confetti for projectors, OBS and live streams.',
    'Copy the audit note after each draw as a verifiable record.'
  ],
  stepsTitle: 'How to run a raffle with a wheel',
  steps: [
    'Open the wheel tool and paste your entrants into the bulk list box.',
    'Choose Elimination mode if each person should win at most once.',
    'Enable fullscreen, sound and confetti for an on-screen or streamed draw.',
    'Set a longer spin duration to build suspense, then press Spin.',
    'Copy the audit note shown under the wheel as a record of the result.',
    'Repeat the spin for extra prizes; eliminated names are no longer in the draw.'
  ],
  relatedTitle: 'More random draw tools',
  related: wheelRelatedEn,
  faqTitle: 'Frequently asked questions',
  faqs: [
    {
      q: 'How do I run a free raffle draw online?',
      a: 'Paste your entrant names into the free wheel, press Spin and share the result. There is no sign-up, no ads and no limit on the number of entries. The draw runs in your browser, so you can run it on a laptop connected to a projector or a live-streaming setup without installing anything.'
    },
    {
      q: 'How do I make sure the same person cannot win twice?',
      a: 'Select Elimination mode before spinning. After each draw the winning entry is removed from the wheel, so it cannot be selected again. Use Reset Spin to restore the full list when you want to start a new raffle from scratch.'
    },
    {
      q: 'Is the raffle wheel fair, or can it be rigged?',
      a: 'The winner is chosen with the browser Web Crypto API before the animation plays, so the moving wheel is only a display. Every spin records a random 32-bit value, a timestamp and a hash of the entry list. Copy and share that audit note if attendees want proof that the draw was random.'
    },
    {
      q: 'How many names can I add?',
      a: 'There is no fixed entry limit. You can paste hundreds of names at once using the bulk box, separated by newlines, commas or semicolons. The wheel scales the slice labels down as the list grows so all entries stay visible.'
    },
    {
      q: 'Do I have to upload my entrant list?',
      a: 'No. All processing happens locally in your browser. Your list is kept in local storage on your device and is only encoded into a share link when you explicitly create one. Nothing is sent to a server.'
    },
    {
      q: 'Can I use the raffle wheel on a projector or in OBS?',
      a: 'Yes. The fullscreen button fills the screen for classroom and event projectors. For streams, capture the browser window or use a browser source in OBS or Streamlabs. Sound and confetti can be toggled to match your broadcast.'
    }
  ],
  footerNote: 'Run your own raffle rules and disclose them to participants. OnliTool provides the random selection but is not responsible for how a giveaway is organised.'
}

const zh = {
  breadcrumbLabel: '转盘抽奖工具',
  breadcrumbCurrent: '抽奖转盘',
  kicker: '抽奖 · 随机开奖',
  title: '抽奖转盘',
  lead: '抽奖转盘从姓名或奖券名单中随机抽取获奖者，让课堂、办公室和直播活动的开奖过程公开透明。OnliTool 免费、完全在浏览器中运行、无需注册，并在每次结果后生成审计记录，避免有人质疑抽奖被操控。',
  updated: '最后更新：2026 年 11 月 20 日',
  primaryText: '打开免费抽奖转盘',
  secondaryText: '对比其他转盘',
  answerTitle: '什么是抽奖转盘？',
  answer: '抽奖转盘是一种随机开奖工具：粘贴参与者姓名或奖券编号，点击旋转，就会抽出一位获奖者。OnliTool 提供淘汰模式，抽中后即从转盘中移除，避免重复中奖；同时支持全屏、音效和撒花，适合现场开奖。结果由浏览器 Web Crypto API 在动画前选出，每次旋转都会记录随机值与名单哈希，可复制作为凭证。',
  bullets: [
    '批量粘贴姓名或奖券编号，支持换行、逗号与分号分隔。',
    '淘汰模式会移除已中奖条目，同一人不会重复中奖。',
    '如活动规则允许，可用权重给某个名字增加中奖机会。',
    '无数量上限、无需账号、无广告；名单留在浏览器本地。',
    '支持全屏、音效与撒花，适合投影、OBS 与直播开奖。',
    '每次抽奖后可复制审计记录，作为可核对的结果凭证。'
  ],
  stepsTitle: '如何用转盘进行抽奖',
  steps: [
    '打开转盘工具，把参与者名单粘贴到批量输入框。',
    '如果每人最多中奖一次，先选择「淘汰模式」。',
    '为投屏或直播开启全屏、音效和撒花。',
    '把旋转时长调长一些制造悬念，然后点击旋转。',
    '复制转盘下方显示的审计记录，作为本次开奖的凭证。',
    '追加奖品时继续旋转；已淘汰的名字不会再参与。'
  ],
  relatedTitle: '更多随机抽奖工具',
  related: wheelRelatedZh,
  faqTitle: '常见问题',
  faqs: [
    {
      q: '怎么在线免费抽奖？',
      a: '把参与者名单粘贴到免费转盘，点击旋转后公布结果即可。无需注册、无广告、无人数上限。抽奖在你的浏览器中运行，可以直接用连接投影仪的笔记本或直播设备操作，无需安装软件。'
    },
    {
      q: '如何保证同一个人不会中奖两次？',
      a: '旋转前选择「淘汰模式」。每次开奖后中奖条目会从转盘中移除，因此不会被再次抽中。想重新开始时，点击「重置」即可恢复完整名单。'
    },
    {
      q: '抽奖转盘公平吗，会不会被操控？',
      a: '中奖者在动画播放前由浏览器 Web Crypto API 选出，转动过程只是视觉展示。每次旋转都会记录 32 位随机值、时间戳和名单哈希。如果参与者需要凭证，可复制这份审计记录分享给他们。'
    },
    {
      q: '最多能添加多少个名字？',
      a: '没有固定的数量上限。你可以在批量输入框一次粘贴数百个名字，用换行、逗号或分号分隔。名单变长时，转盘会自动缩小扇区文字，保证所有条目仍然可见。'
    },
    {
      q: '需要上传参与者名单吗？',
      a: '不需要。所有处理都在你的浏览器本地完成，名单保存在本设备。只有当你主动点击分享时，名单才会被编码进链接；任何内容都不会发送到服务器。'
    },
    {
      q: '能在投影仪或 OBS 里用抽奖转盘吗？',
      a: '可以。全屏按钮会让转盘铺满屏幕，适合课堂和活动投影。直播时可在 OBS 或 Streamlabs 中捕获浏览器窗口或添加浏览器源。音效和撒花都可以按需开关。'
    }
  ],
  footerNote: '请自行制定并告知参与者抽奖规则。OnliTool 只提供随机选择，不负责活动的组织方式。'
}

const copy = computed(() => (isZh.value ? zh : en))

useToolSeo({
  type: 'WebPage',
  title: () =>
    isZh.value
      ? '抽奖转盘 — 免费在线随机开奖工具 | OnliTool'
      : 'Raffle Wheel — Free Random Prize Draw Picker | OnliTool',
  description: () => copy.value.lead,
  keywords: () =>
    'raffle wheel, raffle wheel generator, raffle wheel free, raffle spinner online, random raffle picker, free raffle draw tool, 抽奖转盘, 在线抽奖',
  featureList: () => copy.value.bullets,
  faqItems: () => copy.value.faqs.map((item) => ({ q: item.q, a: item.a })),
  dateModified: '2026-11-20',
  translatedLocales: ['en', 'zh'],
  schemaProperties: { isAccessibleForFree: true }
})
</script>

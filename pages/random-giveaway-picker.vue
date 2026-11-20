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
  breadcrumbCurrent: 'Random Giveaway Picker',
  kicker: 'Giveaway · Social winner picker',
  title: 'Random Giveaway Picker',
  lead: 'A random giveaway picker chooses a winner from comments, entries or a name list for Instagram, TikTok, YouTube and other social platforms. OnliTool is free, runs in your browser, needs no sign-up and uses cryptographic randomness with an audit note, so viewers can trust the draw.',
  updated: 'Last updated: November 20, 2026',
  primaryText: 'Open the free giveaway picker',
  secondaryText: 'Compare other wheels',
  answerTitle: 'What is a random giveaway picker?',
  answer: 'A random giveaway picker draws a winner fairly from a list of participants. Paste the usernames or names collected from your comments or form into OnliTool, choose whether repeats are allowed, and spin the wheel on stream. The winner is selected with the browser Web Crypto API before the animation; an audit note records the random value and a hash of the entry list so your audience can verify the result afterwards.',
  bullets: [
    'Works with lists copied from Instagram, TikTok, YouTube, Facebook and X.',
    'No-repeats mode prevents the same entrant winning more than once.',
    'Weights let you honour bonus entries when your giveaway rules allow them.',
    'Fullscreen, sound and confetti make the winner reveal stream-ready.',
    'Free, no sign-up, no ads and no entry limit; nothing is uploaded.',
    'Share link carries the entry list so co-hosts can repeat the same draw.'
  ],
  stepsTitle: 'How to pick a giveaway winner',
  steps: [
    'Collect entrants from comments, a form or your giveaway tool and copy them into a list.',
    'Open the wheel and paste the list into the bulk box, one name per line.',
    'Choose Elimination mode if each person may win only once, or set weights for bonus entries.',
    'Enable fullscreen and confetti, then share your screen or add the browser window to OBS.',
    'Press Spin and read out the winner. The result was already chosen cryptographically.',
    'Copy the audit note to your stream chat or giveaway post as proof.'
  ],
  relatedTitle: 'More giveaway and draw tools',
  related: wheelRelatedEn,
  faqTitle: 'Frequently asked questions',
  faqs: [
    {
      q: 'How do I randomly pick a winner from Instagram comments?',
      a: 'Copy the commenter usernames into a plain list, paste them into the free wheel and press Spin. The tool picks one name at random and shows an audit note you can screenshot. OnliTool does not connect to Instagram accounts, so you stay in control of which entries are included and how duplicates are handled.'
    },
    {
      q: 'Is there a free giveaway picker for TikTok or YouTube?',
      a: 'Yes. The same picker works for TikTok comments, YouTube comment draws, Facebook posts and X replies. It is free, needs no account and shows no ads. Because it runs in your browser, you can use it on stream without uploading your entrant list anywhere.'
    },
    {
      q: 'Can I stop the same person winning twice?',
      a: 'Yes. Select Elimination mode before you spin. Each winner is removed from the wheel, so later prize draws pick only from entrants who have not won. Use Reset Spin when you want to reload the full list for a new giveaway.'
    },
    {
      q: 'Is the giveaway draw fair?',
      a: 'The winner is chosen with the browser Web Crypto API before the wheel animation plays, so the spinning cannot influence the result. Every draw records a random 32-bit value, a timestamp and a hash of the entry list. Copy that audit note and post it with your winner announcement so viewers can check the draw.'
    },
    {
      q: 'Do I need to upload entrant names or emails?',
      a: 'No. Everything runs locally in your browser. Names stay in local storage on your device and are only encoded into a link when you press Share. No entrant data is sent to a server, which makes the tool suitable for handling personal data carefully.'
    },
    {
      q: 'Can I use bonus entries or multiple prizes?',
      a: 'Yes. Give an entrant a higher weight to represent multiple entries, then spin once per prize. With Elimination mode enabled, a winner is removed after each prize so you can draw several distinct winners from the same list.'
    }
  ],
  footerNote: 'Follow the platform rules and disclose your giveaway terms. OnliTool provides the random draw but does not collect entries or verify eligibility.'
}

const zh = {
  breadcrumbLabel: '转盘抽奖工具',
  breadcrumbCurrent: '抽奖获奖者选择器',
  kicker: '抽奖 · 社媒中奖者抽取',
  title: '抽奖获奖者选择器',
  lead: '随机抽奖选择器从评论、报名名单或姓名列表中抽取获奖者，适用于 Instagram、TikTok、YouTube 等社交平台。OnliTool 免费、在浏览器中运行、无需注册，使用密码学随机数并生成审计记录，让观众可以信任开奖过程。',
  updated: '最后更新：2026 年 11 月 20 日',
  primaryText: '打开免费抽奖选择器',
  secondaryText: '对比其他转盘',
  answerTitle: '什么是随机抽奖选择器？',
  answer: '随机抽奖选择器用于从参与者名单中公平抽出获奖者。把从评论或表单收集到的用户名粘贴到 OnliTool，设定是否允许重复中奖，然后在直播中旋转转盘。中奖者在动画开始前由浏览器 Web Crypto API 选出，审计记录会保存随机值和名单哈希，观众可据此核对结果。',
  bullets: [
    '支持粘贴来自 Instagram、TikTok、YouTube、Facebook 和 X 的名单。',
    '不重复模式防止同一参与者多次中奖。',
    '活动规则允许时，可用权重兑现额外抽奖机会。',
    '全屏、音效与撒花让开奖画面适合直播。',
    '免费、无需注册、无广告、无数量上限；不上传任何数据。',
    '分享链接携带名单，方便联合主持复现同一场抽奖。'
  ],
  stepsTitle: '如何抽取抽奖获奖者',
  steps: [
    '从评论、表单或其他工具收集参与者，整理成一份名单。',
    '打开转盘，把名单粘贴到批量输入框，每行一个名字。',
    '每人只限中一次就选择「淘汰模式」；有额外机会则可设置权重。',
    '开启全屏和撒花，然后共享屏幕或把浏览器窗口加入 OBS。',
    '点击旋转并公布获奖者；结果在旋转前已由密码学随机数决定。',
    '把审计记录复制到直播聊天或活动帖子，作为开奖凭证。'
  ],
  relatedTitle: '更多抽奖与开奖工具',
  related: wheelRelatedZh,
  faqTitle: '常见问题',
  faqs: [
    {
      q: '怎么从 Instagram 评论里随机抽获奖者？',
      a: '把评论者用户名整理成名单，粘贴到免费转盘并点击旋转。工具会随机选出一位并生成可截图的审计记录。OnliTool 不连接 Instagram 账号，因此由你决定纳入哪些名单以及如何处理重复评论。'
    },
    {
      q: 'TikTok 或 YouTube 抽奖有免费的选择器吗？',
      a: '有。同一个选择器适用于 TikTok 评论、YouTube 评论开奖、Facebook 帖子和 X 回复。它免费、无需账号、无广告。由于工具在浏览器中运行，你可以直接在直播里使用，无需上传参与者名单。'
    },
    {
      q: '能防止同一个人中奖两次吗？',
      a: '可以。旋转前选择「淘汰模式」，中奖者会从转盘中移除，后续奖品只会从尚未中奖的人里抽取。想重新开始一场活动时，点击「重置」恢复完整名单。'
    },
    {
      q: '抽奖公平吗？',
      a: '中奖者在动画播放前由浏览器 Web Crypto API 选出，因此旋转过程无法影响结果。每次抽取都会记录 32 位随机值、时间戳和名单哈希。你可以复制审计记录并随中奖公告一起发布，方便观众核对。'
    },
    {
      q: '需要上传参与者姓名或邮箱吗？',
      a: '不需要。所有处理都在浏览器本地完成，名单只保存在本设备；只有当你主动点击分享时才会编码进链接。参与者数据不会发送到服务器，适合谨慎处理个人信息。'
    },
    {
      q: '支持额外抽奖机会和多个奖品吗？',
      a: '支持。给某位参与者更高权重即可代表多张奖券，然后每个奖品旋转一次。开启淘汰模式后，中奖者随后会被移除，因此可以从同一名单中抽出多位不同的获奖者。'
    }
  ],
  footerNote: '请遵守平台规则并公开活动条款。OnliTool 只负责随机抽取，不收集参与名单，也不核验参与资格。'
}

const copy = computed(() => (isZh.value ? zh : en))

useToolSeo({
  type: 'WebPage',
  title: () =>
    isZh.value
      ? '抽奖获奖者选择器 — 免费社媒抽奖工具 | OnliTool'
      : 'Random Giveaway Picker — Free Instagram & TikTok Winner Picker | OnliTool',
  description: () => copy.value.lead,
  keywords: () =>
    'random giveaway picker, giveaway picker instagram, giveaway picker tiktok, giveaway picker youtube, random giveaway wheel, free giveaway picker, 抽奖获奖者选择器, 社媒抽奖',
  featureList: () => copy.value.bullets,
  faqItems: () => copy.value.faqs.map((item) => ({ q: item.q, a: item.a })),
  dateModified: '2026-11-20',
  translatedLocales: ['en', 'zh'],
  schemaProperties: { isAccessibleForFree: true }
})
</script>

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
  breadcrumbCurrent: 'Random Name Picker No Repeats',
  kicker: 'Name picker · No repeats',
  title: 'Random Name Picker No Repeats',
  lead: 'A random name picker with no repeats removes each drawn name from the wheel so the same person cannot be picked twice. It is the right tool for classroom roll call, giveaways where each entrant wins once, and fair team draws. OnliTool is free, browser-based, needs no sign-up and shows an audit note for every draw.',
  updated: 'Last updated: November 20, 2026',
  primaryText: 'Open the no-repeats picker',
  secondaryText: 'See all random tools',
  answerTitle: 'What is a no-repeats name picker?',
  answer: 'A no-repeats name picker draws names from a list and removes each winner so it cannot come up again. OnliTool calls this Elimination mode: paste your names, select the mode, and each spin picks from the remaining entries only. The draw uses the browser Web Crypto API before the animation, and an audit note records the random value and a hash of the remaining list so the sequence can be reviewed afterwards.',
  bullets: [
    'Elimination mode removes each name after it is drawn — no duplicate picks.',
    'Paste an entire class or entrant list at once from a spreadsheet or text file.',
    'Reset Spin restores the full list for a new round or a new school day.',
    'Cryptographic random selection with a per-draw audit note you can copy.',
    'Weights are supported if your rules give some entries more than one chance.',
    'Free, no sign-up, no ads, no entry limit; all data stays in your browser.'
  ],
  stepsTitle: 'How to pick names without repeats',
  steps: [
    'Open the wheel tool and paste your names into the bulk list box, one per line.',
    'Choose Elimination mode from the mode dropdown.',
    'Spin the wheel. The winning name is removed from the remaining entries.',
    'Keep spinning until everyone has been called on or every prize is assigned.',
    'Copy the audit note after each draw if you need to document the order.',
    'Press Reset Spin to restore the complete list for the next round.'
  ],
  relatedTitle: 'More random name tools',
  related: wheelRelatedEn,
  faqTitle: 'Frequently asked questions',
  faqs: [
    {
      q: 'How do I pick random names without repeats?',
      a: 'Paste your list into the free wheel, choose Elimination mode and press Spin. Each drawn name is removed from the wheel, so the next spin only picks from names that have not been called yet. When everyone has been picked, use Reset Spin to bring the full list back.'
    },
    {
      q: 'What is the difference between no repeats and normal mode?',
      a: 'In normal mode every name stays on the wheel, so the same person can be drawn many times — useful for giveaways where repeats are allowed. In no-repeats (Elimination) mode each winner is removed, which is the right choice for roll call, turn-taking and one-prize-per-person draws.'
    },
    {
      q: 'Is the random name picker with no repeats fair?',
      a: 'Yes. The next name is selected with the browser Web Crypto API before the wheel animation starts. Every draw records a random value, a timestamp and a hash of the remaining list. You can copy the audit note to show the order was generated randomly rather than chosen by hand.'
    },
    {
      q: 'Can I still use weights when repeats are disabled?',
      a: 'Yes. Weights control the relative chance of each remaining entry, and elimination still removes a name once it wins. This is useful when some participants legitimately hold more than one entry, for example a raffle where extras were earned.'
    },
    {
      q: 'Can I paste a list from Excel or Google Sheets?',
      a: 'Yes. Copy the column and paste it into the bulk box. Names are separated by newlines, commas, semicolons or Chinese commas, so a plain column pastes cleanly. There is no fixed limit on the number of names.'
    },
    {
      q: 'Does the name list get uploaded to a server?',
      a: 'No. The picker runs entirely in your browser and the list is stored in local storage on your device. It is only encoded into a link when you press Share. Nothing is uploaded, so class lists and customer names stay private.'
    }
  ],
  footerNote: 'OnliTool is an independent project and is not affiliated with any other name-picker product. Other tool names appear only for comparison.'
}

const zh = {
  breadcrumbLabel: '转盘抽奖工具',
  breadcrumbCurrent: '随机点名（不重复）',
  kicker: '随机点名 · 不重复',
  title: '随机点名（不重复）',
  lead: '随机点名不重复工具会在抽中后把名字从转盘中移除，确保同一人不会被点到第二次。它适合课堂点名、每人仅限一次中奖的抽奖以及公平分组。OnliTool 免费、在浏览器中运行、无需注册，并为每次抽取生成审计记录。',
  updated: '最后更新：2026 年 11 月 20 日',
  primaryText: '打开不重复点名工具',
  secondaryText: '查看全部随机工具',
  answerTitle: '什么是不重复随机点名？',
  answer: '不重复随机点名会从名单中抽取姓名，并在抽中后将其移除，避免再次出现。OnliTool 把这种模式称为「淘汰模式」：粘贴名单、选择该模式，每次旋转只会从剩余条目中抽取。结果由浏览器 Web Crypto API 在动画前选出，审计记录会保存随机值和剩余名单哈希，便于事后核对顺序。',
  bullets: [
    '淘汰模式在抽中后移除姓名，不会重复点同一个人。',
    '可从表格或文本一次粘贴整份名单。',
    '「重置」可恢复完整名单，开启新一轮或新一天的点名。',
    '密码学随机选择，每次抽取都有可复制的审计记录。',
    '如规则允许，某些条目可设置权重获得更多机会。',
    '免费、无需注册、无广告、无数量上限；数据留在浏览器本地。'
  ],
  stepsTitle: '如何随机点名且不重复',
  steps: [
    '打开转盘工具，把名单粘贴到批量输入框，每行一个名字。',
    '在模式下拉框中选择「淘汰模式」。',
    '旋转转盘，抽中的名字会从剩余条目中移除。',
    '持续旋转，直到所有人都被点到或奖品分配完毕。',
    '如需记录顺序，每次抽取后复制审计记录。',
    '点击「重置」恢复完整名单，供下一轮使用。'
  ],
  relatedTitle: '更多随机点名工具',
  related: wheelRelatedZh,
  faqTitle: '常见问题',
  faqs: [
    {
      q: '如何随机点名且不重复？',
      a: '把名单粘贴到免费转盘，选择「淘汰模式」后点击旋转。抽中的名字会从转盘中移除，下一次只会从未被点到的名字里抽取。全部点完后，点击「重置」即可恢复完整名单。'
    },
    {
      q: '不重复模式和普通模式有什么区别？',
      a: '普通模式下所有名字都留在转盘里，同一个人可能被多次抽中，适合允许重复中奖的活动。不重复（淘汰）模式会在抽中后移除名字，适合课堂点名、轮流发言和每人限中一次的抽奖。'
    },
    {
      q: '不重复随机点名公平吗？',
      a: '公平。下一个名字在动画开始前由浏览器 Web Crypto API 选出。每次抽取都记录随机值、时间戳和剩余名单哈希。你可以复制审计记录，证明顺序是随机生成而非人工指定。'
    },
    {
      q: '禁用重复后还能设置权重吗？',
      a: '可以。权重决定每个剩余条目的相对概率，淘汰逻辑仍然生效：条目一旦中奖就会被移除。适合某些参与者本来就有多张奖券的情况。'
    },
    {
      q: '能从 Excel 或 Google Sheets 粘贴名单吗？',
      a: '可以。复制整列并粘贴到批量输入框即可。姓名支持换行、逗号、分号或中文逗号分隔，直接粘贴一整列就能正确识别，且没有固定的数量上限。'
    },
    {
      q: '名单会上传到服务器吗？',
      a: '不会。点名工具完全在浏览器本地运行，名单保存在本设备。只有当你主动点击分享时，名单才会编码进链接；任何内容都不会上传，班级名单和客户信息都能保持私密。'
    }
  ],
  footerNote: 'OnliTool 是独立项目，与任何其他点名工具无关联。其他工具名称仅用于对比。'
}

const copy = computed(() => (isZh.value ? zh : en))

useToolSeo({
  type: 'WebPage',
  title: () =>
    isZh.value
      ? '随机点名（不重复）— 免费在线姓名抽取工具 | OnliTool'
      : 'Random Name Picker No Repeats — Free Picker | OnliTool',
  description: () => copy.value.lead,
  keywords: () =>
    'random name picker no repeats, random picker no repeats, random name generator no repeats, no repeat name picker, random name selector without repeats, 随机点名不重复, 随机点名器',
  featureList: () => copy.value.bullets,
  faqItems: () => copy.value.faqs.map((item) => ({ q: item.q, a: item.a })),
  dateModified: '2026-11-20',
  translatedLocales: ['en', 'zh'],
  schemaProperties: { isAccessibleForFree: true }
})
</script>

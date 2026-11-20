// Shared sibling cross-links for the wheel decision landing pages.
// Keeping this in one place means every page gets the same internal-link cluster.

export interface WheelRelatedLink {
  to: string
  title: string
  text: string
}

export const wheelRelatedEn: WheelRelatedLink[] = [
  {
    to: '/spin-the-wheel',
    title: 'Spin the Wheel',
    text: 'The main free picker with weights, no-repeats mode and an audit note for every spin.'
  },
  {
    to: '/yes-or-no-wheel',
    title: 'Yes or No Wheel',
    text: 'A two-sided spinner for binary decisions and tarot-style yes/no questions.'
  },
  {
    to: '/raffle-wheel',
    title: 'Raffle Wheel',
    text: 'Run a fair prize draw from a list of names or ticket numbers.'
  },
  {
    to: '/random-name-picker-no-repeats',
    title: 'Random Name Picker No Repeats',
    text: 'Draw names without picking the same person twice.'
  },
  {
    to: '/random-giveaway-picker',
    title: 'Random Giveaway Picker',
    text: 'Pick winners from Instagram, TikTok, YouTube and other social entries.'
  },
  {
    to: '/alternatives/wheel-of-names',
    title: 'Wheel of Names Alternative',
    text: 'An honest comparison of free wheel spinners, including privacy and audit features.'
  }
]

export const wheelRelatedZh: WheelRelatedLink[] = [
  {
    to: '/spin-the-wheel',
    title: '转盘抽奖工具',
    text: '主工具页：支持权重、不重复模式，每次旋转都有可审计记录。'
  },
  {
    to: '/yes-or-no-wheel',
    title: '是或否转盘',
    text: '用于二选一决策与塔罗式是/否提问的双面转盘。'
  },
  {
    to: '/raffle-wheel',
    title: '抽奖转盘',
    text: '从姓名或奖券名单中公平抽取获奖者。'
  },
  {
    to: '/random-name-picker-no-repeats',
    title: '随机点名（不重复）',
    text: '抽取姓名且同一人不会被抽中两次。'
  },
  {
    to: '/random-giveaway-picker',
    title: '抽奖获奖者选择器',
    text: '从 Instagram、TikTok、YouTube 等平台名单中抽取获奖者。'
  },
  {
    to: '/alternatives/wheel-of-names',
    title: 'Wheel of Names 替代方案',
    text: '客观对比免费转盘工具在隐私与可审计性上的差异。'
  }
]

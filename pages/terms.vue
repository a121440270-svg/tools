<template>
  <LegalPage
    :kicker="copy.kicker"
    :title="copy.title"
    :updated="copy.updated"
    :intro="copy.intro"
    :sections="copy.sections"
    :contact-heading="copy.contactHeading"
    :contact-text="copy.contactText"
    :contact-page-label="copy.contactPageLabel"
    :contact-page-href="localePath('/contact')"
    :email="email"
    :toc-label="copy.tocLabel"
    :reading-label="copy.readingLabel"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const isZh = computed(() => locale.value === 'zh')
const email = 'huiqinliu1005@gmail.com'

const en = {
  kicker: 'Legal · Terms',
  title: 'Terms of Service',
  updated: 'Last updated: 2 November 2026',
  tocLabel: 'On this page',
  readingLabel: 'min read',
  contactPageLabel: 'Contact page',
  intro:
    'These terms govern your use of https://onlitools.com and its tools, blog and prompt library. By accessing the site you agree to these terms. If you do not agree, please do not use the site.',
  sections: [
    {
      heading: 'The service',
      paragraphs: [
        'OnliTool provides free browser-based utilities for images, fonts, text, JSON, dates, IDs and AI media, together with technical articles and a prompt library. Most tools run locally in your browser; some features require an account or a network request to a third-party API.',
        'We may add, change or remove features at any time. We aim to keep the site available but do not guarantee uninterrupted access.',
      ],
    },
    {
      heading: 'Acceptable use',
      paragraphs: ['You agree not to:'],
      items: [
        'use the site for unlawful, harmful, fraudulent or abusive purposes;',
        'upload or share content that infringes copyright, trade secrets, privacy or other rights;',
        'upload malware or attempt to gain unauthorised access to the service, other accounts or our infrastructure;',
        'scrape, overload or automate requests in a way that degrades the service for others;',
        'use the tools to generate content that sexualises minors, incites violence, harasses people or violates applicable law.',
      ],
    },
    {
      heading: 'Your content',
      paragraphs: [
        'You keep ownership of the text, images, prompts and notes you submit. By publishing content to a public area (for example the prompt library, shared notes or comments) you grant us a non-exclusive, worldwide licence to store, display and distribute that content for the purpose of operating the site.',
        'You are responsible for the content you submit and for having the rights needed to submit it. We may remove content that violates these terms or applicable law, and may suspend accounts that repeatedly do so.',
      ],
      callout: 'You keep ownership of the content you submit.',
    },
    {
      heading: 'Intellectual property',
      paragraphs: [
        'The site design, source code, written guides and original articles are owned by OnliTool or its licensors and are protected by copyright. You may not republish substantial parts without written permission. Short quotations with a link back to the original page are welcome.',
      ],
    },
    {
      heading: 'Third-party links and services',
      paragraphs: [
        'The site links to and integrates third-party services such as Google AdSense, Google Analytics, OpenStreetMap, Cloudflare and Creem. We are not responsible for their content or practices. Your use of those services is governed by their own terms.',
      ],
    },
    {
      heading: 'Disclaimer',
      paragraphs: [
        'The tools and articles are provided "as is" and "as available" without warranties of any kind, express or implied, including fitness for a particular purpose. Always keep a backup of important files and verify results before relying on them. For example, compressed images, converted fonts and generated IDs should be checked before production or official use.',
      ],
    },
    {
      heading: 'Limitation of liability',
      paragraphs: [
        'To the maximum extent permitted by law, OnliTool and its operator are not liable for indirect, incidental, special, consequential or punitive damages, or for loss of data, profits or goodwill, arising from your use of the site. Where liability cannot be excluded, it is limited to the amount you paid us in the previous twelve months, which for free tools is zero.',
      ],
    },
    {
      heading: 'Donations and paid features',
      paragraphs: [
        'Optional donations are processed by Creem and are non-refundable except where required by law. Paid features, if offered, are described at the point of purchase and may be subject to additional terms.',
      ],
    },
    {
      heading: 'Privacy',
      paragraphs: [
        'Our handling of personal data is described in the Privacy Policy, which forms part of these terms.',
      ],
    },
    {
      heading: 'Changes and termination',
      paragraphs: [
        'We may update these terms by posting a new version on this page. Material changes take effect when posted. We may suspend or terminate access for violations of these terms. You may stop using the site at any time.',
      ],
    },
    {
      heading: 'Governing law',
      paragraphs: [
        'These terms are governed by the laws of the operator’s place of establishment, without regard to conflict-of-law rules. Mandatory consumer protection rules in your country of residence continue to apply.',
      ],
    },
  ],
  contactHeading: 'Contact',
  contactText: 'Questions about these terms? Email us at',
}

const zh = {
  kicker: '法律 · 条款',
  title: '服务条款',
  updated: '最后更新：2026 年 11 月 2 日',
  tocLabel: '本页内容',
  readingLabel: '分钟阅读',
  contactPageLabel: '联系页面',
  intro:
    '本条款适用于你使用 https://onlitools.com 及其工具、博客和提示词库。访问本站即表示你同意本条款；如不同意，请停止使用。',
  sections: [
    {
      heading: '服务内容',
      paragraphs: [
        'OnliTool 提供免费的浏览器端工具，涵盖图片、字体、文本、JSON、日期、证件照和 AI 媒体，并提供技术文章与提示词库。大部分工具在浏览器本地运行；部分功能需要账户或调用第三方 API。',
        '我们可能随时新增、修改或下线功能。我们会尽力保持服务可用，但不保证不中断。',
      ],
    },
    {
      heading: '使用规范',
      paragraphs: ['你同意不进行以下行为：'],
      items: [
        '将本站用于违法、有害、欺诈或滥用目的；',
        '上传或分享侵犯著作权、商业秘密、隐私或其他权利的内容；',
        '上传恶意软件，或试图未经授权访问服务、他人账户或我们的基础设施；',
        '以影响他人使用的方式抓取、压测或自动化请求；',
        '使用工具生成涉及未成年人的性内容、煽动暴力、骚扰他人或违反适用法律的内容。',
      ],
    },
    {
      heading: '你的内容',
      paragraphs: [
        '你保留所提交文本、图片、提示词和笔记的所有权。当你将内容发布到公开区域（如提示词库、分享笔记或评论）时，你授予我们非独占、全球范围的许可，以便为运营本站而存储、展示和分发该内容。',
        '你对提交的内容负责，并应确保拥有提交所需的权利。我们可能删除违反本条款或法律的内容，并可能封禁多次违规的账户。',
      ],
      callout: '你提交的内容，所有权始终归你。',
    },
    {
      heading: '知识产权',
      paragraphs: [
        '本站设计、源代码、指南和原创文章归 OnliTool 或其许可方所有，受著作权法保护。未经书面许可，不得大量转载。欢迎附带原文链接的简短引用。',
      ],
    },
    {
      heading: '第三方链接与服务',
      paragraphs: [
        '本站链接并集成 Google AdSense、Google Analytics、OpenStreetMap、Cloudflare、Creem 等第三方服务。我们不对其内容或做法负责，你使用这些服务需遵守其自身条款。',
      ],
    },
    {
      heading: '免责声明',
      paragraphs: [
        '工具和文章按“现状”及“可用”状态提供，不作任何明示或默示担保，包括特定用途适用性。请始终备份重要文件并在依赖结果前自行核验，例如压缩图片、转换字体和生成证件照应在生产或正式使用前检查。',
      ],
    },
    {
      heading: '责任限制',
      paragraphs: [
        '在法律允许的最大范围内，OnliTool 及其运营者不对因使用本站产生的间接、附带、特殊、后果性或惩罚性损害，或数据、利润、商誉损失承担责任。若责任无法排除，则限于你过去十二个月向我们支付的金额（免费工具即为零）。',
      ],
    },
    {
      heading: '赞助与付费功能',
      paragraphs: [
        '可选赞助由 Creem 处理，除法律要求外不予退款。如提供付费功能，将在购买时说明，并可能适用附加条款。',
      ],
    },
    {
      heading: '隐私',
      paragraphs: ['我们对个人数据的处理见《隐私政策》，该政策构成本条款的一部分。'],
    },
    {
      heading: '条款变更与终止',
      paragraphs: [
        '我们可能在本页发布新版条款。重要变更自发布时生效。如违反本条款，我们可能暂停或终止访问。你可以随时停止使用本站。',
      ],
    },
    {
      heading: '适用法律',
      paragraphs: [
        '本条款适用运营者设立地法律，不考虑冲突法规则。你所在国家/地区的强制性消费者保护规定仍然适用。',
      ],
    },
  ],
  contactHeading: '联系我们',
  contactText: '如对本条款有疑问，请发送邮件至',
}

const copy = computed(() => (isZh.value ? zh : en))

useSeoMeta({
  title: () => `${copy.value.title} - OnliTool`,
  description: () =>
    isZh.value
      ? 'OnliTool 服务条款：服务内容、使用规范、内容权利、免责声明与责任限制。'
      : 'OnliTool terms of service: acceptable use, content ownership, disclaimers and limitation of liability.',
  robots: 'index, follow',
})
</script>

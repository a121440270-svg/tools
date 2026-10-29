<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

navigateTo('/case-converter', { replace: true })

const { t } = useI18n()
useToolSeo({
  title: computed(() => t('caseTool.title') || 'Text Case Converter'),
  description: computed(() => t('caseTool.description') || 'Convert text between uppercase, lowercase, title case, sentence case, camelCase, snake_case, kebab-case, and other case styles in one tool.'),
  keywords: computed(() => 'text case converter, case converter, uppercase converter, lowercase converter, title case, sentence case, camelCase, snake_case, kebab-case, online text tools'),
  type: 'WebApplication',
  applicationCategory: 'UtilitiesApplication'
})
const inputText = ref('')
const transformType = ref('uppercase')

const outputText = computed(() => {
  const text = inputText.value
  switch (transformType.value) {
    case 'uppercase':
      return text.toUpperCase()
    case 'lowercase':
      return text.toLowerCase()
    case 'capitalize':
      return text.replace(/\b\w/g, (char) => char.toUpperCase())
    case 'title':
      return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
    case 'sentence':
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (char) => char.toUpperCase())
    case 'alternating':
      return text.split('').map((char, i) => (i % 2 === 0 ? char.toLowerCase() : char.toUpperCase())).join('')
    case 'inverse':
      return text.split('').map((char) => (char === char.toUpperCase() && char !== char.toLowerCase()) ? char.toLowerCase() : (char === char.toLowerCase() && char !== char.toUpperCase()) ? char.toUpperCase() : char).join('')
    case 'camel':
      return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, '')
    case 'pascal':
      return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, '')
    case 'snake':
      return text.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase()
    case 'kebab':
      return text.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase()
    default:
      return text
  }
})

const actions = computed(() => [
  { key: 'uppercase', label: 'UPPERCASE' },
  { key: 'lowercase', label: 'lowercase' },
  { key: 'capitalize', label: 'Capitalize Words' },
  { key: 'title', label: 'Title Case' },
  { key: 'sentence', label: 'Sentence case' },
  { key: 'alternating', label: 'aLtErNaTiNg' },
  { key: 'inverse', label: 'InVeRsE' },
  { key: 'camel', label: 'camelCase' },
  { key: 'pascal', label: 'PascalCase' },
  { key: 'snake', label: 'snake_case' },
  { key: 'kebab', label: 'kebab-case' }
])

const apply = (type) => {
  transformType.value = type
}

const copyResult = async () => {
  if (!outputText.value) return
  try {
    await navigator.clipboard.writeText(outputText.value)
    ElMessage.success(t('caseTool.copied') || t('common.copySuccess') || 'Copied successfully')
  } catch (err) {
    console.error('Copy failed', err)
    ElMessage.error(t('caseTool.copyError') || t('common.copyFailed') || 'Copy failed')
  }
}

const clearAll = () => {
  inputText.value = ''
}
</script>
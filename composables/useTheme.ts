import { ref, watch, onMounted } from 'vue'

type Theme = 'light' | 'dark'

export const useTheme = () => {
  const theme = ref<'light' | 'dark'>('dark') // 修改默认值为dark

  // 初始化主题
  onMounted(() => {
    // 检查本地存储的主题设置
    const savedTheme = localStorage.getItem('theme') as Theme | null

    // 检查系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    // 优先使用用户保存的主题，否则使用系统主题
    if (savedTheme) {
      theme.value = savedTheme
    } else if (prefersDark) {
      theme.value = 'dark'
    }

    // 应用主题
    applyTheme(theme.value)
  })

  // 监听主题变化并保存到本地存储
  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  })

  // 应用主题到文档
  const applyTheme = (currentTheme: Theme) => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    theme,
    toggleTheme,
    isDark: () => theme.value === 'dark',
    isLight: () => theme.value === 'light'
  }
}

import { ref } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'pe.theme'
const theme = ref<Theme>('light')

function apply(value: Theme) {
  theme.value = value
  document.documentElement.classList.toggle('dark', value === 'dark')
  localStorage.setItem(STORAGE_KEY, value)
}

export function initTheme() {
  const themeSaved = localStorage.getItem(STORAGE_KEY) as Theme | null
  apply(themeSaved ?? 'light')
}

export function useTheme() {
  return {
    theme,
    toggle: () => apply(theme.value === 'dark' ? 'light' : 'dark'),
  }
}

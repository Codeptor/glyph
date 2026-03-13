import { useEffect } from 'react'
import { useStore } from '@/store/useStore'

const THEME_KEY = 'glyph-theme'
const THEME_COLORS = { dark: '#000000', light: '#f5f5f5' }

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved: 'dark' | 'light') {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(resolved)

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLORS[resolved])
}

export function useThemeEffect() {
  const themeMode = useStore((s) => s.themeMode)

  useEffect(() => {
    const resolved = themeMode === 'system' ? getSystemTheme() : themeMode
    applyTheme(resolved)
    localStorage.setItem(THEME_KEY, themeMode)

    if (themeMode !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme(getSystemTheme())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [themeMode])
}

export function loadPersistedTheme(): 'dark' | 'light' | 'system' {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'dark' || stored === 'light' || stored === 'system') return stored
  return 'system'
}

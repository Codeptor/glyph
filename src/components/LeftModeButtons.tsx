import { useStore } from '@/store/useStore'
import type { LeftPanel } from '@/types'

const PANELS: { value: LeftPanel; label: string }[] = [
  { value: 'library', label: 'Library' },
  { value: 'templates', label: 'Templates' },
  { value: 'creations', label: 'Creations' },
]

export function LeftModeButtons() {
  const leftPanel = useStore((s) => s.leftPanel)
  const setLeftPanel = useStore((s) => s.setLeftPanel)
  const themeMode = useStore((s) => s.themeMode)
  const setThemeMode = useStore((s) => s.setThemeMode)

  return (
    <div className="left-mode-buttons">
      {PANELS.map((p) => (
        <button
          key={p.value}
          className={`left-mode-button${leftPanel === p.value ? ' is-active' : ''}`}
          onClick={() => setLeftPanel(p.value)}
        >
          {p.label}
        </button>
      ))}
      <button
        className="left-mode-theme-toggle"
        onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
        title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
      >
        {themeMode === 'dark' ? '\u2600' : '\u263E'}
      </button>
    </div>
  )
}

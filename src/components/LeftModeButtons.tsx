import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import type { LeftPanel } from '@/types'

const PANELS: { value: NonNullable<LeftPanel>; label: string }[] = [
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
    <div className="absolute top-3 left-3 z-10 flex items-center gap-1">
      {PANELS.map((p) => (
        <Button
          key={p.value}
          variant={leftPanel === p.value ? 'default' : 'ghost'}
          size="xs"
          className="text-[10px] uppercase tracking-wider cursor-crosshair"
          onClick={() => setLeftPanel(leftPanel === p.value ? null : p.value)}
        >
          {p.label}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="xs"
        className="cursor-crosshair"
        onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
        title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
      >
        {themeMode === 'dark' ? '\u2600' : '\u263E'}
      </Button>
    </div>
  )
}

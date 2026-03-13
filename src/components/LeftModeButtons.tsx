import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Monitor } from 'lucide-react'
import type { LeftPanel, ThemeMode } from '@/types'

const PANELS: { value: NonNullable<LeftPanel>; label: string }[] = [
  { value: 'library', label: 'Library' },
  { value: 'templates', label: 'Templates' },
  { value: 'creations', label: 'Creations' },
]

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function LeftModeButtons() {
  const leftPanel = useStore((s) => s.leftPanel)
  const setLeftPanel = useStore((s) => s.setLeftPanel)
  const themeMode = useStore((s) => s.themeMode)
  const setThemeMode = useStore((s) => s.setThemeMode)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const ActiveIcon = THEME_OPTIONS.find((o) => o.value === themeMode)?.icon ?? Monitor

  return (
    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
      <img src="/favicon.svg" alt="Glyph" className="w-5 h-5 rounded select-none mr-0.5" draggable={false} />
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

      <div className="relative" ref={menuRef}>
        <Button
          variant="ghost"
          size="xs"
          className="cursor-crosshair"
          onClick={() => setOpen(!open)}
          title="Theme"
        >
          <ActiveIcon className="h-3.5 w-3.5" />
        </Button>

        {open && (
          <div className="absolute top-full left-0 mt-1 rounded-md border border-border bg-popover p-1 shadow-md min-w-[120px]">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs cursor-crosshair transition-colors ${
                  themeMode === opt.value
                    ? 'bg-accent text-accent-foreground'
                    : 'text-popover-foreground hover:bg-muted'
                }`}
                onClick={() => { setThemeMode(opt.value); setOpen(false) }}
              >
                <opt.icon className="h-3.5 w-3.5" />
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

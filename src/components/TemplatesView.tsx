import { useStore } from '@/store/useStore'
import { DEFAULT_TEMPLATES } from '@/lib/templates'
import type { TemplateAsset } from '@/types'

export function TemplatesView() {
  const updateActiveLayer = useStore((s) => s.updateActiveLayer)

  const handleApply = (template: TemplateAsset) => {
    updateActiveLayer(template.preset)
  }

  const getIcon = (artStyle?: string) => {
    switch (artStyle) {
      case 'classic': return 'A'
      case 'braille': return '\u283F'
      case 'halftone': return '\u25CF'
      case 'line': return '/'
      case 'particles': return '\u00B7'
      case 'claude-code': return '>'
      case 'retro': return '\u2593'
      case 'terminal': return '$'
      default: return '#'
    }
  }

  return (
    <div className="absolute top-12 left-3 z-20 w-72 rounded-md border border-border bg-background/95 backdrop-blur-sm shadow-lg">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Templates ({DEFAULT_TEMPLATES.length})
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1 p-2 max-h-80 overflow-y-auto">
        {DEFAULT_TEMPLATES.map((tpl) => (
          <div
            key={tpl.id}
            className="cursor-crosshair rounded-sm border border-border hover:border-[var(--accent)] transition-colors overflow-hidden"
            onClick={() => handleApply(tpl)}
          >
            <div className="aspect-square flex items-center justify-center bg-[var(--bg-surface)] text-xl text-muted-foreground">
              {getIcon(tpl.preset.artStyle)}
            </div>
            <div className="text-[8px] text-muted-foreground truncate px-1 py-0.5">
              {tpl.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

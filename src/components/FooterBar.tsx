import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'

interface Props {
  onExport: () => void
  onPresets: () => void
}

export function FooterBar({ onExport, onPresets }: Props) {
  const layers = useStore((s) => s.layers)
  const activeLayerIndex = useStore((s) => s.activeLayerIndex)
  const aspectRatio = useStore((s) => s.aspectRatio)
  const backgroundColor = useStore((s) => s.backgroundColor)
  const randomizeActiveLayer = useStore((s) => s.randomizeActiveLayer)

  const layer = layers[activeLayerIndex]
  if (!layer) return null

  const items = [
    { label: 'STYLE', value: layer.artStyle.toUpperCase().replace('-', ' ') },
    { label: 'FONT', value: layer.font.toUpperCase() },
    { label: 'AR', value: aspectRatio === 'original' ? 'SRC' : aspectRatio },
    { label: 'FX', value: layer.fxPreset === 'none' ? '—' : layer.fxPreset.toUpperCase().replace('-', ' ') },
    { label: 'BG', value: backgroundColor },
  ]

  return (
    <div className="flex flex-col gap-1.5 border-t border-border px-3 py-2.5">
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {items.map((item) => (
          <span key={item.label} className="text-[9px] font-mono whitespace-nowrap">
            <span className="text-muted-foreground/40">{item.label}</span>{' '}
            <span className="text-muted-foreground/80">{item.value}</span>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="xs"
          className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-crosshair"
          onClick={onPresets}
        >
          Presets
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-crosshair"
          onClick={randomizeActiveLayer}
        >
          Random
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-crosshair"
          onClick={onExport}
        >
          Export
        </Button>
      </div>
    </div>
  )
}

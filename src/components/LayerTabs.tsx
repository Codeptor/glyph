import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function LayerTabs() {
  const layers = useStore((s) => s.layers)
  const activeLayerIndex = useStore((s) => s.activeLayerIndex)
  const setActiveLayerIndex = useStore((s) => s.setActiveLayerIndex)
  const addLayer = useStore((s) => s.addLayer)
  const removeLayer = useStore((s) => s.removeLayer)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Layer
        </Label>
        {layers.length > 1 && (
          <button
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors cursor-crosshair bg-transparent border-none"
            onClick={() => removeLayer(activeLayerIndex)}
          >
            Remove
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {layers.map((layer, i) => (
          <Button
            key={layer.id}
            variant={i === activeLayerIndex ? 'default' : 'outline'}
            size="xs"
            className="cursor-crosshair"
            onClick={() => setActiveLayerIndex(i)}
          >
            {layer.name}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="xs"
          className="text-muted-foreground hover:text-foreground cursor-crosshair"
          onClick={addLayer}
        >
          + Add Layer
        </Button>
      </div>
    </div>
  )
}

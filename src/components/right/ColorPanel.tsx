import { useStore } from '@/store/useStore'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import type { ColorMode } from '@/types'

const COLOR_MODES: { value: ColorMode; label: string }[] = [
  { value: 'grayscale', label: 'Grayscale' },
  { value: 'fullcolor', label: 'Full Color' },
  { value: 'matrix', label: 'Matrix' },
  { value: 'amber', label: 'Amber' },
  { value: 'sepia', label: 'Sepia' },
  { value: 'cool-blue', label: 'Cool Blue' },
  { value: 'neon', label: 'Neon' },
  { value: 'custom', label: 'Custom' },
]

export function ColorPanel() {
  const layers = useStore((s) => s.layers)
  const activeLayerIndex = useStore((s) => s.activeLayerIndex)
  const update = useStore((s) => s.updateActiveLayer)

  const layer = layers[activeLayerIndex]
  if (!layer) return null

  return (
    <CollapsibleSection title="Color">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Color Mode</Label>
          <div className="flex items-center gap-2">
            <Checkbox
              id="invertColor"
              checked={layer.invertColor}
              onCheckedChange={(checked) => update({ invertColor: checked === true })}
              className="cursor-crosshair"
            />
            <label htmlFor="invertColor" className="text-[10px] uppercase tracking-wider text-muted-foreground cursor-crosshair">
              Invert
            </label>
          </div>
        </div>
        <ToggleGroup
          type="single"
          value={layer.colorMode}
          onValueChange={(v) => { if (v) update({ colorMode: v as ColorMode }) }}
          variant="outline"
          size="sm"
          className="flex flex-wrap gap-1"
        >
          {COLOR_MODES.map((cm) => (
            <ToggleGroupItem key={cm.value} value={cm.value} className="text-[10px] h-6 px-2 cursor-crosshair">
              {cm.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {layer.colorMode === 'custom' && (
          <input
            type="color"
            value={layer.customColor}
            onChange={(e) => update({ customColor: e.target.value })}
            className="h-7 w-full rounded-md border border-input cursor-crosshair"
          />
        )}
      </div>
    </CollapsibleSection>
  )
}

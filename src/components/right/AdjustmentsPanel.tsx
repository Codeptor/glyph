import { useStore } from '@/store/useStore'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { SliderField } from '@/components/SliderField'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { fmtPx, fmtMul, fmtInt } from '@/lib/format'
import type { MouseInteraction } from '@/types'

const MOUSE_INTERACTIONS: MouseInteraction[] = ['attract', 'push']

export function AdjustmentsPanel() {
  const layers = useStore((s) => s.layers)
  const activeLayerIndex = useStore((s) => s.activeLayerIndex)
  const update = useStore((s) => s.updateActiveLayer)

  const layer = layers[activeLayerIndex]
  if (!layer) return null

  return (
    <CollapsibleSection title="Adjustments">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <SliderField label="Brightness" value={layer.brightness} min={-1} max={1} onChange={(v) => update({ brightness: v })} />
          <SliderField label="Spacing" value={layer.characterSpacing} min={0.5} max={3} onChange={(v) => update({ characterSpacing: v })} formatValue={fmtMul} />
          <SliderField label="Vignette" value={layer.vignette} min={0} max={1} onChange={(v) => update({ vignette: v })} />
        </div>
        <div className="space-y-3">
          <SliderField label="Contrast" value={layer.contrast} min={0} max={3} onChange={(v) => update({ contrast: v })} />
          <SliderField label="Font Size" value={layer.fontSize} min={4} max={24} step={1} onChange={(v) => update({ fontSize: Math.round(v) })} formatValue={fmtPx} />
          <SliderField label="Border Glow" value={layer.borderGlow} min={0} max={1} onChange={(v) => update({ borderGlow: v })} />
        </div>
      </div>
      <SliderField label="Opacity" value={layer.opacity} min={0} max={1} onChange={(v) => update({ opacity: v })} />

      <Separator />

      {/* MOUSE INTERACTION */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Mouse Interaction</Label>
        <ToggleGroup
          type="single"
          value={layer.mouseInteraction}
          onValueChange={(v) => { if (v) update({ mouseInteraction: v as MouseInteraction }) }}
          variant="outline"
          size="sm"
        >
          {MOUSE_INTERACTIONS.map((mi) => (
            <ToggleGroupItem key={mi} value={mi} className="text-[10px] h-6 px-3 cursor-crosshair">
              {mi.charAt(0).toUpperCase() + mi.slice(1)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <SliderField label="Hover Strength" value={layer.hoverStrength} min={1} max={60} step={1} onChange={(v) => update({ hoverStrength: v })} formatValue={fmtInt} />
        <SliderField label="Area Size" value={layer.mouseAreaSize} min={20} max={500} step={1} onChange={(v) => update({ mouseAreaSize: v })} formatValue={fmtPx} />
        <SliderField label="Spread" value={layer.mouseSpread} min={0.1} max={5} onChange={(v) => update({ mouseSpread: v })} formatValue={fmtMul} />
      </div>
    </CollapsibleSection>
  )
}

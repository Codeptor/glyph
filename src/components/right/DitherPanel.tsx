import { useStore } from '@/store/useStore'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SliderField } from '@/components/SliderField'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import type { DitherAlgorithm } from '@/types'

const DITHER_ALGORITHMS: { value: DitherAlgorithm; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'floyd-steinberg', label: 'Floyd-Steinberg' },
  { value: 'bayer', label: 'Bayer (Ordered)' },
  { value: 'atkinson', label: 'Atkinson' },
  { value: 'jarvis-judice-ninke', label: 'Jarvis-Judice-Ninke' },
  { value: 'stucki', label: 'Stucki' },
  { value: 'sierra', label: 'Sierra' },
  { value: 'sierra-lite', label: 'Sierra Lite' },
]

export function DitherPanel() {
  const layers = useStore((s) => s.layers)
  const activeLayerIndex = useStore((s) => s.activeLayerIndex)
  const update = useStore((s) => s.updateActiveLayer)

  const layer = layers[activeLayerIndex]
  if (!layer) return null

  return (
    <CollapsibleSection title="Dither">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground shrink-0">Dither</Label>
        <Select
          value={layer.ditherAlgorithm}
          onValueChange={(v) => update({ ditherAlgorithm: v as DitherAlgorithm })}
        >
          <SelectTrigger size="sm" className="h-7 text-xs flex-1 cursor-crosshair">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DITHER_ALGORITHMS.map((d) => (
              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <SliderField label="Dither Str" value={layer.ditherStrength} min={0} max={1} onChange={(v) => update({ ditherStrength: v })} />
      <SliderField label="BG Dither" value={layer.bgDither} min={0} max={1} onChange={(v) => update({ bgDither: v })} />
      <SliderField label="Inv Dither" value={layer.inverseDither} min={0} max={1} onChange={(v) => update({ inverseDither: v })} />
    </CollapsibleSection>
  )
}

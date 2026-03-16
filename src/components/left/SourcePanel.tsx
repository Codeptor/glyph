import { useStore } from '@/store/useStore'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { SourceUpload } from '@/components/SourceUpload'
import { SliderField } from '@/components/SliderField'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SourceType, GenerativeField } from '@/types'

const GENERATIVE_FIELDS: GenerativeField[] = [
  'plasma', 'rings', 'spiral', 'vortex', 'tunnel', 'ripple', 'sine-field', 'domain-warp',
]

export function SourcePanel() {
  const layers = useStore((s) => s.layers)
  const activeLayerIndex = useStore((s) => s.activeLayerIndex)
  const updateActiveLayer = useStore((s) => s.updateActiveLayer)
  const layer = layers[activeLayerIndex]

  if (!layer) return null

  const { sourceType, generativeField, generativeSpeed, generativeScale, generativeComplexity } = layer

  return (
    <CollapsibleSection title="Source">
      <div className="space-y-2">
        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Input
        </Label>
        <ToggleGroup
          type="single"
          value={sourceType}
          onValueChange={(v) => { if (v) updateActiveLayer({ sourceType: v as SourceType }) }}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <ToggleGroupItem value="image" className="flex-1 text-[11px] cursor-crosshair">
            Image
          </ToggleGroupItem>
          <ToggleGroupItem value="camera" className="flex-1 text-[11px] cursor-crosshair">
            Camera
          </ToggleGroupItem>
          <ToggleGroupItem value="generative" className="flex-1 text-[11px] cursor-crosshair">
            Gen
          </ToggleGroupItem>
        </ToggleGroup>

        {sourceType !== 'generative' && <SourceUpload />}

        {sourceType === 'generative' && (
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Field
            </Label>
            <Select
              value={generativeField}
              onValueChange={(v) => updateActiveLayer({ generativeField: v as GenerativeField })}
            >
              <SelectTrigger size="sm" className="w-full h-7 text-xs cursor-crosshair">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GENERATIVE_FIELDS.map((f) => (
                  <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <SliderField
              label="Speed"
              value={generativeSpeed}
              min={0.01}
              max={3}
              step={0.01}
              onChange={(v) => updateActiveLayer({ generativeSpeed: v })}
            />
            <SliderField
              label="Scale"
              value={generativeScale}
              min={0.1}
              max={5}
              step={0.1}
              onChange={(v) => updateActiveLayer({ generativeScale: v })}
            />
            <SliderField
              label="Complexity"
              value={generativeComplexity}
              min={1}
              max={8}
              step={1}
              onChange={(v) => updateActiveLayer({ generativeComplexity: v })}
            />
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
}

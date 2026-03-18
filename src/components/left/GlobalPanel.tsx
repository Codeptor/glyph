import { useStore } from '@/store/useStore'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { SliderField } from '@/components/SliderField'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { AspectRatio } from '@/types'

const ASPECTS: { value: AspectRatio; label: string }[] = [
  { value: 'original', label: 'Orig' },
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '1:1', label: '1:1' },
  { value: '3:4', label: '3:4' },
  { value: '9:16', label: '9:16' },
]

interface GlobalPanelProps {
  onExport?: () => void
}

export function GlobalPanel({ onExport }: GlobalPanelProps) {
  const tonemapConfig = useStore((s) => s.tonemapConfig)
  const updateTonemapConfig = useStore((s) => s.updateTonemapConfig)
  const backgroundColor = useStore((s) => s.backgroundColor)
  const setBackgroundColor = useStore((s) => s.setBackgroundColor)
  const aspectRatio = useStore((s) => s.aspectRatio)
  const setAspectRatio = useStore((s) => s.setAspectRatio)

  return (
    <CollapsibleSection title="Global">
      <div className="space-y-3">
        {/* Tonemap */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Tonemap
            </Label>
            <Switch
              size="sm"
              checked={tonemapConfig.enabled}
              onCheckedChange={(v) => updateTonemapConfig({ enabled: v })}
              className="cursor-crosshair"
            />
          </div>
          {tonemapConfig.enabled && (
            <SliderField
              label="Gamma"
              value={tonemapConfig.gamma}
              min={0.3}
              max={2.0}
              step={0.05}
              onChange={(v) => updateTonemapConfig({ gamma: v })}
            />
          )}
        </div>

        {/* Background */}
        <div className="space-y-2 border-t border-zinc-800 pt-2">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Background
          </Label>
          <div className="flex items-center gap-2">
            <div
              className="size-6 rounded border border-zinc-700 shrink-0"
              style={{ backgroundColor }}
            />
            <Input
              type="text"
              value={backgroundColor}
              onChange={(e) => {
                const v = e.target.value
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setBackgroundColor(v)
              }}
              className="h-6 flex-1 text-[10px] font-mono bg-transparent border-border cursor-crosshair"
            />
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2 border-t border-zinc-800 pt-2">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Aspect Ratio
          </Label>
          <ToggleGroup
            type="single"
            value={aspectRatio}
            onValueChange={(v) => { if (v) setAspectRatio(v as AspectRatio) }}
            variant="outline"
            size="sm"
            className="flex flex-wrap gap-0"
          >
            {ASPECTS.map((a) => (
              <ToggleGroupItem
                key={a.value}
                value={a.value}
                className="text-[10px] px-2 cursor-crosshair"
              >
                {a.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-zinc-800 pt-2">
          <Button variant="outline" size="xs" className="flex-1 text-[11px] cursor-crosshair" onClick={onExport}>
            Export
          </Button>
          <Button variant="outline" size="xs" className="flex-1 text-[11px] cursor-crosshair">
            Presets
          </Button>
        </div>
      </div>
    </CollapsibleSection>
  )
}

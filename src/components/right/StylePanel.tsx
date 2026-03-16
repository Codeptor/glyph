import { useStore } from '@/store/useStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SliderField } from '@/components/SliderField'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { fmtDeg } from '@/lib/format'
import type {
  ArtStyle, CharacterSet, FontFamily,
  HalftoneShape, BrailleVariant, RetroDuotone, TerminalCharset,
} from '@/types'

const ART_STYLES: { value: ArtStyle; label: string }[] = [
  { value: 'classic', label: 'Classic ASCII' },
  { value: 'braille', label: 'Braille' },
  { value: 'halftone', label: 'Halftone' },
  { value: 'dotcross', label: 'Dot Cross' },
  { value: 'line', label: 'Line' },
  { value: 'particles', label: 'Particles' },
  { value: 'claude-code', label: 'Claude Code' },
  { value: 'retro', label: 'Retro Art' },
  { value: 'terminal', label: 'Terminal' },
]

const CHARACTER_SETS: { value: CharacterSet; label: string }[] = [
  { value: 'standard', label: 'Standard (@%#*+=-:. )' },
  { value: 'blocks', label: 'Blocks (\u2588\u2593\u2592\u2591 )' },
  { value: 'detailed', label: 'Detailed ($@B%8&WM... )' },
  { value: 'minimal', label: 'Minimal (\u00B7\u2591\u2588)' },
  { value: 'binary', label: 'Binary (01)' },
  { value: 'custom', label: 'Custom' },
  { value: 'letters-upper', label: 'Letters (A-Z)' },
  { value: 'letters-lower', label: 'Letters (a-z)' },
  { value: 'letters-mixed', label: 'Letters (Aa)' },
  { value: 'letters-symbols', label: 'Letters (Symbols)' },
]

const FONTS: FontFamily[] = ['Helvetica Neue', 'Inter', 'Poppins', 'Space Grotesk', 'VT323']

const HALFTONE_SHAPES: HalftoneShape[] = ['circle', 'square', 'diamond', 'pentagon', 'hexagon']
const BRAILLE_VARIANTS: BrailleVariant[] = ['standard', 'sparse', 'dense']
const RETRO_DUOTONES: RetroDuotone[] = ['amber-classic', 'cyan-night', 'violet-haze', 'lime-pulse', 'mono-ice']
const TERMINAL_CHARSETS: TerminalCharset[] = ['101010', 'brackets', 'dollar', 'mixed', 'pipes']

export function StylePanel() {
  const layers = useStore((s) => s.layers)
  const activeLayerIndex = useStore((s) => s.activeLayerIndex)
  const update = useStore((s) => s.updateActiveLayer)

  const layer = layers[activeLayerIndex]
  if (!layer) return null

  const showBraille = layer.artStyle === 'braille'
  const showHalftone = layer.artStyle === 'halftone'
  const showLine = layer.artStyle === 'line'
  const showParticles = layer.artStyle === 'particles'
  const showClaude = layer.artStyle === 'claude-code'
  const showRetro = layer.artStyle === 'retro'
  const showTerminal = layer.artStyle === 'terminal'

  return (
    <CollapsibleSection title="Style">
      {/* ART STYLE */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Art Style</Label>
        <ToggleGroup
          type="single"
          value={layer.artStyle}
          onValueChange={(v) => { if (v) update({ artStyle: v as ArtStyle }) }}
          variant="outline"
          size="sm"
          className="flex flex-wrap gap-1"
        >
          {ART_STYLES.map((s) => (
            <ToggleGroupItem
              key={s.value}
              value={s.value}
              className="text-[10px] h-6 px-2 cursor-crosshair"
            >
              {s.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* FONT SELECTOR */}
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground shrink-0">Font</Label>
        <Select
          value={layer.font}
          onValueChange={(v) => update({ font: v as FontFamily })}
        >
          <SelectTrigger size="sm" className="h-7 text-xs flex-1 cursor-crosshair">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONTS.map((f) => (
              <SelectItem key={f} value={f}>{f === 'VT323' ? 'VT323 (Pixel)' : f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* CHARSET SELECTOR */}
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground shrink-0">Charset</Label>
        <Select
          value={layer.characterSet}
          onValueChange={(v) => update({ characterSet: v as CharacterSet })}
        >
          <SelectTrigger size="sm" className="h-7 text-xs flex-1 cursor-crosshair">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHARACTER_SETS.map((cs) => (
              <SelectItem key={cs.value} value={cs.value}>{cs.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {layer.characterSet === 'custom' && (
        <Input
          value={layer.customCharset}
          onChange={(e) => update({ customCharset: e.target.value })}
          placeholder="Custom characters..."
          className="h-7 text-xs font-mono cursor-crosshair"
        />
      )}

      {/* STYLE-SPECIFIC CONTROLS */}
      {showBraille && (
        <>
          <Separator />
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Braille Variant</Label>
            <ToggleGroup
              type="single"
              value={layer.brailleVariant}
              onValueChange={(v) => { if (v) update({ brailleVariant: v as BrailleVariant }) }}
              variant="outline"
              size="sm"
            >
              {BRAILLE_VARIANTS.map((v) => (
                <ToggleGroupItem key={v} value={v} className="text-[10px] h-6 px-2 cursor-crosshair">
                  {v}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </>
      )}

      {showHalftone && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Halftone</Label>
            <ToggleGroup
              type="single"
              value={layer.halftoneShape}
              onValueChange={(v) => { if (v) update({ halftoneShape: v as HalftoneShape }) }}
              variant="outline"
              size="sm"
              className="flex flex-wrap gap-1"
            >
              {HALFTONE_SHAPES.map((s) => (
                <ToggleGroupItem key={s} value={s} className="text-[10px] h-6 px-2 cursor-crosshair">
                  {s}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <SliderField label="Size" value={layer.halftoneSize} min={0.5} max={5} onChange={(v) => update({ halftoneSize: v })} />
            <SliderField label="Rotation" value={layer.halftoneRotation} min={0} max={360} step={1} onChange={(v) => update({ halftoneRotation: v })} formatValue={fmtDeg} />
          </div>
        </>
      )}

      {showLine && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Line Art</Label>
            <SliderField label="Length" value={layer.lineLength} min={0.5} max={5} onChange={(v) => update({ lineLength: v })} />
            <SliderField label="Width" value={layer.lineWidth} min={0.5} max={5} onChange={(v) => update({ lineWidth: v })} />
            <SliderField label="Thickness" value={layer.lineThickness} min={0.5} max={5} onChange={(v) => update({ lineThickness: v })} />
            <SliderField label="Rotation" value={layer.lineRotation} min={0} max={360} step={1} onChange={(v) => update({ lineRotation: v })} formatValue={fmtDeg} />
          </div>
        </>
      )}

      {showParticles && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Particles</Label>
            <SliderField label="Density" value={layer.particleDensity} min={0.05} max={1} onChange={(v) => update({ particleDensity: v })} />
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Character</Label>
              <Input
                value={layer.particleChar}
                maxLength={1}
                onChange={(e) => update({ particleChar: e.target.value || '*' })}
                className="w-10 h-6 text-center text-xs font-mono cursor-crosshair"
              />
            </div>
          </div>
        </>
      )}

      {showClaude && (
        <>
          <Separator />
          <div className="space-y-2">
            <SliderField label="Claude Density" value={layer.claudeDensity} min={0.05} max={1} onChange={(v) => update({ claudeDensity: v })} />
          </div>
        </>
      )}

      {showRetro && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Retro Art</Label>
            <ToggleGroup
              type="single"
              value={layer.retroDuotone}
              onValueChange={(v) => { if (v) update({ retroDuotone: v as RetroDuotone }) }}
              variant="outline"
              size="sm"
              className="flex flex-wrap gap-1"
            >
              {RETRO_DUOTONES.map((d) => (
                <ToggleGroupItem key={d} value={d} className="text-[10px] h-6 px-2 cursor-crosshair">
                  {d.replace('-', ' ')}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <SliderField label="Noise" value={layer.retroNoise} min={0} max={1} onChange={(v) => update({ retroNoise: v })} />
          </div>
        </>
      )}

      {showTerminal && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Terminal Charset</Label>
            <ToggleGroup
              type="single"
              value={layer.terminalCharset}
              onValueChange={(v) => { if (v) update({ terminalCharset: v as TerminalCharset }) }}
              variant="outline"
              size="sm"
            >
              {TERMINAL_CHARSETS.map((tc) => (
                <ToggleGroupItem key={tc} value={tc} className="text-[10px] h-6 px-2 cursor-crosshair">
                  {tc}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </>
      )}
    </CollapsibleSection>
  )
}

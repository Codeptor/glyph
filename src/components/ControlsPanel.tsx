import { useStore } from '@/store/useStore'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type {
  ArtStyle, CharacterSet, DitherAlgorithm, FontFamily, ColorMode,
  FXPreset, NoiseDirection, MouseInteraction, HalftoneShape,
  BrailleVariant, RetroDuotone, TerminalCharset,
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

const FONTS: FontFamily[] = ['Helvetica Neue', 'Inter', 'Poppins', 'Space Grotesk', 'VT323']

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

const FX_PRESETS: { value: FXPreset; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'noise', label: 'Noise' },
  { value: 'intervals', label: 'Intervals' },
  { value: 'beam', label: 'Beam' },
  { value: 'glitch', label: 'Glitch' },
  { value: 'crt', label: 'CRT' },
  { value: 'matrix-rain', label: 'Matrix' },
]

const DIRECTIONS: NoiseDirection[] = ['up', 'down', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']

const DIRECTION_ICONS: Record<string, string> = {
  'up': '\u2191', 'down': '\u2193', 'left': '\u2190', 'right': '\u2192',
  'top-left': '\u2196', 'top-right': '\u2197', 'bottom-left': '\u2199', 'bottom-right': '\u2198',
}

const HALFTONE_SHAPES: HalftoneShape[] = ['circle', 'square', 'diamond', 'pentagon', 'hexagon']
const BRAILLE_VARIANTS: BrailleVariant[] = ['standard', 'sparse', 'dense']
const RETRO_DUOTONES: RetroDuotone[] = ['amber-classic', 'cyan-night', 'violet-haze', 'lime-pulse', 'mono-ice']
const TERMINAL_CHARSETS: TerminalCharset[] = ['101010', 'brackets', 'dollar', 'mixed', 'pipes']
const MOUSE_INTERACTIONS: MouseInteraction[] = ['attract', 'push']

function getDirectionField(preset: FXPreset): string | null {
  switch (preset) {
    case 'noise': return 'noiseDirection'
    case 'intervals': return 'intervalDirection'
    case 'beam': return 'beamDirection'
    case 'glitch': return 'glitchDirection'
    case 'crt': return 'crtDirection'
    case 'matrix-rain': return 'matrixDirection'
    default: return null
  }
}

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
}

function SliderField({ label, value, min, max, step = 0.01, onChange, formatValue }: SliderFieldProps) {
  const displayValue = formatValue ? formatValue(value) : String(parseFloat(value.toFixed(2)))

  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
        <span className="text-xs font-mono text-muted-foreground">{displayValue}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="cursor-crosshair"
      />
    </div>
  )
}

function fmtPx(v: number) { return `${Math.round(v)}px` }
function fmtMul(v: number) { return `${Number(v.toFixed(1))}x` }
function fmtInt(v: number) { return String(Math.round(v)) }
function fmtDeg(v: number) { return `${Math.round(v)}\u00B0` }

export function ControlsPanel() {
  const layers = useStore((s) => s.layers)
  const activeLayerIndex = useStore((s) => s.activeLayerIndex)
  const updateActiveLayer = useStore((s) => s.updateActiveLayer)

  const layer = layers[activeLayerIndex]
  if (!layer) return null

  const update = updateActiveLayer

  const showBraille = layer.artStyle === 'braille'
  const showHalftone = layer.artStyle === 'halftone'
  const showLine = layer.artStyle === 'line'
  const showParticles = layer.artStyle === 'particles'
  const showClaude = layer.artStyle === 'claude-code'
  const showRetro = layer.artStyle === 'retro'
  const showTerminal = layer.artStyle === 'terminal'

  const dirField = getDirectionField(layer.fxPreset)
  const currentDirection = dirField ? (layer as unknown as Record<string, unknown>)[dirField] as NoiseDirection : null

  return (
    <div className="px-4 pb-4 space-y-3">

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

      <Separator />

      {/* DROPDOWNS: Font, Character Set, Dither Algorithm */}
      <div className="space-y-2">
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
      </div>

      <Separator />

      {/* 2-COLUMN SLIDER GRID */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <SliderField label="Brightness" value={layer.brightness} min={-1} max={1} onChange={(v) => update({ brightness: v })} />
          <SliderField label="BG Dither" value={layer.bgDither} min={0} max={1} onChange={(v) => update({ bgDither: v })} />
          <SliderField label="Inv Dither" value={layer.inverseDither} min={0} max={1} onChange={(v) => update({ inverseDither: v })} />
          <SliderField label="Spacing" value={layer.characterSpacing} min={0.5} max={3} onChange={(v) => update({ characterSpacing: v })} formatValue={fmtMul} />
          <SliderField label="Vignette" value={layer.vignette} min={0} max={1} onChange={(v) => update({ vignette: v })} />
        </div>
        <div className="space-y-3">
          <SliderField label="Contrast" value={layer.contrast} min={0} max={3} onChange={(v) => update({ contrast: v })} />
          <SliderField label="Dither Str" value={layer.ditherStrength} min={0} max={1} onChange={(v) => update({ ditherStrength: v })} />
          <SliderField label="Font Size" value={layer.fontSize} min={4} max={24} step={1} onChange={(v) => update({ fontSize: Math.round(v) })} formatValue={fmtPx} />
          <SliderField label="Opacity" value={layer.opacity} min={0} max={1} onChange={(v) => update({ opacity: v })} />
          <SliderField label="Border Glow" value={layer.borderGlow} min={0} max={1} onChange={(v) => update({ borderGlow: v })} />
        </div>
      </div>

      <Separator />

      {/* COLOR MODE */}
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

      <Separator />

      {/* FX PRESET */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">FX Preset</Label>
        <ToggleGroup
          type="single"
          value={layer.fxPreset}
          onValueChange={(v) => { if (v) update({ fxPreset: v as FXPreset }) }}
          variant="outline"
          size="sm"
          className="flex flex-wrap gap-1"
        >
          {FX_PRESETS.map((fx) => (
            <ToggleGroupItem key={fx.value} value={fx.value} className="text-[10px] h-6 px-2 cursor-crosshair">
              {fx.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {layer.fxPreset !== 'none' && (
          <div className="space-y-2">
            <SliderField label="FX Strength" value={layer.fxStrength} min={0} max={1} onChange={(v) => update({ fxStrength: v })} />

            {dirField && currentDirection && (
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Direction</Label>
                <ToggleGroup
                  type="single"
                  value={currentDirection}
                  onValueChange={(v) => { if (v) update({ [dirField]: v }) }}
                  variant="outline"
                  size="sm"
                  className="flex flex-wrap gap-1"
                >
                  {DIRECTIONS.map((d) => (
                    <ToggleGroupItem key={d} value={d} className="text-xs h-6 w-6 p-0 cursor-crosshair">
                      {DIRECTION_ICONS[d]}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            )}

            {layer.fxPreset === 'noise' && (
              <>
                <SliderField label="Noise Scale" value={layer.noiseScale} min={2} max={60} step={1} onChange={(v) => update({ noiseScale: v })} formatValue={fmtInt} />
                <SliderField label="Noise Speed" value={layer.noiseSpeed} min={0.05} max={5} onChange={(v) => update({ noiseSpeed: v })} />
              </>
            )}
            {layer.fxPreset === 'intervals' && (
              <>
                <SliderField label="Spacing" value={layer.intervalSpacing} min={2} max={40} step={1} onChange={(v) => update({ intervalSpacing: v })} formatValue={fmtInt} />
                <SliderField label="Speed" value={layer.intervalSpeed} min={0.05} max={5} onChange={(v) => update({ intervalSpeed: v })} />
                <SliderField label="Width" value={layer.intervalWidth} min={1} max={10} step={1} onChange={(v) => update({ intervalWidth: v })} formatValue={fmtInt} />
              </>
            )}
            {layer.fxPreset === 'matrix-rain' && (
              <>
                <SliderField label="Scale" value={layer.matrixScale} min={5} max={40} step={1} onChange={(v) => update({ matrixScale: v })} formatValue={fmtInt} />
                <SliderField label="Speed" value={layer.matrixSpeed} min={0.02} max={1} onChange={(v) => update({ matrixSpeed: v })} />
              </>
            )}
          </div>
        )}
      </div>

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
    </div>
  )
}

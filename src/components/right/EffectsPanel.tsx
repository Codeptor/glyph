import { useStore } from '@/store/useStore'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SliderField } from '@/components/SliderField'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { fmtInt } from '@/lib/format'
import { X } from 'lucide-react'
import type {
  FXPreset, NoiseDirection, ShaderType, ParticleType, ShaderEntry,
} from '@/types'

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

const SHADER_TYPES: ShaderType[] = [
  'chromatic', 'kaleidoscope', 'solarize', 'posterize',
  'hue-rotate', 'color-wobble', 'color-ramp', 'pixel-sort',
  'data-bend', 'block-glitch', 'radial-blur', 'soft-focus',
  'edge-glow', 'bloom', 'rgb-split', 'wave-distort',
  'displacement', 'threshold', 'channel-shift',
]

const PARTICLE_TYPES: ParticleType[] = ['explosion', 'embers', 'flow-field', 'boids', 'orbit']

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

export function EffectsPanel() {
  const layers = useStore((s) => s.layers)
  const activeLayerIndex = useStore((s) => s.activeLayerIndex)
  const update = useStore((s) => s.updateActiveLayer)

  const layer = layers[activeLayerIndex]
  if (!layer) return null

  const dirField = getDirectionField(layer.fxPreset)
  const currentDirection = dirField ? (layer as unknown as Record<string, unknown>)[dirField] as NoiseDirection : null

  const addShader = (type: ShaderType) => {
    const entry: ShaderEntry = { type, enabled: true, strength: 0.5, params: {} }
    update({ shaderChain: [...layer.shaderChain, entry] })
  }

  const removeShader = (index: number) => {
    update({ shaderChain: layer.shaderChain.filter((_, i) => i !== index) })
  }

  const updateShader = (index: number, updates: Partial<ShaderEntry>) => {
    update({
      shaderChain: layer.shaderChain.map((entry, i) =>
        i === index ? { ...entry, ...updates } : entry
      ),
    })
  }

  return (
    <CollapsibleSection title="Effects">
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

      {/* SHADER CHAIN */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Shader Chain</Label>
          <Select onValueChange={(v) => addShader(v as ShaderType)}>
            <SelectTrigger size="sm" className="h-6 text-[10px] w-auto gap-1 px-2 cursor-crosshair">
              <SelectValue placeholder="Add Shader" />
            </SelectTrigger>
            <SelectContent>
              {SHADER_TYPES.map((st) => (
                <SelectItem key={st} value={st}>{st}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {layer.shaderChain.length > 0 && (
          <div className="space-y-2">
            {layer.shaderChain.map((shader, i) => (
              <div key={i} className="rounded-md border border-zinc-800 bg-zinc-900/50 p-2 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">{shader.type}</span>
                  <div className="flex items-center gap-1.5">
                    <Switch
                      size="sm"
                      checked={shader.enabled}
                      onCheckedChange={(checked) => updateShader(i, { enabled: checked })}
                    />
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeShader(i)}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                </div>
                <SliderField
                  label="Strength"
                  value={shader.strength}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => updateShader(i, { strength: v })}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* PARTICLES */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Particles</Label>
          <Switch
            size="sm"
            checked={layer.particles.enabled}
            onCheckedChange={(checked) => update({ particles: { ...layer.particles, enabled: checked } })}
          />
        </div>

        {layer.particles.enabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground shrink-0">Type</Label>
              <Select
                value={layer.particles.type}
                onValueChange={(v) => update({ particles: { ...layer.particles, type: v as ParticleType } })}
              >
                <SelectTrigger size="sm" className="h-7 text-xs flex-1 cursor-crosshair">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PARTICLE_TYPES.map((pt) => (
                    <SelectItem key={pt} value={pt}>{pt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <SliderField label="Count" value={layer.particles.count} min={10} max={1000} step={10} onChange={(v) => update({ particles: { ...layer.particles, count: v } })} formatValue={fmtInt} />
            <SliderField label="Speed" value={layer.particles.speed} min={0.1} max={5} step={0.1} onChange={(v) => update({ particles: { ...layer.particles, speed: v } })} />
            <SliderField label="Size" value={layer.particles.size} min={0.5} max={10} step={0.5} onChange={(v) => update({ particles: { ...layer.particles, size: v } })} />
            <SliderField label="Lifetime" value={layer.particles.lifetime} min={0.5} max={10} step={0.5} onChange={(v) => update({ particles: { ...layer.particles, lifetime: v } })} />
            <SliderField label="Gravity" value={layer.particles.gravity} min={0} max={2} step={0.05} onChange={(v) => update({ particles: { ...layer.particles, gravity: v } })} />
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Color</Label>
              <input
                type="color"
                value={layer.particles.color}
                onChange={(e) => update({ particles: { ...layer.particles, color: e.target.value } })}
                className="h-6 w-10 rounded border border-input cursor-crosshair"
              />
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
}

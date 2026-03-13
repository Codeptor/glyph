import { useStore } from '@/store/useStore'
import { SliderControl } from './SliderControl'
import type {
  ArtStyle, CharacterSet, DitherAlgorithm, FontFamily, ColorMode,
  FXPreset, NoiseDirection, MouseInteraction, HalftoneShape,
  BrailleVariant, RetroDuotone, TerminalCharset, LetterSet,
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
]

const FONTS: FontFamily[] = ['Helvetica Neue', 'Inter', 'Poppins', 'Space Grotesk', 'VT323']

const COLOR_MODES: { value: ColorMode; label: string }[] = [
  { value: 'grayscale', label: 'Grayscale' },
  { value: 'fullcolor', label: 'Full Color' },
  { value: 'matrix', label: 'Matrix Green' },
  { value: 'amber', label: 'Amber Monitor' },
  { value: 'custom', label: 'Custom' },
]

const FX_PRESETS: { value: FXPreset; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'noise', label: 'Noise Field' },
  { value: 'intervals', label: 'Intervals' },
  { value: 'beam', label: 'Beam Sweep' },
  { value: 'glitch', label: 'Glitch' },
  { value: 'crt', label: 'CRT Monitor' },
  { value: 'matrix-rain', label: 'Matrix Rain' },
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
const LETTER_SETS: LetterSet[] = ['alphabet', 'lowercase', 'mixed', 'symbols']
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
    <div className="controls-panel">
      <div className="controls-wrap">
        {/* ART STYLE */}
        <div className="control-section">
          <div className="control-label">Art Style</div>
          <div className="style-buttons">
            {ART_STYLES.map((s) => (
              <button
                key={s.value}
                className={layer.artStyle === s.value ? 'active' : ''}
                onClick={() => update({ artStyle: s.value })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* STYLE-SPECIFIC CONTROLS */}
        {showBraille && (
          <div className="control-section">
            <div className="control-label">Braille Variant</div>
            <div className="style-buttons">
              {BRAILLE_VARIANTS.map((v) => (
                <button
                  key={v}
                  className={layer.brailleVariant === v ? 'active' : ''}
                  onClick={() => update({ brailleVariant: v })}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {showHalftone && (
          <div className="control-section">
            <div className="control-label">Halftone</div>
            <div className="style-buttons">
              {HALFTONE_SHAPES.map((s) => (
                <button
                  key={s}
                  className={layer.halftoneShape === s ? 'active' : ''}
                  onClick={() => update({ halftoneShape: s })}
                >
                  {s}
                </button>
              ))}
            </div>
            <SliderControl label="Size" value={layer.halftoneSize} min={0.5} max={5} onChange={(v) => update({ halftoneSize: v })} />
            <SliderControl label="Rotation" value={layer.halftoneRotation} min={0} max={360} step={1} onChange={(v) => update({ halftoneRotation: v })} />
          </div>
        )}

        {showLine && (
          <div className="control-section">
            <div className="control-label">Line Art</div>
            <SliderControl label="Length" value={layer.lineLength} min={0.5} max={5} onChange={(v) => update({ lineLength: v })} />
            <SliderControl label="Width" value={layer.lineWidth} min={0.5} max={5} onChange={(v) => update({ lineWidth: v })} />
            <SliderControl label="Thickness" value={layer.lineThickness} min={0.5} max={5} onChange={(v) => update({ lineThickness: v })} />
            <SliderControl label="Rotation" value={layer.lineRotation} min={0} max={360} step={1} onChange={(v) => update({ lineRotation: v })} />
          </div>
        )}

        {showParticles && (
          <div className="control-section">
            <div className="control-label">Particles</div>
            <SliderControl label="Density" value={layer.particleDensity} min={0.05} max={1} onChange={(v) => update({ particleDensity: v })} />
            <div className="control-row">
              <div className="control-label">Character</div>
              <input
                className="control-text"
                value={layer.particleChar}
                maxLength={1}
                onChange={(e) => update({ particleChar: e.target.value || '*' })}
              />
            </div>
          </div>
        )}

        {showClaude && (
          <div className="control-section">
            <div className="control-label">Claude Density</div>
            <SliderControl label="Density" value={layer.claudeDensity} min={0.05} max={1} onChange={(v) => update({ claudeDensity: v })} />
          </div>
        )}

        {showRetro && (
          <div className="control-section">
            <div className="control-label">Retro Art</div>
            <div className="style-buttons">
              {RETRO_DUOTONES.map((d) => (
                <button
                  key={d}
                  className={layer.retroDuotone === d ? 'active' : ''}
                  onClick={() => update({ retroDuotone: d })}
                >
                  {d.replace('-', ' ')}
                </button>
              ))}
            </div>
            <SliderControl label="Noise" value={layer.retroNoise} min={0} max={1} onChange={(v) => update({ retroNoise: v })} />
          </div>
        )}

        {showTerminal && (
          <div className="control-section">
            <div className="control-label">Terminal Charset</div>
            <div className="style-buttons">
              {TERMINAL_CHARSETS.map((tc) => (
                <button
                  key={tc}
                  className={layer.terminalCharset === tc ? 'active' : ''}
                  onClick={() => update({ terminalCharset: tc })}
                >
                  {tc}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* THREE DROPDOWNS: Font, Character Set, Dither Algorithm */}
        <div className="control-section">
          <div className="control-row">
            <div className="control-label">Font</div>
            <select
              className="control-select"
              value={layer.font}
              onChange={(e) => update({ font: e.target.value as FontFamily })}
            >
              {FONTS.map((f) => (
                <option key={f} value={f}>{f === 'VT323' ? 'VT323 (Pixel)' : f}</option>
              ))}
            </select>
          </div>
          <div className="control-row">
            <div className="control-label">Character Set</div>
            <select
              className="control-select"
              value={layer.characterSet}
              onChange={(e) => update({ characterSet: e.target.value as CharacterSet })}
            >
              {CHARACTER_SETS.map((cs) => (
                <option key={cs.value} value={cs.value}>{cs.label}</option>
              ))}
            </select>
          </div>
          {layer.characterSet === 'custom' && (
            <textarea
              className="control-textarea"
              value={layer.customCharset}
              onChange={(e) => update({ customCharset: e.target.value })}
              placeholder="Custom characters..."
            />
          )}
          <div className="control-row">
            <div className="control-label">Dither Algorithm</div>
            <select
              className="control-select"
              value={layer.ditherAlgorithm}
              onChange={(e) => update({ ditherAlgorithm: e.target.value as DitherAlgorithm })}
            >
              {DITHER_ALGORITHMS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* UNIFIED 2-COLUMN SLIDER GRID */}
        <div className="control-section">
          <div className="control-columns">
            <div>
              <SliderControl label="Brightness" value={layer.brightness} min={-1} max={1} onChange={(v) => update({ brightness: v })} />
              <SliderControl label="BG Dither" value={layer.bgDither} min={0} max={1} onChange={(v) => update({ bgDither: v })} />
              <SliderControl label="Inverse Dither" value={layer.inverseDither} min={0} max={1} onChange={(v) => update({ inverseDither: v })} />
              <SliderControl label="Character Spacing" value={layer.characterSpacing} min={0.5} max={3} onChange={(v) => update({ characterSpacing: v })} />
              <SliderControl label="Vignette" value={layer.vignette} min={0} max={1} onChange={(v) => update({ vignette: v })} />
            </div>
            <div>
              <SliderControl label="Contrast" value={layer.contrast} min={0} max={3} onChange={(v) => update({ contrast: v })} />
              <SliderControl label="Dither Strength" value={layer.ditherStrength} min={0} max={1} onChange={(v) => update({ ditherStrength: v })} />
              <SliderControl label="Font Size" value={layer.fontSize} min={4} max={24} step={1} onChange={(v) => update({ fontSize: Math.round(v) })} />
              <SliderControl label="Opacity" value={layer.opacity} min={0} max={1} onChange={(v) => update({ opacity: v })} />
              <SliderControl label="Border Glow" value={layer.borderGlow} min={0} max={1} onChange={(v) => update({ borderGlow: v })} />
            </div>
          </div>
        </div>

        {/* COLOR MODE */}
        <div className="control-section">
          <div className="control-row">
            <div className="control-label">Color Mode</div>
            <label className="check-line">
              <input
                type="checkbox"
                checked={layer.invertColor}
                onChange={(e) => update({ invertColor: e.target.checked })}
              />
              Invert Color
            </label>
          </div>
          <div className="color-mode-tabs">
            {COLOR_MODES.map((cm) => (
              <button
                key={cm.value}
                className={layer.colorMode === cm.value ? 'active' : ''}
                onClick={() => update({ colorMode: cm.value })}
              >
                {cm.label}
              </button>
            ))}
          </div>
          {layer.colorMode === 'custom' && (
            <input
              type="color"
              className="control-color"
              value={layer.customColor}
              onChange={(e) => update({ customColor: e.target.value })}
            />
          )}
        </div>

        {/* FX PRESET */}
        <div className="control-section">
          <div className="control-label">FX Preset</div>
          <div className="fx-preset-tabs">
            {FX_PRESETS.map((fx) => (
              <button
                key={fx.value}
                className={layer.fxPreset === fx.value ? 'active' : ''}
                onClick={() => update({ fxPreset: fx.value })}
              >
                {fx.label}
              </button>
            ))}
          </div>

          {layer.fxPreset !== 'none' && (
            <>
              <SliderControl label="FX Strength" value={layer.fxStrength} min={0} max={1} onChange={(v) => update({ fxStrength: v })} />

              {dirField && currentDirection && (
                <div className="control-row">
                  <div className="control-label">Direction</div>
                  <div className="fx-direction-tabs">
                    {DIRECTIONS.map((d) => (
                      <button
                        key={d}
                        className={`direction-icon-button${currentDirection === d ? ' active' : ''}`}
                        onClick={() => update({ [dirField]: d })}
                      >
                        {DIRECTION_ICONS[d]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {layer.fxPreset === 'noise' && (
                <>
                  <SliderControl label="Noise Scale" value={layer.noiseScale} min={2} max={60} step={1} onChange={(v) => update({ noiseScale: v })} />
                  <SliderControl label="Noise Speed" value={layer.noiseSpeed} min={0.05} max={5} onChange={(v) => update({ noiseSpeed: v })} />
                </>
              )}
              {layer.fxPreset === 'intervals' && (
                <>
                  <SliderControl label="Spacing" value={layer.intervalSpacing} min={2} max={40} step={1} onChange={(v) => update({ intervalSpacing: v })} />
                  <SliderControl label="Speed" value={layer.intervalSpeed} min={0.05} max={5} onChange={(v) => update({ intervalSpeed: v })} />
                  <SliderControl label="Width" value={layer.intervalWidth} min={1} max={10} step={1} onChange={(v) => update({ intervalWidth: v })} />
                </>
              )}
              {layer.fxPreset === 'matrix-rain' && (
                <>
                  <SliderControl label="Scale" value={layer.matrixScale} min={5} max={40} step={1} onChange={(v) => update({ matrixScale: v })} />
                  <SliderControl label="Speed" value={layer.matrixSpeed} min={0.02} max={1} onChange={(v) => update({ matrixSpeed: v })} />
                </>
              )}
            </>
          )}
        </div>

        {/* MOUSE INTERACTION */}
        <div className="control-section">
          <div className="control-label">Mouse Interaction</div>
          <div className="tab-buttons">
            {MOUSE_INTERACTIONS.map((mi) => (
              <button
                key={mi}
                className={layer.mouseInteraction === mi ? 'active' : ''}
                onClick={() => update({ mouseInteraction: mi })}
              >
                {mi.charAt(0).toUpperCase() + mi.slice(1)}
              </button>
            ))}
          </div>
          <SliderControl label="Hover Strength" value={layer.hoverStrength} min={1} max={60} step={1} onChange={(v) => update({ hoverStrength: v })} />
          <SliderControl label="Area Size" value={layer.mouseAreaSize} min={20} max={500} step={1} onChange={(v) => update({ mouseAreaSize: v })} />
          <SliderControl label="Spread" value={layer.mouseSpread} min={0.1} max={5} onChange={(v) => update({ mouseSpread: v })} />
        </div>
      </div>
    </div>
  )
}

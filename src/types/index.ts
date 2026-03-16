export type ArtStyle = 'classic' | 'braille' | 'halftone' | 'dotcross' | 'line' | 'particles' | 'claude-code' | 'retro' | 'terminal'

export type DitherAlgorithm = 'none' | 'floyd-steinberg' | 'bayer' | 'atkinson' | 'jarvis-judice-ninke' | 'stucki' | 'sierra' | 'sierra-lite'

export type CharacterSet = 'standard' | 'blocks' | 'detailed' | 'minimal' | 'binary' | 'custom' | 'letters-upper' | 'letters-lower' | 'letters-mixed' | 'letters-symbols'

export type FontFamily = 'Helvetica Neue' | 'Inter' | 'Poppins' | 'Space Grotesk' | 'VT323'

export type ColorMode = 'grayscale' | 'fullcolor' | 'matrix' | 'amber' | 'sepia' | 'cool-blue' | 'neon' | 'custom'

export type FXPreset = 'none' | 'noise' | 'intervals' | 'beam' | 'glitch' | 'crt' | 'matrix-rain'

export type NoiseDirection = 'up' | 'down' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export type MouseInteraction = 'attract' | 'push'

export type AspectRatio = 'original' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16'

export type SourceMode = 'image' | 'camera'

export type SourceQuality = 320 | 480 | 720

export type LeftPanel = 'library' | 'templates' | 'creations' | null

export type ThemeMode = 'dark' | 'light' | 'system'

export type HalftoneShape = 'circle' | 'square' | 'diamond' | 'pentagon' | 'hexagon'

export type BrailleVariant = 'standard' | 'sparse' | 'dense'

export type RetroDuotone = 'amber-classic' | 'cyan-night' | 'violet-haze' | 'lime-pulse' | 'mono-ice'

export type TerminalCharset = '101010' | 'brackets' | 'dollar' | 'mixed' | 'pipes'

export type LetterSet = 'alphabet' | 'lowercase' | 'mixed' | 'symbols'

// --- Glyph v2 Types ---

export type SourceType = 'image' | 'camera' | 'generative'

export type GenerativeField = 'plasma' | 'rings' | 'spiral' | 'vortex' | 'tunnel' | 'ripple' | 'sine-field' | 'domain-warp'

export type BlendMode = 'normal' | 'add' | 'screen' | 'multiply' | 'overlay'
  | 'softlight' | 'hardlight' | 'difference' | 'exclusion'
  | 'colordodge' | 'colorburn' | 'linearlight' | 'vividlight'
  | 'pin_light' | 'hard_mix' | 'lighten' | 'darken'
  | 'grain_extract' | 'grain_merge' | 'subtract'

export type MaskType = 'none' | 'circle' | 'rect' | 'ring' | 'gradient-h' | 'gradient-v' | 'gradient-radial' | 'iris' | 'wipe-h' | 'wipe-v' | 'dissolve'

export interface MaskConfig {
  type: MaskType
  feather: number
  invert: boolean
  centerX: number
  centerY: number
  radius: number
  innerRadius: number
  animSpeed: number
  animDirection: 'in' | 'out'
}

export interface FeedbackConfig {
  enabled: boolean
  decay: number
  blendMode: BlendMode
  opacity: number
  transform: 'none' | 'zoom' | 'shrink' | 'rotate-cw' | 'rotate-ccw' | 'shift-up' | 'shift-down'
  transformAmount: number
  hueShift: number
}

export interface TonemapConfig {
  enabled: boolean
  gamma: number
}

export type ParticleType = 'explosion' | 'embers' | 'flow-field' | 'boids' | 'orbit'

export interface ParticleConfig {
  enabled: boolean
  type: ParticleType
  count: number
  speed: number
  size: number
  color: string
  lifetime: number
  gravity: number
}

export type ShaderType = 'chromatic' | 'kaleidoscope' | 'solarize' | 'posterize'
  | 'hue-rotate' | 'color-wobble' | 'color-ramp' | 'pixel-sort'
  | 'data-bend' | 'block-glitch' | 'radial-blur' | 'soft-focus'
  | 'edge-glow' | 'bloom' | 'rgb-split' | 'wave-distort'
  | 'displacement' | 'threshold' | 'channel-shift'

export interface ShaderEntry {
  type: ShaderType
  enabled: boolean
  strength: number
  params: Record<string, number>
}

export interface Layer {
  id: string
  name: string
  artStyle: ArtStyle
  characterSet: CharacterSet
  customCharset: string
  ditherAlgorithm: DitherAlgorithm
  font: FontFamily
  fontSize: number
  brightness: number
  contrast: number
  bgDither: number
  inverseDither: number
  ditherStrength: number
  characterSpacing: number
  opacity: number
  vignette: number
  borderGlow: number
  colorMode: ColorMode
  invertColor: boolean
  customColor: string
  brailleVariant: BrailleVariant
  halftoneShape: HalftoneShape
  halftoneSize: number
  halftoneRotation: number
  lineLength: number
  lineWidth: number
  lineThickness: number
  lineRotation: number
  particleDensity: number
  particleChar: string
  claudeDensity: number
  retroDuotone: RetroDuotone
  retroNoise: number
  terminalCharset: TerminalCharset
  letterSet: LetterSet
  fxPreset: FXPreset
  fxStrength: number
  noiseDirection: NoiseDirection
  noiseScale: number
  noiseSpeed: number
  intervalDirection: NoiseDirection
  intervalSpacing: number
  intervalSpeed: number
  intervalWidth: number
  beamDirection: NoiseDirection
  glitchDirection: NoiseDirection
  crtDirection: NoiseDirection
  matrixDirection: NoiseDirection
  matrixScale: number
  matrixSpeed: number
  mouseInteraction: MouseInteraction
  hoverStrength: number
  mouseAreaSize: number
  mouseSpread: number
  // v2: source
  sourceType: SourceType
  generativeField: GenerativeField
  generativeSpeed: number
  generativeScale: number
  generativeComplexity: number
  // v2: composition
  blendMode: BlendMode
  mask: MaskConfig
  feedback: FeedbackConfig
  // v2: particles
  particles: ParticleConfig
  // v2: shader chain
  shaderChain: ShaderEntry[]
}

export interface Preset {
  id: string
  name: string
  layer: Partial<Layer>
  backgroundColor?: string
  aspectRatio?: AspectRatio
  createdAt: string
}

export interface GalleryAsset {
  id: string
  name: string
  data: string
  mimeType: string
  createdAt: string
}

export interface TemplateAsset {
  id: string
  name: string
  type: string
  summary: string
  preset: Partial<Layer>
  thumbnail?: string
}

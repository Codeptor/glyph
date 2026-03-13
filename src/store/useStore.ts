import { create } from 'zustand'
import type {
  Layer,
  AspectRatio,
  SourceMode,
  SourceQuality,
  LeftPanel,
  ThemeMode,
  GalleryAsset,
  TemplateAsset,
  Preset,
  ArtStyle,
  CharacterSet,
  DitherAlgorithm,
  FontFamily,
  ColorMode,
  FXPreset,
  NoiseDirection,
  MouseInteraction,
  HalftoneShape,
  BrailleVariant,
  RetroDuotone,
  TerminalCharset,
  LetterSet,
} from '@/types'

function uid(): string {
  return crypto.randomUUID()
}

const ART_STYLES: ArtStyle[] = ['classic', 'braille', 'halftone', 'dotcross', 'line', 'particles', 'claude-code', 'retro', 'terminal']
const CHARACTER_SETS: CharacterSet[] = ['standard', 'blocks', 'detailed', 'minimal', 'binary', 'custom', 'letters-upper', 'letters-lower', 'letters-mixed', 'letters-symbols']
const DITHER_ALGORITHMS: DitherAlgorithm[] = ['none', 'floyd-steinberg', 'bayer', 'atkinson']
const FONTS: FontFamily[] = ['Helvetica Neue', 'Inter', 'Poppins', 'Space Grotesk', 'VT323']
const COLOR_MODES: ColorMode[] = ['grayscale', 'fullcolor', 'matrix', 'amber', 'custom']
const FX_PRESETS: FXPreset[] = ['none', 'noise', 'intervals', 'beam', 'glitch', 'crt', 'matrix-rain']
const DIRECTIONS: NoiseDirection[] = ['up', 'down', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']
const MOUSE_INTERACTIONS: MouseInteraction[] = ['attract', 'push']
const HALFTONE_SHAPES: HalftoneShape[] = ['circle', 'square', 'diamond', 'pentagon', 'hexagon']
const BRAILLE_VARIANTS: BrailleVariant[] = ['standard', 'sparse', 'dense']
const RETRO_DUOTONES: RetroDuotone[] = ['amber-classic', 'cyan-night', 'violet-haze', 'lime-pulse', 'mono-ice']
const TERMINAL_CHARSETS: TerminalCharset[] = ['101010', 'brackets', 'dollar', 'mixed', 'pipes']
const LETTER_SETS: LetterSet[] = ['alphabet', 'lowercase', 'mixed', 'symbols']

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function rand(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

export function createDefaultLayer(name = 'Layer 1'): Layer {
  return {
    id: uid(),
    name,
    artStyle: 'classic',
    characterSet: 'standard',
    customCharset: ' .:-=+*#%@',
    ditherAlgorithm: 'floyd-steinberg',
    font: 'Helvetica Neue',
    fontSize: 10,
    brightness: 0,
    contrast: 1,
    bgDither: 0,
    inverseDither: 0,
    ditherStrength: 0.8,
    characterSpacing: 1,
    opacity: 1,
    vignette: 0,
    borderGlow: 0,
    colorMode: 'grayscale',
    invertColor: false,
    customColor: '#00ff99',
    brailleVariant: 'standard',
    halftoneShape: 'circle',
    halftoneSize: 1,
    halftoneRotation: 0,
    lineLength: 1,
    lineWidth: 1,
    lineThickness: 1.6,
    lineRotation: 0,
    particleDensity: 0.5,
    particleChar: '*',
    claudeDensity: 0.4,
    retroDuotone: 'amber-classic',
    retroNoise: 0.45,
    terminalCharset: '101010',
    letterSet: 'alphabet',
    fxPreset: 'noise',
    fxStrength: 0.45,
    noiseDirection: 'right',
    noiseScale: 24,
    noiseSpeed: 1,
    intervalDirection: 'down',
    intervalSpacing: 12,
    intervalSpeed: 1,
    intervalWidth: 2,
    beamDirection: 'right',
    glitchDirection: 'right',
    crtDirection: 'down',
    matrixDirection: 'down',
    matrixScale: 15,
    matrixSpeed: 0.1,
    mouseInteraction: 'attract',
    hoverStrength: 24,
    mouseAreaSize: 180,
    mouseSpread: 1,
  }
}

interface AppState {
  sourceMode: SourceMode
  sourceQuality: SourceQuality
  sourceImage: string | null

  layers: Layer[]
  activeLayerIndex: number

  aspectRatio: AspectRatio
  backgroundColor: string
  fps: number

  leftPanel: LeftPanel
  themeMode: ThemeMode
  sidebarHidden: boolean

  galleryAssets: GalleryAsset[]
  templateAssets: TemplateAsset[]
  presets: Preset[]

  setSourceMode: (mode: SourceMode) => void
  setSourceQuality: (quality: SourceQuality) => void
  setSourceImage: (image: string | null) => void

  setActiveLayerIndex: (index: number) => void
  updateActiveLayer: (updates: Partial<Layer>) => void
  addLayer: () => void
  removeLayer: (index: number) => void

  setAspectRatio: (ratio: AspectRatio) => void
  setBackgroundColor: (color: string) => void
  setFps: (fps: number) => void

  setLeftPanel: (panel: LeftPanel) => void
  setThemeMode: (mode: ThemeMode) => void
  setSidebarHidden: (hidden: boolean) => void

  addGalleryAsset: (asset: GalleryAsset) => void
  removeGalleryAsset: (id: string) => void

  setTemplateAssets: (assets: TemplateAsset[]) => void

  randomizeActiveLayer: () => void

  importPreset: (json: string) => void
  exportPreset: () => string

  savePreset: (name: string) => void
  loadPreset: (id: string) => void
  deletePreset: (id: string) => void
}

export const useStore = create<AppState>((set, get) => ({
  sourceMode: 'image',
  sourceQuality: 720,
  sourceImage: null,

  layers: [createDefaultLayer()],
  activeLayerIndex: 0,

  aspectRatio: 'original',
  backgroundColor: '#000000',
  fps: 30,

  leftPanel: 'library',
  themeMode: 'dark',
  sidebarHidden: false,

  galleryAssets: [],
  templateAssets: [],
  presets: [],

  setSourceMode: (mode) => set({ sourceMode: mode }),
  setSourceQuality: (quality) => set({ sourceQuality: quality }),
  setSourceImage: (image) => set({ sourceImage: image }),

  setActiveLayerIndex: (index) => set({ activeLayerIndex: index }),

  updateActiveLayer: (updates) =>
    set((state) => {
      const layers = [...state.layers]
      const idx = state.activeLayerIndex
      if (idx < 0 || idx >= layers.length) return state
      layers[idx] = { ...layers[idx], ...updates }
      return { layers }
    }),

  addLayer: () =>
    set((state) => {
      const name = `Layer ${state.layers.length + 1}`
      const newLayer = createDefaultLayer(name)
      return {
        layers: [...state.layers, newLayer],
        activeLayerIndex: state.layers.length,
      }
    }),

  removeLayer: (index) =>
    set((state) => {
      if (state.layers.length <= 1) return state
      const layers = state.layers.filter((_, i) => i !== index)
      const activeLayerIndex = Math.min(state.activeLayerIndex, layers.length - 1)
      return { layers, activeLayerIndex }
    }),

  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),
  setFps: (fps) => set({ fps }),

  setLeftPanel: (panel) => set({ leftPanel: panel }),
  setThemeMode: (mode) => set({ themeMode: mode }),
  setSidebarHidden: (hidden) => set({ sidebarHidden: hidden }),

  addGalleryAsset: (asset) =>
    set((state) => ({ galleryAssets: [...state.galleryAssets, asset] })),

  removeGalleryAsset: (id) =>
    set((state) => ({
      galleryAssets: state.galleryAssets.filter((a) => a.id !== id),
    })),

  setTemplateAssets: (assets) => set({ templateAssets: assets }),

  randomizeActiveLayer: () => {
    const updates: Partial<Layer> = {
      artStyle: pick(ART_STYLES),
      characterSet: pick(CHARACTER_SETS),
      ditherAlgorithm: pick(DITHER_ALGORITHMS),
      font: pick(FONTS),
      fontSize: Math.round(rand(6, 16)),
      brightness: rand(-0.5, 0.5),
      contrast: rand(0.5, 2),
      bgDither: rand(0, 1),
      inverseDither: rand(0, 1),
      ditherStrength: rand(0, 1),
      characterSpacing: rand(0.5, 2),
      opacity: rand(0.3, 1),
      vignette: rand(0, 1),
      borderGlow: rand(0, 1),
      colorMode: pick(COLOR_MODES),
      invertColor: Math.random() > 0.5,
      brailleVariant: pick(BRAILLE_VARIANTS),
      halftoneShape: pick(HALFTONE_SHAPES),
      halftoneSize: rand(0.5, 3),
      halftoneRotation: Math.round(rand(0, 360)),
      lineLength: rand(0.5, 3),
      lineWidth: rand(0.5, 3),
      lineThickness: rand(0.5, 4),
      lineRotation: Math.round(rand(0, 360)),
      particleDensity: rand(0.1, 1),
      claudeDensity: rand(0.1, 1),
      retroDuotone: pick(RETRO_DUOTONES),
      retroNoise: rand(0, 1),
      terminalCharset: pick(TERMINAL_CHARSETS),
      letterSet: pick(LETTER_SETS),
      fxPreset: pick(FX_PRESETS),
      fxStrength: rand(0.1, 1),
      noiseDirection: pick(DIRECTIONS),
      noiseScale: Math.round(rand(5, 50)),
      noiseSpeed: rand(0.1, 3),
      intervalDirection: pick(DIRECTIONS),
      intervalSpacing: Math.round(rand(4, 30)),
      intervalSpeed: rand(0.1, 3),
      intervalWidth: Math.round(rand(1, 6)),
      beamDirection: pick(DIRECTIONS),
      glitchDirection: pick(DIRECTIONS),
      crtDirection: pick(DIRECTIONS),
      matrixDirection: pick(DIRECTIONS),
      matrixScale: Math.round(rand(5, 30)),
      matrixSpeed: rand(0.05, 0.5),
      mouseInteraction: pick(MOUSE_INTERACTIONS),
      hoverStrength: Math.round(rand(5, 50)),
      mouseAreaSize: Math.round(rand(50, 400)),
      mouseSpread: rand(0.2, 3),
    }
    get().updateActiveLayer(updates)
  },

  importPreset: (json) => {
    try {
      const data = JSON.parse(json) as Preset
      const preset: Preset = {
        ...data,
        id: uid(),
        createdAt: new Date().toISOString(),
      }
      set((state) => ({ presets: [...state.presets, preset] }))
      if (preset.layer) {
        get().updateActiveLayer(preset.layer)
      }
      if (preset.backgroundColor) {
        set({ backgroundColor: preset.backgroundColor })
      }
      if (preset.aspectRatio) {
        set({ aspectRatio: preset.aspectRatio })
      }
    } catch {
      // invalid JSON — silently ignore
    }
  },

  exportPreset: () => {
    const state = get()
    const activeLayer = state.layers[state.activeLayerIndex]
    if (!activeLayer) return '{}'

    const { id: _id, name: _name, ...layerData } = activeLayer
    const preset: Preset = {
      id: uid(),
      name: activeLayer.name,
      layer: layerData,
      backgroundColor: state.backgroundColor,
      aspectRatio: state.aspectRatio,
      createdAt: new Date().toISOString(),
    }
    return JSON.stringify(preset, null, 2)
  },

  savePreset: (name) => {
    const state = get()
    const activeLayer = state.layers[state.activeLayerIndex]
    if (!activeLayer) return

    const { id: _id, name: _name, ...layerData } = activeLayer
    const preset: Preset = {
      id: uid(),
      name,
      layer: layerData,
      backgroundColor: state.backgroundColor,
      aspectRatio: state.aspectRatio,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ presets: [...state.presets, preset] }))
  },

  loadPreset: (id) => {
    const state = get()
    const preset = state.presets.find((p) => p.id === id)
    if (!preset) return

    if (preset.layer) {
      get().updateActiveLayer(preset.layer)
    }
    if (preset.backgroundColor) {
      set({ backgroundColor: preset.backgroundColor })
    }
    if (preset.aspectRatio) {
      set({ aspectRatio: preset.aspectRatio })
    }
  },

  deletePreset: (id) =>
    set((state) => ({
      presets: state.presets.filter((p) => p.id !== id),
    })),
}))

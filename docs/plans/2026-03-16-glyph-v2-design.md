# Glyph v2 — Feature Expansion + UI Overhaul

**Date:** 2026-03-16
**Scope:** Tier 1 (generative mode, feedback buffer, tonemap, blend modes) + Tier 2 (masking, particles, advanced shaders) + dual sidebar UI overhaul

## New Types

### Source
- `SourceType`: `'image' | 'camera' | 'generative'`
- `GenerativeField`: `'plasma' | 'rings' | 'spiral' | 'vortex' | 'tunnel' | 'ripple' | 'sine-field' | 'domain-warp'`

### Blend Modes (20)
`'normal' | 'add' | 'screen' | 'multiply' | 'overlay' | 'softlight' | 'hardlight' | 'difference' | 'exclusion' | 'colordodge' | 'colorburn' | 'linearlight' | 'vividlight' | 'pin_light' | 'hard_mix' | 'lighten' | 'darken' | 'grain_extract' | 'grain_merge' | 'subtract'`

### Masks
- `MaskType`: `'none' | 'circle' | 'rect' | 'ring' | 'gradient-h' | 'gradient-v' | 'gradient-radial' | 'iris' | 'wipe-h' | 'wipe-v' | 'dissolve'`
- `MaskConfig`: `{ type, feather, invert, centerX, centerY, radius, innerRadius, animSpeed, animDirection }`

### Feedback Buffer
`FeedbackConfig`: `{ enabled, decay (0-1), blendMode, opacity (0-1), transform ('none'|'zoom'|'shrink'|'rotate-cw'|'rotate-ccw'|'shift-up'|'shift-down'), transformAmount (0-0.1), hueShift (0-1) }`

### Tonemap
`TonemapConfig`: `{ enabled, gamma (0.3-2.0) }`

### Particles
- `ParticleType`: `'explosion' | 'embers' | 'flow-field' | 'boids' | 'orbit'`
- `ParticleConfig`: `{ enabled, type, count, speed, size, color, lifetime, gravity }`

### Shader Chain
- `ShaderType`: `'chromatic' | 'kaleidoscope' | 'solarize' | 'posterize' | 'hue-rotate' | 'color-wobble' | 'color-ramp' | 'pixel-sort' | 'data-bend' | 'block-glitch' | 'radial-blur' | 'soft-focus' | 'edge-glow' | 'bloom' | 'rgb-split' | 'wave-distort' | 'displacement' | 'threshold' | 'channel-shift'`
- `ShaderEntry`: `{ type, enabled, strength, params: Record<string, number> }`

### Layer Extension
New fields on existing `Layer` interface:
```
sourceType, generativeField, generativeSpeed, generativeScale, generativeComplexity,
blendMode, mask: MaskConfig, feedback: FeedbackConfig, particles: ParticleConfig,
shaderChain: ShaderEntry[]
```

## Engine Architecture

### Directory Structure
```
src/engine/
├── AsciiRenderer.ts          # refactored thin orchestrator
├── brightness.ts             # unchanged
├── dither.ts                 # unchanged
├── charsets.ts               # unchanged
├── renderUtils.ts            # unchanged
├── noise.ts                  # unchanged
├── fx.ts                     # unchanged (existing 6 FX)
├── styles/                   # unchanged (all 9 renderers)
├── pipeline/
│   ├── tonemap.ts            # adaptive percentile normalization + gamma
│   ├── blend.ts              # 20 blend modes on ImageData
│   ├── feedback.ts           # FeedbackBuffer class
│   ├── masks.ts              # mask generators
│   └── shaders.ts            # 19 shaders + ShaderChain class
├── generative/
│   ├── fields.ts             # 8 value field generators
│   └── particles.ts          # 5 particle systems
```

### Render Loop (per frame)
```
For each layer (sorted by stack order):
  1. SOURCE      → brightness grid + color grid
                   image/video: sampler canvas → getImageData → pixelBrightness
                   generative: field function → brightness grid directly
  2. TONEMAP     → adaptive normalization (if enabled)
  3. DITHER      → apply dithering
  4. PRE-FX      → existing noise/intervals/beam/glitch
  5. STYLE       → art style renderer → layer offscreen canvas
  6. PARTICLES   → particle overlay on layer canvas
  7. MASK        → zero out pixels outside mask
  8. POST-FX     → existing CRT/matrix-rain
  9. SHADERS     → shader chain

After all layers:
  10. COMPOSITE   → blend layer canvases with per-layer blend modes
  11. FEEDBACK    → blend feedback buffer, update buffer
  12. OUTPUT      → draw to display canvas
```

Each layer renders to its own offscreen canvas for proper blend mode compositing.

## UI Layout — Dual Sidebar

```
┌──────────────┬────────────────────────┬───────────────┐
│  LEFT (280px) │        CANVAS          │ RIGHT (300px) │
│              │                        │               │
│ Source       │                        │ Style         │
│ ├ Upload/Cam │                        │ ├ Art Style   │
│ └ Generative │                        │ ├ Charset     │
│              │                        │ ├ Font        │
│ Layers       │                        │               │
│ ├ Stack list │                        │ Dither        │
│ ├ Blend mode │                        │ ├ Algorithm   │
│ ├ Visibility │                        │ ├ Strength    │
│              │                        │               │
│ Composition  │                        │ Color         │
│ ├ Masks      │                        │ ├ Mode        │
│ └ Feedback   │                        │ ├ Custom      │
│              │                        │               │
│ Global       │                        │ Effects       │
│ ├ Tonemap    │                        │ ├ FX preset   │
│ ├ BG Color   │                        │ ├ Shaders     │
│ ├ Aspect     │                        │ ├ Particles   │
│ └ Export     │                        │               │
│              │                        │ Adjustments   │
│              │                        │ ├ Bri/Con/Opa │
│              │                        │ ├ Vignette    │
│              │                        │ └ Mouse       │
└──────────────┴────────────────────────┴───────────────┘
```

### Component Tree
```
App.tsx
├── LeftSidebar.tsx (280px, collapsible)
│   ├── SourcePanel.tsx (existing upload + new generative selector)
│   ├── LayerStack.tsx (vertical list, drag reorder, blend mode, visibility)
│   ├── CompositionPanel.tsx (masks + feedback)
│   └── GlobalPanel.tsx (tonemap + bg + aspect + export/save)
│
├── AsciiCanvas.tsx (center)
│
└── RightSidebar.tsx (300px, collapsible)
    ├── StylePanel.tsx (art style + style-specific + charset + font)
    ├── DitherPanel.tsx (algorithm + strength + bg/inverse dither)
    ├── ColorPanel.tsx (mode + custom + invert)
    ├── EffectsPanel.tsx (FX preset + shader chain editor + particles)
    └── AdjustmentsPanel.tsx (brightness/contrast/opacity + vignette + mouse)
```

All panels use shadcn `Collapsible`. ShaderChainEditor is a sortable list of shader cards. LayerStack is a vertical sortable list with inline blend mode.

### Migration from Current UI
- `ControlsPanel.tsx` splits into StylePanel + DitherPanel + ColorPanel + AdjustmentsPanel + EffectsPanel
- `LayerTabs.tsx` → `LayerStack.tsx` (vertical list instead of tabs)
- `Sidebar.tsx` → `RightSidebar.tsx` (narrowed scope)
- New `LeftSidebar.tsx` for composition/source/global
- Existing `SourceUpload.tsx` moves into SourcePanel
- Existing shortcuts preserved

### New shadcn Components Needed
- `Collapsible` (panel sections)
- `DropdownMenu` (blend mode, mask type, shader type selectors)
- `Switch` (feedback enable, tonemap enable, shader enable)
- `Separator` (panel dividers)
- Existing: Button, Slider, Select, Tabs, Toggle, Tooltip, Badge, Dialog

# Glyph

Real-time ASCII art generator. Transform images and video into 9 art styles with live dithering, animated FX, and multi-layer compositing — entirely in the browser.

## Features

- **9 Art Styles** — Classic ASCII, Braille, Halftone, Dot Cross, Line, Particles, Claude Code, Retro, Terminal
- **8 Dithering Algorithms** — Floyd-Steinberg, Bayer (8x8), Atkinson, Jarvis-Judice-Ninke, Stucki, Sierra, Sierra Lite, or none
- **Animated FX** — Noise (simplex), Intervals, Beam, Glitch, CRT (phosphor mask + scanlines + bloom), Matrix Rain
- **8 Color Modes** — Grayscale, Full Color, Matrix, Amber, Sepia, Cool Blue, Neon, Custom hex
- **Multi-Layer System** — Stack multiple layers with independent settings
- **Live Camera Input** — Webcam with device switching and quality control
- **Export** — PNG (1x/2x/4x), self-contained HTML, React component (.tsx), JSON preset
- **Presets** — Save/load/import parameter presets, 10+ built-in templates
- **Keyboard Shortcuts** — Full shortcut system (press `?` to see all)
- **Undo/Redo** — 50-state history with Ctrl+Z / Ctrl+Shift+Z
- **Dark/Light Theme** — Toggle with one click

## Tech Stack

- **Rendering** — Canvas 2D, sRGB-correct luminance (BT.709), simplex noise
- **Frontend** — React 19, TypeScript, Vite 8, Tailwind CSS v4, shadcn/ui, Zustand
- **Storage** — IndexedDB (gallery + presets), fully client-side

## Quick Start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173`, drop an image, and start tweaking.

## Build

```bash
pnpm build
pnpm preview
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save PNG |
| `Ctrl+E` | Export dialog |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+R` | Randomize |
| `F` | Fullscreen |
| `H` | Toggle sidebar |
| `[ / ]` | Switch layers |
| `1-9` | Art style |
| `?` | Shortcuts help |

## Architecture

```
src/
├── engine/           # Rendering pipeline (pure Canvas 2D, no WebGL)
│   ├── AsciiRenderer.ts   # Main render loop, canvas management
│   ├── brightness.ts      # sRGB linearization + BT.709 luminance
│   ├── dither.ts          # 8 dithering algorithms (generic diffusion kernel)
│   ├── noise.ts           # 2D/3D simplex noise + fBm
│   ├── fx.ts              # Pre-render (noise, intervals, beam, glitch) + post-render (CRT, matrix-rain)
│   ├── charsets.ts        # Character mapping tables
│   ├── renderUtils.ts     # Colors, edge detection, vignette, mouse interaction
│   └── styles/            # 9 independent art style renderers
├── components/       # React UI (shadcn/ui)
├── store/            # Zustand state management
├── hooks/            # Keyboard shortcuts
├── lib/              # Export generators, DB, templates
└── types/            # TypeScript type definitions
```

## License

MIT

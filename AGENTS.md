# ASCII Dither - ASC11 Clone

## Architecture

**Stack:** Vite 8 + React 19 + TypeScript SPA (100% client-side, no backend)

**State:** Zustand store (`src/store/useStore.ts`) — single source of truth for all app state including layers, source, UI state

**Rendering:** HTML5 Canvas2D API via `AsciiRenderer` class (`src/engine/AsciiRenderer.ts`) — requestAnimationFrame loop, no WebGL

**Persistence:** IndexedDB (`src/lib/db.ts`) for gallery assets and presets. No auth — everything browser-local.

**Routing:** react-router-dom (/, /terms, /privacy)

## Directory Structure

```
src/
  engine/           # Rendering pipeline
    AsciiRenderer.ts  # Main renderer class (canvas, loop, resize, source)
    brightness.ts     # Pixel brightness calculation
    charsets.ts       # Character set definitions
    dither.ts         # Floyd-Steinberg, Bayer, Atkinson dithering
    fx.ts             # 6 FX presets (noise, intervals, beam, glitch, crt, matrix-rain)
    styles/           # 9 art style renderers
      classic.ts, braille.ts, halftone.ts, dotcross.ts, line.ts,
      particles.ts, claude.ts, retro.ts, terminal.ts
  components/       # React UI
    AsciiCanvas.tsx   # Canvas area with renderer lifecycle
    Sidebar.tsx       # Right sidebar shell
    ControlsPanel.tsx # All layer controls (art style, sliders, FX, etc.)
    SourceUpload.tsx  # Image/video/camera source input
    FooterBar.tsx     # Status bar (FMT, STYLE, etc.) + actions
    ... (20+ components)
  store/            # Zustand state
  lib/              # IndexedDB, templates
  styles/           # CSS modules (variables, shell, canvas, controls, etc.)
  types/            # TypeScript type definitions
```

## Key Patterns

- **Custom events** (`camera-ready`, `camera-stop`) bridge SourceUpload ↔ AsciiCanvas for video/camera sources
- **Layer system** — each layer has ~50+ configurable properties (art style, dithering, color, FX, mouse interaction)
- **2-column slider grid** for adjustments matching original site layout
- **FX direction field** lookup via `getDirectionField()` helper with dynamic property access

## Features (matching asc11.com minus WebGL)

- 9 art styles: Classic, Braille, Halftone, Dot Cross, Line, Particles, Claude Code, Retro, Terminal
- 4 dithering algorithms: None, Floyd-Steinberg, Bayer, Atkinson
- 10 character sets with descriptive labels
- 6 FX presets: Noise Field, Intervals, Beam Sweep, Glitch, CRT Monitor, Matrix Rain
- 5 color modes: Grayscale, Full Color, Matrix Green, Amber Monitor, Custom
- 8 directional controls per FX preset
- Mouse interaction (Attract/Push with strength, area, spread)
- Multi-layer support with add/remove
- Image, video, and live camera sources
- Gallery (IndexedDB), Presets, Templates
- Dark/light theme toggle
- PNG export and preset JSON export
- Drag-and-drop file import

## Known Issues

- No WebGL layer support (intentionally excluded per spec)
- No authentication (all local storage)

## Build & Dev

```bash
pnpm install
pnpm dev          # Vite dev server
pnpm build        # Production build
npx tsc --noEmit  # Type check
```

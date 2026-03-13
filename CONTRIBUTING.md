# Contributing to Glyph

## Development Setup

```bash
git clone https://github.com/Codeptor/glyph.git
cd glyph
pnpm install
pnpm dev
```

## Code Style

- TypeScript strict mode
- ESLint flat config (`eslint.config.js`)
- Tailwind CSS v4 with shadcn/ui components

## Commits

- Concise, imperative messages: `fix: controls scroll`, `feat: add CRT bloom`
- Scoped prefixes when relevant: `fix(engine):`, `feat(ui):`
- Small, revertible commits

## Architecture

See `AGENTS.md` for detailed architecture docs.

Engine code lives in `src/engine/` — pure TypeScript, no React dependencies.
UI code lives in `src/components/` — React + shadcn/ui.
State lives in `src/store/` — Zustand.

## Adding an Art Style

1. Create `src/engine/styles/yourStyle.ts` implementing the `RenderFn` type from `styles/types.ts`
2. Register it in `src/engine/styles/index.ts`
3. Add the type to `ArtStyle` union in `src/types/index.ts`
4. Add UI controls in `src/components/ControlsPanel.tsx`

## Adding a Dithering Algorithm

1. Define a `DiffusionKernel` in `src/engine/dither.ts` (see existing ones for pattern)
2. Add to `DITHER_FUNCTIONS` record
3. Add the type to `DitherAlgorithm` union in `src/types/index.ts`
4. Add to UI dropdown in `src/components/ControlsPanel.tsx`

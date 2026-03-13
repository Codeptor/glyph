import type { ArtStyle } from '@/types'
import type { RenderContext } from './types.ts'
import { renderClassic } from './classic.ts'
import { renderBraille } from './braille.ts'
import { renderHalftone } from './halftone.ts'
import { renderDotCross } from './dotcross.ts'
import { renderLine } from './line.ts'
import { renderParticles } from './particles.ts'
import { renderClaude } from './claude.ts'
import { renderRetro } from './retro.ts'
import { renderTerminal } from './terminal.ts'

export type { RenderContext } from './types.ts'

export const STYLE_RENDERERS: Record<ArtStyle, (ctx: RenderContext) => void> = {
  classic: renderClassic,
  braille: renderBraille,
  halftone: renderHalftone,
  dotcross: renderDotCross,
  line: renderLine,
  particles: renderParticles,
  'claude-code': renderClaude,
  retro: renderRetro,
  terminal: renderTerminal,
}

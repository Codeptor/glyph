import type { RenderContext } from './types.ts'
import { getCharset, getCharForBrightness } from '@/engine/charsets.ts'
import { getClaudeColor, getVignetteFactor, getMouseOffset } from '@/engine/renderUtils.ts'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function renderClaude(rc: RenderContext): void {
  const { ctx, brightnessGrid, cols, rows, layer, cellWidth, cellHeight, mouseX, mouseY } = rc
  const chars = getCharset('blocks', layer.customCharset)

  ctx.font = `${layer.fontSize}px "${layer.font}"`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      let b = brightnessGrid[i]

      const vFactor = getVignetteFactor(x, y, cols, rows, layer.vignette)
      ctx.globalAlpha = layer.opacity * vFactor
      if (ctx.globalAlpha <= 0.002) continue

      if (layer.invertColor) b = 1 - b
      b = clamp(b, 0, 1)

      const ch = getCharForBrightness(b, chars)
      if (ch === ' ') continue

      ctx.fillStyle = getClaudeColor(b)

      const { ox, oy } = getMouseOffset(
        x, y, cellWidth, cellHeight, mouseX, mouseY,
        layer.mouseAreaSize, layer.mouseSpread, layer.hoverStrength, layer.mouseInteraction,
      )
      ctx.fillText(ch, x * cellWidth + ox, y * cellHeight + oy)
    }
  }
  ctx.globalAlpha = 1
}

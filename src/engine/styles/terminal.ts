import type { RenderContext } from './types.ts'
import { getTerminalCharset, getCharForBrightness } from '@/engine/charsets.ts'
import { getTerminalColor, getVignetteFactor, getMouseOffset } from '@/engine/renderUtils.ts'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function renderTerminal(rc: RenderContext): void {
  const { ctx, brightnessGrid, cols, rows, layer, cellWidth, cellHeight, mouseX, mouseY } = rc
  const chars = getTerminalCharset(layer.terminalCharset)

  ctx.font = `${layer.fontSize}px "VT323", monospace`
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

      // gamma curve matching original
      const adjusted = Math.pow(b, 0.82)
      const ch = getCharForBrightness(adjusted, chars)
      if (ch === ' ') continue

      ctx.fillStyle = getTerminalColor(b, x, y)

      const { ox, oy } = getMouseOffset(
        x, y, cellWidth, cellHeight, mouseX, mouseY,
        layer.mouseAreaSize, layer.mouseSpread, layer.hoverStrength, layer.mouseInteraction,
      )
      ctx.fillText(ch, x * cellWidth + ox, y * cellHeight + oy)
    }
  }
  ctx.globalAlpha = 1
}

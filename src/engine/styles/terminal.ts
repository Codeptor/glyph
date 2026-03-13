import type { RenderContext } from './types.ts'
import { getTerminalCharset, getCharForBrightness } from '@/engine/charsets.ts'

export function renderTerminal(rc: RenderContext): void {
  const { ctx, brightnessGrid, cols, rows, layer, cellWidth, cellHeight } = rc
  const chars = getTerminalCharset(layer.terminalCharset)

  ctx.save()
  ctx.globalAlpha = layer.opacity
  ctx.font = `${layer.fontSize}px "VT323", monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const b = brightnessGrid[i]
      if (b < 0.03) continue

      const ch = getCharForBrightness(b, chars)
      if (ch === ' ') continue

      // green tint palette: darker cells get deeper green
      const r = Math.round(b * 30)
      const g = Math.round(b * 255)
      const bl = Math.round(b * 60)

      ctx.fillStyle = `rgb(${r},${g},${bl})`
      ctx.fillText(ch, x * cellWidth, y * cellHeight)
    }
  }

  ctx.restore()
}

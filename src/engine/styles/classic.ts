import type { RenderContext } from './types.ts'
import { getCharset, getCharForBrightness } from '@/engine/charsets.ts'
import { getColorForMode, getVignetteFactor, getMouseOffset } from '@/engine/renderUtils.ts'

export function renderClassic(rc: RenderContext): void {
  const { ctx, brightnessGrid, colorGrid, cols, rows, layer, cellWidth, cellHeight, mouseX, mouseY } = rc
  const chars = getCharset(layer.characterSet, layer.customCharset)

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
      b = Math.max(0, Math.min(1, b))

      const ch = getCharForBrightness(b, chars)
      if (ch === ' ') continue

      const color = getColorForMode(b, colorGrid[i], layer.colorMode, layer.customColor)
      ctx.fillStyle = color

      const { ox, oy } = getMouseOffset(
        x, y, cellWidth, cellHeight, mouseX, mouseY,
        layer.mouseAreaSize, layer.mouseSpread, layer.hoverStrength, layer.mouseInteraction,
      )
      ctx.fillText(ch, x * cellWidth + ox, y * cellHeight + oy)
    }
  }
  ctx.globalAlpha = 1
}

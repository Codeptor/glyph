import type { RenderContext } from './types.ts'
import { getCharset, getCharForBrightness } from '@/engine/charsets.ts'
import { getRetroColor, getVignetteFactor, getMouseOffset } from '@/engine/renderUtils.ts'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function renderRetro(rc: RenderContext): void {
  const { ctx, brightnessGrid, cols, rows, layer, cellWidth, cellHeight, mouseX, mouseY } = rc
  const chars = getCharset(layer.characterSet, layer.customCharset)
  const retroNoise = clamp(layer.retroNoise, 0, 1)

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

      // retro character selection with grain and posterization
      const grain = (Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233) + 1) * 0.5
      const jitter = (grain - 0.5) * retroNoise * 0.22
      let adjusted = clamp(Math.pow(b, 0.78) + jitter, 0, 1)
      const bands = 10 + Math.round(retroNoise * 16)
      adjusted = Math.round(adjusted * bands) / Math.max(1, bands)

      const ch = getCharForBrightness(adjusted, chars)
      if (ch === ' ') continue

      const color = getRetroColor(b, x, y, cols, rows, retroNoise, layer.retroDuotone)
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

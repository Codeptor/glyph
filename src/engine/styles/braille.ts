import type { RenderContext } from './types.ts'
import { getBrailleCharset, getCharForBrightness } from '@/engine/charsets.ts'
import { getLocalEdgeContrast, getColorForMode, getVignetteFactor, getMouseOffset } from '@/engine/renderUtils.ts'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function renderBraille(rc: RenderContext): void {
  const { ctx, brightnessGrid, colorGrid, cols, rows, layer, cellWidth, cellHeight, mouseX, mouseY } = rc
  const charset = getBrailleCharset(layer.brailleVariant)

  ctx.font = `${layer.fontSize}px "${layer.font}"`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  const variantBias = layer.brailleVariant === 'dense' ? 0.11
    : layer.brailleVariant === 'sparse' ? -0.08
    : 0
  const brailleVariantExtra = layer.brailleVariant === 'dense' ? 10
    : layer.brailleVariant === 'sparse' ? -4
    : 4

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      let b = brightnessGrid[i]

      const vFactor = getVignetteFactor(x, y, cols, rows, layer.vignette)
      ctx.globalAlpha = layer.opacity * vFactor
      if (ctx.globalAlpha <= 0.002) continue

      if (layer.invertColor) b = 1 - b
      b = clamp(b, 0, 1)

      const edgeContrast = getLocalEdgeContrast(brightnessGrid, x, y, cols, rows)
      const brailleBoost = (8 + edgeContrast * 40 + brailleVariantExtra) / 255
      const boosted = clamp(b + brailleBoost, 0, 1)

      const screen =
        (Math.sin((x * 0.73 + y * 0.41) * 1.37) +
          Math.cos((x * 0.29 - y * 0.88) * 1.11) + 2) * 0.25
      const concentration = clamp(
        edgeContrast * 1.55 + Math.max(0, boosted - 0.45) * 0.28,
        0, 1,
      )
      const adjusted = clamp(
        Math.pow(boosted, 0.88) * 0.82 +
          screen * 0.11 +
          concentration * 0.24 +
          variantBias,
        0, 1,
      )

      const ch = getCharForBrightness(adjusted, charset)
      if (ch === ' ') continue

      const color = getColorForMode(boosted, colorGrid[i], layer.colorMode, layer.customColor)
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

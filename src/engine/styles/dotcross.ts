import type { RenderContext } from './types.ts'
import { getLocalEdgeContrast, getColorForMode, getVignetteFactor, getMouseOffset } from '@/engine/renderUtils.ts'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

const DOT_RAMP = '  .\u00b7:oO'
const CROSS_RAMP = '  \u00b7+xX#'

export function renderDotCross(rc: RenderContext): void {
  const { ctx, brightnessGrid, colorGrid, cols, rows, layer, cellWidth, cellHeight, mouseX, mouseY } = rc

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

      const edgeContrast = getLocalEdgeContrast(brightnessGrid, x, y, cols, rows)

      const screen =
        (Math.sin((x * 0.82 + y * 0.33) * 1.55) +
          Math.cos((x * 0.27 - y * 0.94) * 1.25) + 2) * 0.25
      const adjusted = clamp(Math.pow(b, 0.9) * 0.82 + screen * 0.18, 0, 1)

      const dotIdx = Math.floor(adjusted * (DOT_RAMP.length - 1))
      const crossIdx = Math.floor(adjusted * (CROSS_RAMP.length - 1))

      const edgeMix = clamp(edgeContrast * 1.4 + Math.max(0, adjusted - 0.5) * 0.22, 0, 1)
      const weave =
        (Math.sin((x + 1) * 1.71 + (y + 1) * 2.37) +
          Math.cos((x + 1) * 0.83 - (y + 1) * 1.29) + 2) * 0.25
      const useCross = edgeMix > clamp(0.46 + weave * 0.28, 0, 1)

      const ch = useCross
        ? CROSS_RAMP[clamp(crossIdx, 0, CROSS_RAMP.length - 1)]
        : DOT_RAMP[clamp(dotIdx, 0, DOT_RAMP.length - 1)]
      if (!ch || ch === ' ') continue

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

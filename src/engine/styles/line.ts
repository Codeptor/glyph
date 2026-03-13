import type { RenderContext } from './types.ts'
import { getColorForMode, getVignetteFactor, getMouseOffset } from '@/engine/renderUtils.ts'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function renderLine(rc: RenderContext): void {
  const { ctx, brightnessGrid, colorGrid, cols, rows, layer, cellWidth, cellHeight, mouseX, mouseY } = rc
  const lengthScale = clamp(layer.lineLength, 0.1, 2.5)
  const widthScale = clamp(layer.lineWidth, 0.2, 2.5)
  const thicknessSetting = clamp(layer.lineThickness, 0.2, 8)
  const rotationDeg = layer.lineRotation

  ctx.save()
  ctx.lineCap = 'round'

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      let b = brightnessGrid[i]

      const vFactor = getVignetteFactor(x, y, cols, rows, layer.vignette)
      ctx.globalAlpha = layer.opacity * vFactor
      if (ctx.globalAlpha <= 0.002) continue

      if (layer.invertColor) b = 1 - b
      b = clamp(b, 0, 1)

      const screen =
        (Math.sin((x * 0.79 + y * 0.41) * 1.37) +
          Math.cos((x * 0.33 - y * 0.93) * 1.09) + 2) * 0.25
      const angle = (rotationDeg * Math.PI) / 180 + (screen - 0.5) * 0.55

      const spanBase = Math.max(0.8, Math.min(cellWidth, cellHeight) * widthScale)
      const span = spanBase * clamp(b * lengthScale, 0.05, 1.5)
      if (span < 0.6) continue

      const { ox, oy } = getMouseOffset(
        x, y, cellWidth, cellHeight, mouseX, mouseY,
        layer.mouseAreaSize, layer.mouseSpread, layer.hoverStrength, layer.mouseInteraction,
      )
      const centerX = x * cellWidth + cellWidth / 2 + ox
      const centerY = y * cellHeight + cellHeight / 2 + oy

      const half = span * 0.5
      const x0 = centerX - Math.cos(angle) * half
      const y0 = centerY - Math.sin(angle) * half
      const x1 = centerX + Math.cos(angle) * half
      const y1 = centerY + Math.sin(angle) * half

      const thicknessPx = clamp(thicknessSetting, 0.2, Math.max(0.2, Math.min(cellWidth, cellHeight) * 1.4))

      const color = getColorForMode(b, colorGrid[i], layer.colorMode, layer.customColor)
      ctx.strokeStyle = color
      ctx.lineWidth = thicknessPx

      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y1)
      ctx.stroke()
    }
  }

  ctx.restore()
}

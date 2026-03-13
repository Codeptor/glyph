import type { RenderContext } from './types.ts'
import { getColorForMode, getVignetteFactor, getMouseOffset } from '@/engine/renderUtils.ts'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function drawRegularPolygon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  baseRotation: number,
): void {
  if (radius <= 0 || sides < 3) return
  for (let i = 0; i < sides; i++) {
    const angle = baseRotation + (i / sides) * Math.PI * 2
    const px = cx + Math.cos(angle) * radius
    const py = cy + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

function drawHalftoneShape(
  ctx: CanvasRenderingContext2D,
  shape: string,
  centerX: number,
  centerY: number,
  radius: number,
  rotationDeg: number,
): void {
  if (radius <= 0) return
  const rotation = (rotationDeg * Math.PI) / 180
  switch (shape) {
    case 'square': {
      const side = radius * 2
      if (Math.abs(rotation) <= 0.0001) {
        ctx.fillRect(centerX - radius, centerY - radius, side, side)
        return
      }
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation)
      ctx.fillRect(-radius, -radius, side, side)
      ctx.restore()
      return
    }
    case 'diamond':
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation)
      ctx.beginPath()
      drawRegularPolygon(ctx, 0, 0, radius, 4, Math.PI / 4)
      ctx.fill()
      ctx.restore()
      return
    case 'pentagon':
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation)
      ctx.beginPath()
      drawRegularPolygon(ctx, 0, 0, radius, 5, -Math.PI / 2)
      ctx.fill()
      ctx.restore()
      return
    case 'hexagon':
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation)
      ctx.beginPath()
      drawRegularPolygon(ctx, 0, 0, radius, 6, -Math.PI / 2)
      ctx.fill()
      ctx.restore()
      return
    case 'circle':
    default:
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()
  }
}

export function renderHalftone(rc: RenderContext): void {
  const { ctx, brightnessGrid, colorGrid, cols, rows, layer, cellWidth, cellHeight, mouseX, mouseY } = rc
  const halftoneSize = clamp(layer.halftoneSize, 0.4, 2.2)
  const halftoneRotation = clamp(layer.halftoneRotation, -180, 180)

  ctx.save()

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
        (Math.sin((x * 0.82 + y * 0.33) * 1.55) +
          Math.cos((x * 0.27 - y * 0.94) * 1.25) + 2) * 0.25
      const dotLevel = clamp(Math.pow(b, 0.92) * 0.82 + screen * 0.18, 0, 1)
      const maxRadius = Math.max(0.1, Math.min(cellWidth, cellHeight) * 0.5)
      const radius = maxRadius * dotLevel * halftoneSize
      if (radius < 0.35) continue

      const color = getColorForMode(b, colorGrid[i], layer.colorMode, layer.customColor)
      ctx.fillStyle = color

      const { ox, oy } = getMouseOffset(
        x, y, cellWidth, cellHeight, mouseX, mouseY,
        layer.mouseAreaSize, layer.mouseSpread, layer.hoverStrength, layer.mouseInteraction,
      )
      const cx = x * cellWidth + cellWidth / 2 + ox
      const cy = y * cellHeight + cellHeight / 2 + oy

      drawHalftoneShape(ctx, layer.halftoneShape, cx, cy, radius, halftoneRotation)
    }
  }

  ctx.restore()
}

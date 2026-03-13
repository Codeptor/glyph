import type { RenderContext } from './types.ts'

function drawPentagon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
): void {
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}

function drawHexagon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
): void {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 6
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(cx, cy - r)
  ctx.lineTo(cx + r, cy)
  ctx.lineTo(cx, cy + r)
  ctx.lineTo(cx - r, cy)
  ctx.closePath()
  ctx.fill()
}

export function renderHalftone(rc: RenderContext): void {
  const { ctx, brightnessGrid, colorGrid, cols, rows, layer, cellWidth, cellHeight } = rc
  const rotation = (layer.halftoneRotation * Math.PI) / 180

  ctx.save()
  ctx.globalAlpha = layer.opacity

  if (rotation !== 0) {
    const cx = (cols * cellWidth) / 2
    const cy = (rows * cellHeight) / 2
    ctx.translate(cx, cy)
    ctx.rotate(rotation)
    ctx.translate(-cx, -cy)
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const b = brightnessGrid[i]
      if (b < 0.02) continue

      const maxR = Math.min(cellWidth, cellHeight) / 2
      const radius = b * maxR * layer.halftoneSize
      if (radius < 0.3) continue

      const px = x * cellWidth + cellWidth / 2
      const py = y * cellHeight + cellHeight / 2
      const [r, g, bl] = colorGrid[i]

      switch (layer.colorMode) {
        case 'fullcolor':
          ctx.fillStyle = `rgb(${r},${g},${bl})`
          break
        case 'matrix':
          ctx.fillStyle = `rgba(0,255,65,${b})`
          break
        case 'amber':
          ctx.fillStyle = `rgba(255,176,0,${b})`
          break
        case 'custom':
          ctx.fillStyle = layer.customColor
          break
        default: {
          const v = Math.round(b * 255)
          ctx.fillStyle = `rgb(${v},${v},${v})`
        }
      }

      switch (layer.halftoneShape) {
        case 'circle':
          ctx.beginPath()
          ctx.arc(px, py, radius, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'square':
          ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2)
          break
        case 'diamond':
          drawDiamond(ctx, px, py, radius)
          break
        case 'pentagon':
          drawPentagon(ctx, px, py, radius)
          break
        case 'hexagon':
          drawHexagon(ctx, px, py, radius)
          break
      }
    }
  }

  ctx.restore()
}

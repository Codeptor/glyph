import type { RenderContext } from './types.ts'

export function renderLine(rc: RenderContext): void {
  const { ctx, brightnessGrid, colorGrid, cols, rows, layer, cellWidth, cellHeight } = rc
  const rotation = (layer.lineRotation * Math.PI) / 180

  ctx.save()
  ctx.globalAlpha = layer.opacity

  if (rotation !== 0) {
    const cx = (cols * cellWidth) / 2
    const cy = (rows * cellHeight) / 2
    ctx.translate(cx, cy)
    ctx.rotate(rotation)
    ctx.translate(-cx, -cy)
  }

  ctx.lineCap = 'round'

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const b = brightnessGrid[i]
      if (b < 0.02) continue

      const px = x * cellWidth
      const py = y * cellHeight + cellHeight / 2
      const [r, g, bl] = colorGrid[i]

      switch (layer.colorMode) {
        case 'fullcolor':
          ctx.strokeStyle = `rgb(${r},${g},${bl})`
          break
        case 'matrix':
          ctx.strokeStyle = `rgba(0,255,65,${b})`
          break
        case 'amber':
          ctx.strokeStyle = `rgba(255,176,0,${b})`
          break
        case 'custom':
          ctx.strokeStyle = layer.customColor
          break
        default: {
          const v = Math.round(b * 255)
          ctx.strokeStyle = `rgb(${v},${v},${v})`
        }
      }

      const len = cellWidth * layer.lineLength * layer.lineWidth * b
      const yOff = (1 - b) * cellHeight * 0.3
      ctx.lineWidth = layer.lineThickness * b

      ctx.beginPath()
      ctx.moveTo(px, py + yOff)
      ctx.lineTo(px + len, py + yOff)
      ctx.stroke()
    }
  }

  ctx.restore()
}

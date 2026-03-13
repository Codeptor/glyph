import type { RenderContext } from './types.ts'

export function renderDotCross(rc: RenderContext): void {
  const { ctx, brightnessGrid, colorGrid, cols, rows, layer, cellWidth, cellHeight } = rc

  ctx.save()
  ctx.globalAlpha = layer.opacity

  const maxR = Math.min(cellWidth, cellHeight) / 2

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const b = brightnessGrid[i]
      if (b < 0.02) continue

      const px = x * cellWidth + cellWidth / 2
      const py = y * cellHeight + cellHeight / 2
      const [r, g, bl] = colorGrid[i]

      switch (layer.colorMode) {
        case 'fullcolor':
          ctx.fillStyle = `rgb(${r},${g},${bl})`
          ctx.strokeStyle = `rgb(${r},${g},${bl})`
          break
        case 'matrix':
          ctx.fillStyle = `rgba(0,255,65,${b})`
          ctx.strokeStyle = `rgba(0,255,65,${b})`
          break
        case 'amber':
          ctx.fillStyle = `rgba(255,176,0,${b})`
          ctx.strokeStyle = `rgba(255,176,0,${b})`
          break
        case 'custom':
          ctx.fillStyle = layer.customColor
          ctx.strokeStyle = layer.customColor
          break
        default: {
          const v = Math.round(b * 255)
          ctx.fillStyle = `rgb(${v},${v},${v})`
          ctx.strokeStyle = `rgb(${v},${v},${v})`
        }
      }

      // dot
      const dotR = b * maxR * 0.4
      if (dotR > 0.2) {
        ctx.beginPath()
        ctx.arc(px, py, dotR, 0, Math.PI * 2)
        ctx.fill()
      }

      // cross
      const crossSize = b * maxR * 0.8
      if (crossSize > 0.3) {
        ctx.lineWidth = Math.max(0.5, b * 1.5)
        ctx.beginPath()
        ctx.moveTo(px - crossSize, py)
        ctx.lineTo(px + crossSize, py)
        ctx.moveTo(px, py - crossSize)
        ctx.lineTo(px, py + crossSize)
        ctx.stroke()
      }
    }
  }

  ctx.restore()
}

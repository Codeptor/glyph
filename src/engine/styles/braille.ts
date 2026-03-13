import type { RenderContext } from './types.ts'

const BRAILLE_BASE = 0x2800

// braille dot positions map 2x4 grid to bits:
// [0] [3]
// [1] [4]
// [2] [5]
// [6] [7]
const DOT_BITS = [
  [0, 3],
  [1, 4],
  [2, 5],
  [6, 7],
]

function getThreshold(variant: string): number {
  switch (variant) {
    case 'sparse':
      return 0.65
    case 'dense':
      return 0.35
    default:
      return 0.5
  }
}

export function renderBraille(rc: RenderContext): void {
  const { ctx, brightnessGrid, colorGrid, cols, rows, layer, cellWidth, cellHeight } = rc
  const threshold = getThreshold(layer.brailleVariant)

  ctx.font = `${layer.fontSize}px "${layer.font}"`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  ctx.globalAlpha = layer.opacity

  // each braille char represents 2x4 cells
  const bCols = Math.floor(cols / 2)
  const bRows = Math.floor(rows / 4)

  for (let by = 0; by < bRows; by++) {
    for (let bx = 0; bx < bCols; bx++) {
      let codePoint = BRAILLE_BASE
      let avgR = 0, avgG = 0, avgB = 0
      let count = 0

      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const sx = bx * 2 + dx
          const sy = by * 4 + dy
          if (sx >= cols || sy >= rows) continue

          const i = sy * cols + sx
          const b = brightnessGrid[i]
          const [r, g, bl] = colorGrid[i]
          avgR += r; avgG += g; avgB += bl
          count++

          if (b > threshold) {
            codePoint |= 1 << DOT_BITS[dy][dx]
          }
        }
      }

      if (codePoint === BRAILLE_BASE) continue

      if (count > 0) {
        avgR = Math.round(avgR / count)
        avgG = Math.round(avgG / count)
        avgB = Math.round(avgB / count)
      }

      switch (layer.colorMode) {
        case 'fullcolor':
          ctx.fillStyle = `rgb(${avgR},${avgG},${avgB})`
          break
        case 'matrix':
          ctx.fillStyle = '#00ff41'
          break
        case 'amber':
          ctx.fillStyle = '#ffb000'
          break
        case 'custom':
          ctx.fillStyle = layer.customColor
          break
        default: {
          const v = Math.round((0.299 * avgR + 0.587 * avgG + 0.114 * avgB))
          ctx.fillStyle = `rgb(${v},${v},${v})`
        }
      }

      const ch = String.fromCodePoint(codePoint)
      ctx.fillText(ch, bx * cellWidth * 2, by * cellHeight * 4)
    }
  }
  ctx.globalAlpha = 1
}

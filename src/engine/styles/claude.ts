import type { RenderContext } from './types.ts'

const CODE_CHARS = '{}<>/\\|=-+[]();:_~'

function cellRandom(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

export function renderClaude(rc: RenderContext): void {
  const { ctx, brightnessGrid, colorGrid, cols, rows, layer, cellWidth, cellHeight } = rc

  ctx.save()
  ctx.globalAlpha = layer.opacity
  ctx.font = `${layer.fontSize}px "${layer.font}"`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const b = brightnessGrid[i]
      if (b < 0.05) continue

      // skip based on density
      if (cellRandom(x, y) > layer.claudeDensity) continue

      const charIdx = Math.floor(cellRandom(x + 1, y + 1) * CODE_CHARS.length)
      const ch = CODE_CHARS[charIdx]

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

      ctx.fillText(ch, x * cellWidth, y * cellHeight)
    }
  }

  ctx.restore()
}

import type { RenderContext } from './types.ts'

// deterministic pseudo-random from cell coordinates
function cellRandom(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

export function renderParticles(rc: RenderContext): void {
  const { ctx, brightnessGrid, colorGrid, cols, rows, layer, cellWidth, cellHeight } = rc

  ctx.save()
  ctx.globalAlpha = layer.opacity
  ctx.font = `${layer.fontSize}px "${layer.font}"`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'

  const threshold = 0.15
  const ch = layer.particleChar || '*'

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const b = brightnessGrid[i]
      if (b < threshold) continue

      // skip based on density
      if (cellRandom(x, y) > layer.particleDensity) continue

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

      // vary size by brightness
      const size = Math.max(4, layer.fontSize * b * 1.5)
      ctx.font = `${size}px "${layer.font}"`
      ctx.fillText(ch, px, py)
    }
  }

  ctx.restore()
}

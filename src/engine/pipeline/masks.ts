import type { MaskConfig } from '@/types'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

/**
 * Generate a float32 mask array [0,1] for each cell in the grid.
 * 1.0 = fully visible, 0.0 = fully hidden.
 */
export function generateMask(
  config: MaskConfig,
  cols: number,
  rows: number,
  time: number,
): Float32Array {
  const mask = new Float32Array(cols * rows)
  if (config.type === 'none') {
    mask.fill(1)
    return mask
  }

  const { centerX, centerY, radius, innerRadius, feather } = config

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const u = cols > 1 ? x / (cols - 1) : 0.5
      const v = rows > 1 ? y / (rows - 1) : 0.5
      const i = y * cols + x

      let value = 0

      switch (config.type) {
        case 'circle': {
          const dx = u - centerX
          const dy = v - centerY
          const d = Math.sqrt(dx * dx + dy * dy)
          value = feather > 0
            ? clamp(1 - (d - radius) / feather, 0, 1)
            : d <= radius ? 1 : 0
          break
        }
        case 'rect': {
          const hw = radius
          const hh = radius * (rows / Math.max(cols, 1))
          const dx = Math.abs(u - centerX)
          const dy = Math.abs(v - centerY)
          const d = Math.max(dx - hw, dy - hh)
          value = feather > 0
            ? clamp(1 - d / feather, 0, 1)
            : d <= 0 ? 1 : 0
          break
        }
        case 'ring': {
          const dx = u - centerX
          const dy = v - centerY
          const d = Math.sqrt(dx * dx + dy * dy)
          const outer = feather > 0
            ? clamp(1 - (d - radius) / feather, 0, 1)
            : d <= radius ? 1 : 0
          const inner = feather > 0
            ? clamp(1 - (d - innerRadius) / feather, 0, 1)
            : d <= innerRadius ? 1 : 0
          value = outer - inner
          break
        }
        case 'gradient-h':
          value = clamp(u, 0, 1)
          break
        case 'gradient-v':
          value = clamp(v, 0, 1)
          break
        case 'gradient-radial': {
          const dx = u - centerX
          const dy = v - centerY
          const d = Math.sqrt(dx * dx + dy * dy)
          value = clamp(1 - d / Math.max(radius, 0.01), 0, 1)
          break
        }
        case 'iris': {
          const progress = config.animDirection === 'in'
            ? clamp((time * config.animSpeed) % 2, 0, 1)
            : 1 - clamp((time * config.animSpeed) % 2, 0, 1)
          const currentRadius = progress * radius * 1.5
          const dx = u - centerX
          const dy = v - centerY
          const d = Math.sqrt(dx * dx + dy * dy)
          value = feather > 0
            ? clamp(1 - (d - currentRadius) / feather, 0, 1)
            : d <= currentRadius ? 1 : 0
          break
        }
        case 'wipe-h': {
          const progress = clamp((time * config.animSpeed * 0.5) % 1, 0, 1)
          const edge = config.animDirection === 'in' ? progress : 1 - progress
          value = feather > 0
            ? clamp(1 - (u - edge) / feather, 0, 1)
            : u <= edge ? 1 : 0
          break
        }
        case 'wipe-v': {
          const progress = clamp((time * config.animSpeed * 0.5) % 1, 0, 1)
          const edge = config.animDirection === 'in' ? progress : 1 - progress
          value = feather > 0
            ? clamp(1 - (v - edge) / feather, 0, 1)
            : v <= edge ? 1 : 0
          break
        }
        case 'dissolve': {
          const progress = clamp((time * config.animSpeed * 0.3) % 1, 0, 1)
          const noise = (Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1
          const absNoise = noise < 0 ? -noise : noise
          value = absNoise < progress ? 1 : 0
          break
        }
      }

      mask[i] = config.invert ? 1 - value : value
    }
  }

  return mask
}

/**
 * Apply a cell-resolution mask to a pixel canvas.
 * Zeroes out pixels where mask is 0.
 */
export function applyMaskToCanvas(
  ctx: CanvasRenderingContext2D,
  mask: Float32Array,
  cols: number,
  rows: number,
  width: number,
  height: number,
): void {
  const cellW = width / cols
  const cellH = height / rows
  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data

  for (let py = 0; py < height; py++) {
    const gridRow = Math.min(rows - 1, Math.floor(py / cellH))
    for (let px = 0; px < width; px++) {
      const gridCol = Math.min(cols - 1, Math.floor(px / cellW))
      const alpha = mask[gridRow * cols + gridCol]
      if (alpha >= 1) continue
      const idx = (py * width + px) * 4
      data[idx + 3] = Math.round(data[idx + 3] * alpha)
    }
  }

  ctx.putImageData(imgData, 0, 0)
}

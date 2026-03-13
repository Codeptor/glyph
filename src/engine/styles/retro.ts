import type { RenderContext } from './types.ts'
import type { RetroDuotone } from '@/types'
import { getCharset, getCharForBrightness } from '@/engine/charsets.ts'

interface DuotoneColors {
  dark: [number, number, number]
  light: [number, number, number]
}

const DUOTONE_MAP: Record<RetroDuotone, DuotoneColors> = {
  'amber-classic': {
    dark: [0, 0, 0],
    light: [255, 176, 0],
  },
  'cyan-night': {
    dark: [10, 10, 46],
    light: [0, 229, 255],
  },
  'violet-haze': {
    dark: [26, 10, 46],
    light: [191, 127, 255],
  },
  'lime-pulse': {
    dark: [10, 26, 10],
    light: [127, 255, 0],
  },
  'mono-ice': {
    dark: [10, 10, 20],
    light: [200, 230, 255],
  },
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function cellRandom(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 45.164) * 43758.5453
  return n - Math.floor(n)
}

export function renderRetro(rc: RenderContext): void {
  const { ctx, brightnessGrid, cols, rows, layer, cellWidth, cellHeight, time } = rc
  const chars = getCharset(layer.characterSet, layer.customCharset)
  const duo = DUOTONE_MAP[layer.retroDuotone]

  ctx.save()
  ctx.globalAlpha = layer.opacity
  ctx.font = `${layer.fontSize}px "${layer.font}"`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      let b = brightnessGrid[i]

      // film grain
      if (layer.retroNoise > 0) {
        const noise = (cellRandom(x, y, Math.floor(time * 10)) - 0.5) * layer.retroNoise * 0.3
        b = Math.max(0, Math.min(1, b + noise))
      }

      const ch = getCharForBrightness(b, chars)
      if (ch === ' ') continue

      const r = Math.round(lerp(duo.dark[0], duo.light[0], b))
      const g = Math.round(lerp(duo.dark[1], duo.light[1], b))
      const bl = Math.round(lerp(duo.dark[2], duo.light[2], b))

      ctx.fillStyle = `rgb(${r},${g},${bl})`
      ctx.fillText(ch, x * cellWidth, y * cellHeight)
    }
  }

  ctx.restore()
}

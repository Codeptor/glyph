import type { RenderContext } from './types.ts'
import { getCharset, getCharForBrightness } from '@/engine/charsets.ts'

function getColor(
  brightness: number,
  rgb: [number, number, number],
  colorMode: string,
  customColor: string,
  invertColor: boolean,
): string {
  const b = invertColor ? 1 - brightness : brightness
  const [r, g, bl] = rgb

  switch (colorMode) {
    case 'fullcolor': {
      const ir = invertColor ? 255 - r : r
      const ig = invertColor ? 255 - g : g
      const ib = invertColor ? 255 - bl : bl
      return `rgb(${ir},${ig},${ib})`
    }
    case 'matrix': {
      const F = Math.max(0, Math.min(255, Math.round(b * 255) + 25))
      return `rgb(${Math.floor(F * 0.2)},${F},${Math.floor(F * 0.3)})`
    }
    case 'amber': {
      const F = Math.max(0, Math.min(255, Math.round(b * 255) + 20))
      return `rgb(${F},${Math.floor(F * 0.7)},${Math.floor(F * 0.15)})`
    }
    case 'custom': {
      const m = Math.round(b * 255)
      const cr = parseInt(customColor.slice(1, 3), 16)
      const cg = parseInt(customColor.slice(3, 5), 16)
      const cb = parseInt(customColor.slice(5, 7), 16)
      return `rgb(${Math.round(cr * m / 255)},${Math.round(cg * m / 255)},${Math.round(cb * m / 255)})`
    }
    default: {
      const v = Math.round(b * 255)
      return `rgb(${v},${v},${v})`
    }
  }
}

function applyVignette(brightness: number, x: number, y: number, cols: number, rows: number, vignette: number): number {
  if (vignette <= 0) return brightness
  const cx = cols / 2
  const cy = rows / 2
  const maxDist = Math.sqrt(cx * cx + cy * cy)
  const dx = x - cx
  const dy = y - cy
  const dist = Math.sqrt(dx * dx + dy * dy) / maxDist
  const factor = 1 - dist * vignette
  return brightness * Math.max(0, factor)
}

function applyMouse(
  brightness: number,
  cellX: number,
  cellY: number,
  mouseX: number,
  mouseY: number,
  cellWidth: number,
  cellHeight: number,
  interaction: string,
  areaSize: number,
  strength: number,
): number {
  if (mouseX < 0 || mouseY < 0) return brightness
  const px = cellX * cellWidth + cellWidth / 2
  const py = cellY * cellHeight + cellHeight / 2
  const dist = Math.sqrt((px - mouseX) ** 2 + (py - mouseY) ** 2)
  if (dist > areaSize) return brightness
  const factor = 1 - dist / areaSize
  const delta = factor * (strength / 100)
  if (interaction === 'attract') {
    return Math.min(1, brightness + delta)
  }
  return Math.max(0, brightness - delta)
}

export function renderClassic(rc: RenderContext): void {
  const { ctx, brightnessGrid, colorGrid, cols, rows, layer, cellWidth, cellHeight, mouseX, mouseY } = rc
  const chars = getCharset(layer.characterSet, layer.customCharset)

  ctx.font = `${layer.fontSize}px "${layer.font}"`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      let b = brightnessGrid[i]

      b = applyVignette(b, x, y, cols, rows, layer.vignette)
      b = applyMouse(b, x, y, mouseX, mouseY, cellWidth, cellHeight, layer.mouseInteraction, layer.mouseAreaSize, layer.hoverStrength)
      b = Math.max(0, Math.min(1, b))

      if (layer.invertColor) b = 1 - b

      const ch = getCharForBrightness(b, chars)
      if (ch === ' ') continue

      const color = getColor(b, colorGrid[i], layer.colorMode, layer.customColor, false)
      ctx.fillStyle = color
      ctx.globalAlpha = layer.opacity
      ctx.fillText(ch, x * cellWidth, y * cellHeight)
    }
  }
  ctx.globalAlpha = 1
}

import type { RenderContext } from './types.ts'
import { getLocalEdgeContrast, getParticleColor, getVignetteFactor, getMouseOffset } from '@/engine/renderUtils.ts'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function renderParticles(rc: RenderContext): void {
  const { ctx, brightnessGrid, colorGrid, cols, rows, layer, cellWidth, cellHeight, mouseX, mouseY } = rc
  const density = clamp(layer.particleDensity, 0.05, 1)
  const ch = layer.particleChar || '*'

  ctx.font = `${layer.fontSize}px "${layer.font}"`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      let b = brightnessGrid[i]

      const vFactor = getVignetteFactor(x, y, cols, rows, layer.vignette)
      ctx.globalAlpha = layer.opacity * vFactor
      if (ctx.globalAlpha <= 0.002) continue

      if (layer.invertColor) b = 1 - b
      b = clamp(b, 0, 1)

      const edgeContrast = getLocalEdgeContrast(brightnessGrid, x, y, cols, rows)
      const particleBoost = (edgeContrast * 44 + (density - 0.5) * 12) / 255
      const boosted = clamp(b + particleBoost, 0, 1)

      const nx = cols > 1 ? (x / (cols - 1)) * 2 - 1 : 0
      const ny = rows > 1 ? (y / (rows - 1)) * 2 - 1 : 0
      const center = 1 - clamp(Math.sqrt(nx * nx + ny * ny), 0, 1)
      const centerBias = Math.pow(center, 1.35) * density * 0.42
      const edgeBoost = clamp(edgeContrast * 1.6 + Math.max(0, boosted - 0.45) * 0.24, 0, 1)
      const grain = (Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233) + 1) * 0.5
      const jitter = (grain - 0.5) * (0.18 - density * 0.08)
      const brightnessBias = clamp(layer.brightness / 50, -1, 1) * 0.12
      const threshold = clamp(
        1 - density - centerBias * 0.95 - edgeBoost * 0.42 + jitter * 0.9 - brightnessBias * 0.25,
        0.01, 0.95,
      )
      const fillBias = Math.pow(boosted, 0.82) * 0.18 + edgeBoost * 0.15 + Math.max(0, brightnessBias) * 0.1
      if (boosted + fillBias < threshold) continue

      const color = getParticleColor(
        boosted, colorGrid[i], layer.colorMode, layer.customColor,
        x, y, cols, rows, density, edgeContrast,
      )
      ctx.fillStyle = color

      const { ox, oy } = getMouseOffset(
        x, y, cellWidth, cellHeight, mouseX, mouseY,
        layer.mouseAreaSize, layer.mouseSpread, layer.hoverStrength, layer.mouseInteraction,
      )
      ctx.fillText(ch, x * cellWidth + ox, y * cellHeight + oy)
    }
  }
  ctx.globalAlpha = 1
}

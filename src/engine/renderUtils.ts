import type { RetroDuotone } from '@/types'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function lerpChannel(a: number, b: number, t: number): number {
  return clamp(Math.round(a + (b - a) * t), 0, 255)
}

// --- Edge detection (matching asc11.com Ux function) ---

export function getLocalEdgeContrast(
  grid: Float32Array,
  x: number,
  y: number,
  cols: number,
  rows: number,
): number {
  const idx = y * cols + x
  const center = grid[idx] ?? 0
  const left = x > 0 ? (grid[idx - 1] ?? center) : center
  const right = x + 1 < cols ? (grid[idx + 1] ?? center) : center
  const up = y > 0 ? (grid[idx - cols] ?? center) : center
  const down = y + 1 < rows ? (grid[idx + cols] ?? center) : center
  const gradientX = Math.abs(right - left)
  const gradientY = Math.abs(down - up)
  return clamp((gradientX + gradientY) / 2, 0, 1)
}

// --- Vignette (matching asc11.com render loop) ---

export function getVignetteFactor(
  x: number,
  y: number,
  cols: number,
  rows: number,
  strength: number,
): number {
  if (strength <= 0) return 1
  const nx = cols > 1 ? (x / (cols - 1)) * 2 - 1 : 0
  const ny = rows > 1 ? (y / (rows - 1)) * 2 - 1 : 0
  const radial = Math.sqrt(nx * nx + ny * ny) / Math.SQRT2
  const vignetteCore = Math.pow(clamp(1 - radial, 0, 1), 1 + strength * 2)
  return 1 - strength + strength * vignetteCore
}

// --- Mouse offset (matching asc11.com attract/push) ---

export function getMouseOffset(
  cellX: number,
  cellY: number,
  cellWidth: number,
  cellHeight: number,
  mouseX: number,
  mouseY: number,
  areaSize: number,
  spread: number,
  strength: number,
  interaction: string,
): { ox: number; oy: number } {
  if (mouseX < 0 || mouseY < 0) return { ox: 0, oy: 0 }
  const centerX = cellX * cellWidth + cellWidth / 2
  const centerY = cellY * cellHeight + cellHeight / 2
  const dx = mouseX - centerX
  const dy = mouseY - centerY
  const distance = Math.hypot(dx, dy)
  if (distance < 0.0001 || distance >= areaSize) return { ox: 0, oy: 0 }
  const falloff = 1 - distance / areaSize
  const spreadFactor = Math.pow(falloff, 1 / Math.max(0.25, spread))
  const direction = interaction === 'push' ? -1 : 1
  const pull = spreadFactor * spreadFactor * strength * direction
  return {
    ox: (dx / distance) * pull,
    oy: (dy / distance) * pull,
  }
}

// --- Color modes (matching asc11.com colorFromMode / qm) ---

export function getColorForMode(
  brightness: number,
  rgb: [number, number, number],
  colorMode: string,
  customColor: string,
): string {
  const gray = clamp(Math.round(brightness * 255), 0, 255)
  switch (colorMode) {
    case 'fullcolor':
      return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
    case 'matrix': {
      const F = clamp(gray + 25, 0, 255)
      return `rgb(${Math.floor(F * 0.2)},${F},${Math.floor(F * 0.3)})`
    }
    case 'amber': {
      const F = clamp(gray + 20, 0, 255)
      return `rgb(${F},${Math.floor(F * 0.7)},${Math.floor(F * 0.15)})`
    }
    case 'custom': {
      const raw = (customColor || '').trim()
      const match = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(raw)
      const hex = match
        ? match[1].length === 3
          ? match[1].split('').map((c) => c + c).join('')
          : match[1]
        : 'ffffff'
      const cr = parseInt(hex.slice(0, 2), 16)
      const cg = parseInt(hex.slice(2, 4), 16)
      const cb = parseInt(hex.slice(4, 6), 16)
      const intensity = gray / 255
      return `rgb(${clamp(Math.floor(cr * intensity), 0, 255)},${clamp(Math.floor(cg * intensity), 0, 255)},${clamp(Math.floor(cb * intensity), 0, 255)})`
    }
    default:
      return `rgb(${gray},${gray},${gray})`
  }
}

// --- Claude color (warm orange-amber) ---

export function getClaudeColor(brightness: number): string {
  const gray = clamp(Math.round(brightness * 255), 0, 255)
  const intensity = clamp(gray + 36, 0, 255)
  const r = clamp(Math.floor(intensity * 1.03), 0, 255)
  const g = clamp(Math.floor(intensity * 0.5), 0, 255)
  const b = clamp(Math.floor(intensity * 0.08), 0, 255)
  return `rgb(${r},${g},${b})`
}

// --- Terminal color (green phosphor + scanline) ---

export function getTerminalColor(
  brightness: number,
  x: number,
  y: number,
): string {
  const gray = clamp(Math.round(brightness * 255), 0, 255)
  const phosphor = clamp(gray + 32, 0, 255)
  const scanShade = ((x + y) & 1) === 0 ? 1 : 0.84
  const green = clamp(Math.floor(phosphor * scanShade), 0, 255)
  const r = clamp(Math.floor(green * 0.12), 0, 72)
  const b = clamp(Math.floor(green * 0.2), 0, 88)
  return `rgb(${r},${green},${b})`
}

// --- Retro duotone palettes ---

const RETRO_PALETTES: Record<
  RetroDuotone,
  { low: { r: number; g: number; b: number }; high: { r: number; g: number; b: number } }
> = {
  'amber-classic': { low: { r: 20, g: 12, b: 6 }, high: { r: 255, g: 223, b: 178 } },
  'cyan-night': { low: { r: 6, g: 16, b: 22 }, high: { r: 166, g: 240, b: 255 } },
  'violet-haze': { low: { r: 17, g: 10, b: 26 }, high: { r: 242, g: 198, b: 255 } },
  'lime-pulse': { low: { r: 10, g: 18, b: 8 }, high: { r: 226, g: 255, b: 162 } },
  'mono-ice': { low: { r: 12, g: 12, b: 12 }, high: { r: 245, g: 248, b: 255 } },
}

export function getRetroPalette(duotone: RetroDuotone) {
  return RETRO_PALETTES[duotone] || RETRO_PALETTES['amber-classic']
}

export function getRetroColor(
  brightness: number,
  x: number,
  y: number,
  cols: number,
  rows: number,
  retroNoise: number,
  duotone: RetroDuotone,
): string {
  const gray = clamp(Math.round(brightness * 255), 0, 255)
  const palette = getRetroPalette(duotone)
  const nx = cols > 1 ? (x / (cols - 1)) * 2 - 1 : 0
  const ny = rows > 1 ? (y / (rows - 1)) * 2 - 1 : 0
  const vignette = 1 - clamp(Math.sqrt(nx * nx + ny * ny), 0, 1) * 0.32
  const grain = Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233)
  const shimmer = Math.sin(x * 0.13 + y * 0.07) * 5
  const noise = Math.sin((x + 1) * 41.13 + (y + 1) * 17.37 + gray * 0.031)
  const warm = clamp(
    gray * 1.06 + 14 + shimmer + grain * (3 + retroNoise * 7.5) + noise * (1 + retroNoise * 16),
    0,
    255,
  )
  const tone = clamp(Math.pow((warm * vignette) / 255, 0.86), 0, 1)
  return `rgb(${lerpChannel(palette.low.r, palette.high.r, tone)},${lerpChannel(palette.low.g, palette.high.g, tone)},${lerpChannel(palette.low.b, palette.high.b, tone)})`
}

// --- Particle color with boost ---

export function getParticleColor(
  brightness: number,
  rgb: [number, number, number],
  colorMode: string,
  customColor: string,
  x: number,
  y: number,
  cols: number,
  rows: number,
  density: number,
  edgeContrast: number,
): string {
  const nx = cols > 1 ? (x / (cols - 1)) * 2 - 1 : 0
  const ny = rows > 1 ? (y / (rows - 1)) * 2 - 1 : 0
  const center = 1 - clamp(Math.sqrt(nx * nx + ny * ny), 0, 1)
  const centerGlow = Math.pow(center, 1.4) * density
  const edgeGlow = clamp(edgeContrast, 0, 1)
  const particleBoost = (centerGlow * (24 + density * 72) + edgeGlow * (18 + density * 34)) / 255
  const particleColorGain = 1 + centerGlow * 0.45 + edgeGlow * 0.22
  const boosted = clamp(brightness + particleBoost, 0, 1)

  if (colorMode === 'fullcolor') {
    const br = clamp(Math.floor(rgb[0] * particleColorGain + particleBoost * 255 * 0.22), 0, 255)
    const bg = clamp(Math.floor(rgb[1] * particleColorGain + particleBoost * 255 * 0.28), 0, 255)
    const bb = clamp(Math.floor(rgb[2] * particleColorGain + particleBoost * 255 * 0.2), 0, 255)
    return `rgb(${br},${bg},${bb})`
  }
  return getColorForMode(boosted, rgb, colorMode, customColor)
}

// --- BG Dither (per-cell dot rendering) ---

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

export function bayerThreshold(x: number, y: number): number {
  return BAYER_4X4[y % 4][x % 4] / 16
}

function getBgDitherTint(
  brightness: number,
  rgb: [number, number, number],
  artStyle: string,
  colorMode: string,
  customColor: string,
  retroDuotone: RetroDuotone,
): { r: number; g: number; b: number } {
  const gray = clamp(Math.round(brightness * 255), 0, 255)
  if (artStyle === 'claude-code') {
    const intensity = clamp(gray + 30, 0, 255)
    return {
      r: clamp(Math.floor(intensity * 1.02), 0, 255),
      g: clamp(Math.floor(intensity * 0.52), 0, 255),
      b: clamp(Math.floor(intensity * 0.1), 0, 255),
    }
  }
  if (artStyle === 'terminal') {
    const phosphor = clamp(gray + 28, 0, 255)
    return {
      r: clamp(Math.floor(phosphor * 0.14), 0, 96),
      g: phosphor,
      b: clamp(Math.floor(phosphor * 0.24), 0, 116),
    }
  }
  if (artStyle === 'retro') {
    const palette = getRetroPalette(retroDuotone)
    const sepia = clamp(Math.floor(gray * 1.04 + 12), 0, 255)
    const tone = clamp(Math.pow(sepia / 255, 0.94), 0, 1)
    return {
      r: lerpChannel(palette.low.r, palette.high.r, tone),
      g: lerpChannel(palette.low.g, palette.high.g, tone),
      b: lerpChannel(palette.low.b, palette.high.b, tone),
    }
  }
  if (colorMode === 'fullcolor') return { r: rgb[0], g: rgb[1], b: rgb[2] }
  if (colorMode === 'matrix') {
    const intensity = clamp(gray + 20, 0, 255)
    return {
      r: clamp(Math.floor(intensity * 0.2), 0, 255),
      g: intensity,
      b: clamp(Math.floor(intensity * 0.3), 0, 255),
    }
  }
  if (colorMode === 'amber') {
    const intensity = clamp(gray + 18, 0, 255)
    return {
      r: intensity,
      g: clamp(Math.floor(intensity * 0.72), 0, 255),
      b: clamp(Math.floor(intensity * 0.16), 0, 255),
    }
  }
  if (colorMode === 'custom') {
    const raw = (customColor || '').trim()
    const match = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(raw)
    const hex = match
      ? match[1].length === 3
        ? match[1].split('').map((c) => c + c).join('')
        : match[1]
      : 'ffffff'
    const cr = parseInt(hex.slice(0, 2), 16)
    const cg = parseInt(hex.slice(2, 4), 16)
    const cb = parseInt(hex.slice(4, 6), 16)
    const i = gray / 255
    return {
      r: clamp(Math.floor(cr * i), 0, 255),
      g: clamp(Math.floor(cg * i), 0, 255),
      b: clamp(Math.floor(cb * i), 0, 255),
    }
  }
  return { r: gray, g: gray, b: gray }
}

export function drawBgDitherPass(
  ctx: CanvasRenderingContext2D,
  grid: Float32Array,
  colorGrid: Array<[number, number, number]>,
  cols: number,
  rows: number,
  cellWidth: number,
  cellHeight: number,
  strength: number,
  time: number,
  artStyle: string,
  colorMode: string,
  customColor: string,
  retroDuotone: RetroDuotone,
  opacity: number,
): void {
  if (strength <= 0) return
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const b = grid[i]
      const tone = b
      const threshold = bayerThreshold(x, y)
      const drift = (Math.sin((x + 1) * 7.31 + (y + 1) * 3.17 + time * 0.75) + 1) * 0.5
      const pattern = threshold * 0.72 + drift * 0.28
      const coverage = clamp(tone * (0.92 + strength * 0.9) - pattern + 0.34, 0, 1)
      if (coverage <= 0.04) continue
      const dotFactor = clamp(0.18 + coverage * (0.85 + strength * 0.5), 0.12, 1)
      const dotSize = Math.max(0.45, Math.min(cellWidth, cellHeight) * dotFactor)
      const insetX = (cellWidth - dotSize) * 0.5
      const insetY = (cellHeight - dotSize) * 0.5
      const tint = getBgDitherTint(b, colorGrid[i], artStyle, colorMode, customColor, retroDuotone)
      const alpha = clamp(coverage * (0.05 + strength * 0.34), 0, 1)
      ctx.globalAlpha = opacity
      ctx.fillStyle = `rgba(${tint.r},${tint.g},${tint.b},${alpha.toFixed(3)})`
      ctx.fillRect(x * cellWidth + insetX, y * cellHeight + insetY, dotSize, dotSize)
    }
  }
}

// --- Inverse Dither fills ---

export function drawInverseDitherPass(
  ctx: CanvasRenderingContext2D,
  grid: Float32Array,
  cols: number,
  rows: number,
  cellWidth: number,
  cellHeight: number,
  strength: number,
  time: number,
  opacity: number,
  invertedBg: string,
): void {
  if (strength <= 0) return
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const b = grid[i]
      const coverage = computeInverseCoverage(b, x, y, strength, time)
      if (coverage <= 0.01) continue
      const invAlpha = clamp(coverage * (0.08 + strength * 0.34), 0, 1)
      if (invAlpha <= 0.005) continue
      ctx.globalAlpha = opacity * invAlpha
      ctx.fillStyle = invertedBg
      ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
    }
  }
}

// --- Border Glow Overlay (matching asc11.com zx function) ---

function getBorderGlowColor(
  artStyle: string,
  colorMode: string,
  customColor: string,
  retroDuotone: RetroDuotone,
): { r: number; g: number; b: number } {
  if (artStyle === 'terminal') return { r: 96, g: 255, b: 164 }
  if (artStyle === 'claude-code') return { r: 255, g: 186, b: 118 }
  if (artStyle === 'retro') {
    const palette = getRetroPalette(retroDuotone)
    return { r: palette.high.r, g: palette.high.g, b: palette.high.b }
  }
  if (colorMode === 'matrix') return { r: 110, g: 255, b: 175 }
  if (colorMode === 'amber') return { r: 255, g: 192, b: 118 }
  if (colorMode === 'custom') {
    const raw = (customColor || '').trim()
    const match = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(raw)
    const hex = match
      ? match[1].length === 3
        ? match[1].split('').map((c) => c + c).join('')
        : match[1]
      : 'ffffff'
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    }
  }
  if (colorMode === 'fullcolor') return { r: 176, g: 214, b: 255 }
  return { r: 255, g: 255, b: 255 }
}

export function drawBorderGlowOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  artStyle: string,
  colorMode: string,
  customColor: string,
  retroDuotone: RetroDuotone,
  strength: number,
  invertColor: boolean,
): void {
  const glowStrength = clamp(strength, 0, 1)
  if (width <= 0 || height <= 0 || glowStrength <= 0.001) return

  const glowColor = getBorderGlowColor(artStyle, colorMode, customColor, retroDuotone)
  const shortestEdge = Math.max(1, Math.min(width, height))
  const glowSize = Math.max(10, shortestEdge * (0.055 + glowStrength * 0.24))
  const edgeAlpha = clamp(0.018 + glowStrength * 0.34, 0, 0.62)
  const cornerRadius = glowSize * 1.35

  const edgeColor = (alpha: number) =>
    `rgba(${glowColor.r},${glowColor.g},${glowColor.b},${clamp(alpha, 0, 1).toFixed(3)})`

  ctx.save()
  ctx.globalCompositeOperation = invertColor ? 'multiply' : 'screen'
  ctx.globalAlpha = 1

  const top = ctx.createLinearGradient(0, 0, 0, glowSize)
  top.addColorStop(0, edgeColor(edgeAlpha * 1.12))
  top.addColorStop(0.58, edgeColor(edgeAlpha * 0.44))
  top.addColorStop(1, edgeColor(0))
  ctx.fillStyle = top
  ctx.fillRect(0, 0, width, glowSize)

  const bottom = ctx.createLinearGradient(0, height, 0, height - glowSize)
  bottom.addColorStop(0, edgeColor(edgeAlpha * 1.12))
  bottom.addColorStop(0.58, edgeColor(edgeAlpha * 0.44))
  bottom.addColorStop(1, edgeColor(0))
  ctx.fillStyle = bottom
  ctx.fillRect(0, height - glowSize, width, glowSize)

  const left = ctx.createLinearGradient(0, 0, glowSize, 0)
  left.addColorStop(0, edgeColor(edgeAlpha))
  left.addColorStop(0.58, edgeColor(edgeAlpha * 0.4))
  left.addColorStop(1, edgeColor(0))
  ctx.fillStyle = left
  ctx.fillRect(0, 0, glowSize, height)

  const right = ctx.createLinearGradient(width, 0, width - glowSize, 0)
  right.addColorStop(0, edgeColor(edgeAlpha))
  right.addColorStop(0.58, edgeColor(edgeAlpha * 0.4))
  right.addColorStop(1, edgeColor(0))
  ctx.fillStyle = right
  ctx.fillRect(width - glowSize, 0, glowSize, height)

  const cornerAlpha = edgeAlpha * 0.9
  const drawCorner = (cx: number, cy: number) => {
    const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, cornerRadius)
    radial.addColorStop(0, edgeColor(cornerAlpha))
    radial.addColorStop(0.65, edgeColor(cornerAlpha * 0.28))
    radial.addColorStop(1, edgeColor(0))
    ctx.fillStyle = radial
    ctx.fillRect(cx - cornerRadius, cy - cornerRadius, cornerRadius * 2, cornerRadius * 2)
  }
  drawCorner(0, 0)
  drawCorner(width, 0)
  drawCorner(0, height)
  drawCorner(width, height)
  ctx.restore()
}

import type { Layer, FXPreset, NoiseDirection } from '@/types'
import { simplex3 } from './noise'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

// --- Direction system (unified direction system) ---

interface DirInfo {
  dx: number; dy: number
  perpX: number; perpY: number
  primaryMin: number; primarySpan: number
  secondaryMin: number; secondarySpan: number
}

function directionInfo(dir: NoiseDirection): DirInfo {
  const vectors: Record<string, [number, number]> = {
    up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
    'top-left': [-0.707, -0.707], 'top-right': [0.707, -0.707],
    'bottom-left': [-0.707, 0.707], 'bottom-right': [0.707, 0.707],
  }
  const [dx, dy] = vectors[dir] ?? [1, 0]
  const perpX = -dy, perpY = dx
  const primaryMin = Math.min(0, dx) + Math.min(0, dy)
  const primarySpan = Math.max(1e-4, (Math.max(0, dx) + Math.max(0, dy)) - primaryMin)
  const secondaryMin = Math.min(0, perpX) + Math.min(0, perpY)
  const secondarySpan = Math.max(1e-4, (Math.max(0, perpX) + Math.max(0, perpY)) - secondaryMin)
  return { dx, dy, perpX, perpY, primaryMin, primarySpan, secondaryMin, secondarySpan }
}

function cellNorms(
  x: number, y: number,
  cols: number, rows: number,
  dir: DirInfo,
): { primaryNorm: number; secondaryNorm: number } {
  const u = x / Math.max(cols - 1, 1)
  const v = y / Math.max(rows - 1, 1)
  const primary = u * dir.dx + v * dir.dy
  const secondary = u * dir.perpX + v * dir.perpY
  const primaryNorm = clamp((primary - dir.primaryMin) / dir.primarySpan, 0, 1)
  const secondaryNorm = clamp((secondary - dir.secondaryMin) / dir.secondarySpan, 0, 1)
  return { primaryNorm, secondaryNorm }
}

// --- Pre-render FX: modify brightness grid before character selection ---

function applyNoise(
  grid: Float32Array,
  cols: number,
  rows: number,
  layer: Layer,
  time: number,
): void {
  const scale = clamp(layer.noiseScale, 4, 120)
  const speed = clamp(layer.noiseSpeed, 0, 4)
  const strength = clamp(layer.fxStrength, 0, 1)
  const dir = directionInfo(layer.noiseDirection)
  const maxDim = Math.max(cols, rows)
  const z = time * speed * 2.4

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const { primaryNorm, secondaryNorm } = cellNorms(x, y, cols, rows, dir)
      const px = (primaryNorm * maxDim + 17.3) / scale
      const py = (secondaryNorm * maxDim - 9.7) / scale
      const n1 = simplex3(px, py, z)
      const n2 = simplex3(px * 2.17 + 5.3, py * 2.17 + 5.3, z * 1.4)
      const amount = (16 + strength * 72) / 255
      const i = y * cols + x
      grid[i] = clamp(grid[i] + (n1 * 0.65 + n2 * 0.35) * amount, 0, 1)
    }
  }
}

function applyIntervals(
  grid: Float32Array,
  cols: number,
  rows: number,
  layer: Layer,
  time: number,
): void {
  const spacing = clamp(layer.intervalSpacing, 4, 64)
  const speed = clamp(layer.intervalSpeed, 0, 4)
  const bandWidth = clamp(layer.intervalWidth, 1, 8)
  const strength = clamp(layer.fxStrength, 0, 1)
  const dir = directionInfo(layer.intervalDirection)
  const maxDim = Math.max(cols, rows)
  const amount = strength * 88 / 255

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const { primaryNorm, secondaryNorm } = cellNorms(x, y, cols, rows, dir)
      const pPos = primaryNorm * maxDim
      const sPos = secondaryNorm * maxDim
      const offset = ((time * speed * spacing * 1.7) % spacing + spacing) % spacing
      const dist = (pPos + offset) % spacing
      const bandDist = Math.min(dist, spacing - dist)
      const bandFactor = 1 - clamp(bandDist / bandWidth, 0, 1)
      const wave = Math.sin(pPos / spacing * Math.PI * 2 + time * speed * 1.8 + sPos / Math.max(maxDim, 1) * 1.1)
      const i = y * cols + x
      grid[i] = clamp(grid[i] + bandFactor * amount * 0.85 + wave * amount * 0.32, 0, 1)
    }
  }
}

function applyBeam(
  grid: Float32Array,
  cols: number,
  rows: number,
  layer: Layer,
  time: number,
): void {
  const strength = clamp(layer.fxStrength, 0, 1)
  const period = 0.45 + strength * 2.2
  const width = 0.08 + strength * 0.22
  const dir = directionInfo(layer.beamDirection)

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const { primaryNorm } = cellNorms(x, y, cols, rows, dir)
      const beamPos = ((time * period) % 1.2 + 1.2) % 1.2 - 0.1
      const dist = Math.abs(primaryNorm - beamPos)
      const factor = Math.max(0, 1 - dist / width)
      const amount = (34 + strength * 120) / 255
      const i = y * cols + x
      grid[i] = clamp(grid[i] + factor * amount, 0, 1)
    }
  }
}

function applyGlitch(
  grid: Float32Array,
  cols: number,
  rows: number,
  layer: Layer,
  time: number,
): void {
  const strength = clamp(layer.fxStrength, 0, 1)
  const dir = directionInfo(layer.glitchDirection)
  const maxDim = Math.max(cols, rows)
  const laneSize = 2 + Math.floor((1 - strength) * 3)

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const { primaryNorm, secondaryNorm } = cellNorms(x, y, cols, rows, dir)
      const sPos = secondaryNorm * maxDim
      const lane = Math.floor(sPos / laneSize)
      const seed = Math.floor(time * (0.75 + strength * 1.35))
      const active = (Math.sin((lane + 1) * 19.73 + seed * 7.11) + 1) * 0.5 > 0.74 ? 1 : 0
      if (!active) continue

      const freq = 0.12 + (Math.sin((lane + 1) * 6.37) + 1) * 0.5 * (0.22 + strength * 0.34)
      const phase = (Math.sin((lane + 1) * 2.91) + 1) * 0.5
      const t = (time * freq + phase) % 1
      const glitchWidth = 0.12 + strength * 0.28
      const offset = (primaryNorm - t + 1) % 1
      const factor = Math.max(0, 1 - offset / glitchWidth)
      const wave = Math.max(0, Math.sin(offset * Math.PI))
      const amount = (strength * 88) / 255
      const i = y * cols + x
      grid[i] = clamp(grid[i] + (factor * 0.6 + wave * 0.4) * active * amount, 0, 1)
    }
  }
}

type PreRenderFxFn = (
  grid: Float32Array,
  cols: number,
  rows: number,
  layer: Layer,
  time: number,
) => void

export const PRE_RENDER_FX: Record<FXPreset, PreRenderFxFn | null> = {
  none: null,
  noise: applyNoise,
  intervals: applyIntervals,
  beam: applyBeam,
  glitch: applyGlitch,
  crt: null,
  'matrix-rain': null,
}

// --- Post-render FX: overlay on canvas after character rendering ---

function renderCrt(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layer: Layer,
  time: number,
): void {
  const strength = clamp(layer.fxStrength, 0, 1)
  if (strength <= 0.001) return

  // --- Scanlines with brightness-dependent visibility ---
  // Gaussian-inspired scanline profile: darker lines between rows
  const scanlineSpacing = 3
  const scanlineAlpha = strength * 0.18
  ctx.fillStyle = `rgba(0,0,0,${scanlineAlpha})`
  for (let y = 0; y < height; y += scanlineSpacing) {
    ctx.fillRect(0, y, width, 1)
  }

  // --- Phosphor mask (aperture grille - vertical RGB stripes) ---
  // Subtle at low strength, more visible at high
  const maskStrength = strength * 0.06
  if (maskStrength > 0.005) {
    const imgData = ctx.getImageData(0, 0, width, height)
    const data = imgData.data
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const idx = (py * width + px) * 4
        const subpixel = px % 3
        // Darken non-active subpixels
        const maskR = subpixel === 0 ? 1.0 : 1.0 - maskStrength
        const maskG = subpixel === 1 ? 1.0 : 1.0 - maskStrength
        const maskB = subpixel === 2 ? 1.0 : 1.0 - maskStrength
        data[idx] = Math.min(255, Math.round(data[idx] * maskR))
        data[idx + 1] = Math.min(255, Math.round(data[idx + 1] * maskG))
        data[idx + 2] = Math.min(255, Math.round(data[idx + 2] * maskB))
      }
    }
    ctx.putImageData(imgData, 0, 0)
  }

  // --- CRT vignette with corner darkening ---
  const vGrad = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.25,
    width / 2, height / 2, Math.max(width, height) * 0.75,
  )
  vGrad.addColorStop(0, 'rgba(0,0,0,0)')
  vGrad.addColorStop(0.7, `rgba(0,0,0,${strength * 0.15})`)
  vGrad.addColorStop(1, `rgba(0,0,0,${strength * 0.45})`)
  ctx.fillStyle = vGrad
  ctx.fillRect(0, 0, width, height)

  // --- Subtle barrel distortion border (dark edge) ---
  // Draw a soft black border to simulate CRT curvature edges
  const borderSize = Math.max(2, Math.min(width, height) * strength * 0.015)
  const borderAlpha = strength * 0.3
  ctx.fillStyle = `rgba(0,0,0,${borderAlpha})`
  ctx.fillRect(0, 0, width, borderSize) // top
  ctx.fillRect(0, height - borderSize, width, borderSize) // bottom
  ctx.fillRect(0, 0, borderSize, height) // left
  ctx.fillRect(width - borderSize, 0, borderSize, height) // right

  // --- Temporal flicker ---
  const flicker = Math.sin(time * 37.7) * 0.008 * strength + Math.sin(time * 59.3) * 0.004 * strength
  if (flicker > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flicker})`
    ctx.fillRect(0, 0, width, height)
  } else if (flicker < 0) {
    ctx.fillStyle = `rgba(0,0,0,${-flicker})`
    ctx.fillRect(0, 0, width, height)
  }

  // --- Subtle glow/bloom effect on bright areas ---
  // Use canvas shadow blur as a cheap bloom approximation
  if (strength > 0.3) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = (strength - 0.3) * 0.04
    ctx.filter = `blur(${Math.round(2 + strength * 4)}px)`
    ctx.drawImage(ctx.canvas, 0, 0)
    ctx.restore()
    ctx.filter = 'none'
  }
}

function hashF(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function renderMatrixRain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layer: Layer,
  time: number,
): void {
  const scale = layer.matrixScale
  const speed = layer.matrixSpeed
  const strength = clamp(layer.fxStrength, 0, 1)
  const dirVectors: Record<string, [number, number]> = {
    up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
    'top-left': [-0.707, -0.707], 'top-right': [0.707, -0.707],
    'bottom-left': [-0.707, 0.707], 'bottom-right': [0.707, 0.707],
  }
  const [, dy] = dirVectors[layer.matrixDirection] ?? [0, 1]
  const falling = dy >= 0

  const mCols = Math.ceil(width / scale)
  const mRows = Math.ceil(height / scale)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*'

  ctx.font = `${scale * 0.9}px monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'

  for (let c = 0; c < mCols; c++) {
    const colSpeed = speed * (0.5 + hashF(c, 0) * 1.5)
    const offset = hashF(c, 1) * mRows
    const dropLen = 5 + Math.floor(hashF(c, 2) * 15)

    const headPos = ((time * colSpeed * 20 + offset) % (mRows + dropLen))
    const headRow = falling ? headPos : mRows - headPos

    for (let trail = 0; trail < dropLen; trail++) {
      const row = Math.floor(falling ? headRow - trail : headRow + trail)
      if (row < 0 || row >= mRows) continue

      const alpha = ((dropLen - trail) / dropLen) * strength * 0.6
      const charIdx = Math.floor(hashF(c * 31 + row, Math.floor(time * 5)) * chars.length)
      const ch = chars[charIdx]

      ctx.fillStyle = `rgba(0,255,65,${alpha})`
      ctx.fillText(ch, c * scale + scale / 2, row * scale)
    }
  }
}

type PostRenderFxFn = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layer: Layer,
  time: number,
) => void

export const POST_RENDER_FX: Record<FXPreset, PostRenderFxFn | null> = {
  none: null,
  noise: null,
  intervals: null,
  beam: null,
  glitch: null,
  crt: renderCrt,
  'matrix-rain': renderMatrixRain,
}

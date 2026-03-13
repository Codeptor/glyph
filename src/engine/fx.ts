import type { Layer, FXPreset, NoiseDirection } from '@/types'

// simple hash-based noise (deterministic, fast)
function hash(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)

  const a = hash(ix, iy)
  const b = hash(ix + 1, iy)
  const c = hash(ix, iy + 1)
  const d = hash(ix + 1, iy + 1)

  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy
}

function fbmNoise(x: number, y: number, octaves: number): number {
  let v = 0
  let amp = 0.5
  let freq = 1
  for (let i = 0; i < octaves; i++) {
    v += smoothNoise(x * freq, y * freq) * amp
    amp *= 0.5
    freq *= 2
  }
  return v
}

function directionVector(dir: NoiseDirection): [number, number] {
  switch (dir) {
    case 'up': return [0, -1]
    case 'down': return [0, 1]
    case 'left': return [-1, 0]
    case 'right': return [1, 0]
    case 'top-left': return [-0.707, -0.707]
    case 'top-right': return [0.707, -0.707]
    case 'bottom-left': return [-0.707, 0.707]
    case 'bottom-right': return [0.707, 0.707]
  }
}

function renderNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layer: Layer,
  time: number,
): void {
  const [dx, dy] = directionVector(layer.noiseDirection)
  const scale = layer.noiseScale
  const speed = layer.noiseSpeed
  const strength = layer.fxStrength
  const offsetX = dx * time * speed * 50
  const offsetY = dy * time * speed * 50

  const step = 4
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const nx = (x + offsetX) / scale
      const ny = (y + offsetY) / scale
      const v = fbmNoise(nx, ny, 4) * strength
      ctx.fillStyle = `rgba(255,255,255,${v * 0.15})`
      ctx.fillRect(x, y, step, step)
    }
  }
}

function renderIntervals(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layer: Layer,
  time: number,
): void {
  const [dx, dy] = directionVector(layer.intervalDirection)
  const spacing = layer.intervalSpacing
  const speed = layer.intervalSpeed
  const bandWidth = layer.intervalWidth
  const strength = layer.fxStrength
  const offset = time * speed * 60

  const horizontal = Math.abs(dy) >= Math.abs(dx)

  ctx.fillStyle = `rgba(255,255,255,${strength * 0.2})`

  if (horizontal) {
    for (let y = 0; y < height + spacing; y += spacing) {
      const yy = ((y + offset * dy) % (height + spacing + spacing)) - spacing
      ctx.fillRect(0, yy, width, bandWidth)
    }
  } else {
    for (let x = 0; x < width + spacing; x += spacing) {
      const xx = ((x + offset * dx) % (width + spacing + spacing)) - spacing
      ctx.fillRect(xx, 0, bandWidth, height)
    }
  }
}

function renderBeam(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layer: Layer,
  time: number,
): void {
  const [dx, dy] = directionVector(layer.beamDirection)
  const strength = layer.fxStrength
  const period = 3 // seconds per sweep
  const t = (time % period) / period

  const horizontal = Math.abs(dy) >= Math.abs(dx)

  if (horizontal) {
    const y = t * height
    const grad = ctx.createLinearGradient(0, y - 40, 0, y + 40)
    grad.addColorStop(0, 'rgba(255,255,255,0)')
    grad.addColorStop(0.5, `rgba(255,255,255,${strength * 0.5})`)
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, y - 40, width, 80)
  } else {
    const x = t * width
    const grad = ctx.createLinearGradient(x - 40, 0, x + 40, 0)
    grad.addColorStop(0, 'rgba(255,255,255,0)')
    grad.addColorStop(0.5, `rgba(255,255,255,${strength * 0.5})`)
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(x - 40, 0, 80, height)
  }
}

function renderGlitch(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layer: Layer,
  time: number,
): void {
  const strength = layer.fxStrength
  const seed = Math.floor(time * 8)
  const numSlices = Math.floor(3 + strength * 12)
  const horizontal = layer.glitchDirection === 'left' || layer.glitchDirection === 'right' ||
    layer.glitchDirection === 'up' || layer.glitchDirection === 'down'

  for (let i = 0; i < numSlices; i++) {
    const r = hash(seed + i, i * 7)
    if (r > strength) continue

    if (horizontal) {
      const y = Math.floor(hash(seed + i, i * 3) * height)
      const h = Math.floor(2 + hash(seed + i, i * 5) * 15)
      const shift = Math.floor((hash(seed + i, i * 11) - 0.5) * width * strength * 0.15)

      try {
        const slice = ctx.getImageData(0, y, width, h)
        ctx.putImageData(slice, shift, y)
      } catch {
        // getImageData can fail on tainted canvases
      }
    } else {
      const x = Math.floor(hash(seed + i, i * 3) * width)
      const w = Math.floor(2 + hash(seed + i, i * 5) * 15)
      const shift = Math.floor((hash(seed + i, i * 11) - 0.5) * height * strength * 0.15)

      try {
        const slice = ctx.getImageData(x, 0, w, height)
        ctx.putImageData(slice, x, shift)
      } catch {
        // pass
      }
    }
  }
}

function renderCrt(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layer: Layer,
  time: number,
): void {
  const strength = layer.fxStrength

  // scanlines
  ctx.fillStyle = `rgba(0,0,0,${strength * 0.15})`
  for (let y = 0; y < height; y += 3) {
    ctx.fillRect(0, y, width, 1)
  }

  // vignette overlay
  const grad = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.3,
    width / 2, height / 2, Math.max(width, height) * 0.7,
  )
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, `rgba(0,0,0,${strength * 0.4})`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  // flicker
  const flicker = Math.sin(time * 30) * 0.01 * strength
  if (flicker > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flicker})`
    ctx.fillRect(0, 0, width, height)
  }
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
  const strength = layer.fxStrength
  const [_dx, dy] = directionVector(layer.matrixDirection)
  const falling = dy >= 0

  const cols = Math.ceil(width / scale)
  const rows = Math.ceil(height / scale)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*'

  ctx.font = `${scale * 0.9}px monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'

  for (let c = 0; c < cols; c++) {
    const colSpeed = speed * (0.5 + hash(c, 0) * 1.5)
    const offset = hash(c, 1) * rows
    const dropLen = 5 + Math.floor(hash(c, 2) * 15)

    const headPos = ((time * colSpeed * 20 + offset) % (rows + dropLen))
    const headRow = falling ? headPos : rows - headPos

    for (let trail = 0; trail < dropLen; trail++) {
      const row = Math.floor(falling ? headRow - trail : headRow + trail)
      if (row < 0 || row >= rows) continue

      const alpha = ((dropLen - trail) / dropLen) * strength * 0.6
      const charIdx = Math.floor(hash(c * 31 + row, Math.floor(time * 5)) * chars.length)
      const ch = chars[charIdx]

      ctx.fillStyle = `rgba(0,255,65,${alpha})`
      ctx.fillText(ch, c * scale + scale / 2, row * scale)
    }
  }
}

type FxFn = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layer: Layer,
  time: number,
) => void

export const FX_RENDERERS: Record<FXPreset, FxFn | null> = {
  none: null,
  noise: renderNoise,
  intervals: renderIntervals,
  beam: renderBeam,
  glitch: renderGlitch,
  crt: renderCrt,
  'matrix-rain': renderMatrixRain,
}

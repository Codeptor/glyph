import type { ShaderType, ShaderEntry } from '@/types'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

type ShaderFn = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  strength: number,
  time: number,
  params: Record<string, number>,
) => void

// --- Individual Shaders ---

function shChromatic(ctx: CanvasRenderingContext2D, w: number, h: number, s: number): void {
  const amt = Math.round(s * 8)
  if (amt < 1) return
  const img = ctx.getImageData(0, 0, w, h)
  const src = new Uint8ClampedArray(img.data)
  const d = img.data
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const lx = Math.max(0, x - amt)
      const rx = Math.min(w - 1, x + amt)
      d[i] = src[(y * w + rx) * 4]       // R shifted right
      d[i + 2] = src[(y * w + lx) * 4 + 2] // B shifted left
    }
  }
  ctx.putImageData(img, 0, 0)
}

function shKaleidoscope(ctx: CanvasRenderingContext2D, w: number, h: number, s: number, _t: number, p: Record<string, number>): void {
  const folds = Math.max(2, Math.round((p['folds'] ?? 6) * s))
  const img = ctx.getImageData(0, 0, w, h)
  const src = new Uint8ClampedArray(img.data)
  const d = img.data
  const cx = w / 2, cy = h / 2
  const foldAngle = (2 * Math.PI) / folds
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let angle = Math.atan2(y - cy, x - cx)
      if (angle < 0) angle += 2 * Math.PI
      const sector = Math.floor(angle / foldAngle)
      let localAngle = angle - sector * foldAngle
      if (sector % 2 === 1) localAngle = foldAngle - localAngle
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      const sx = Math.round(cx + dist * Math.cos(localAngle))
      const sy = Math.round(cy + dist * Math.sin(localAngle))
      const si = (clamp(sy, 0, h - 1) * w + clamp(sx, 0, w - 1)) * 4
      const di = (y * w + x) * 4
      d[di] = src[si]; d[di + 1] = src[si + 1]; d[di + 2] = src[si + 2]
    }
  }
  ctx.putImageData(img, 0, 0)
}

function shSolarize(ctx: CanvasRenderingContext2D, w: number, h: number, s: number): void {
  const threshold = Math.round((1 - s) * 255)
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      if (d[i + c] > threshold) d[i + c] = 255 - d[i + c]
    }
  }
  ctx.putImageData(img, 0, 0)
}

function shPosterize(ctx: CanvasRenderingContext2D, w: number, h: number, s: number): void {
  const levels = Math.max(2, Math.round(2 + (1 - s) * 14))
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      d[i + c] = Math.round(Math.round(d[i + c] / 255 * (levels - 1)) / (levels - 1) * 255)
    }
  }
  ctx.putImageData(img, 0, 0)
}

function shHueRotate(ctx: CanvasRenderingContext2D, _w: number, _h: number, s: number, t: number): void {
  const angle = (s * 360 + t * 30) % 360
  ctx.filter = `hue-rotate(${angle}deg)`
  ctx.drawImage(ctx.canvas, 0, 0)
  ctx.filter = 'none'
}

function shColorWobble(ctx: CanvasRenderingContext2D, w: number, h: number, s: number, t: number): void {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  const wobble = s * 40
  for (let y = 0; y < h; y++) {
    const shift = Math.round(Math.sin(y * 0.02 + t * 3) * wobble)
    if (shift === 0) continue
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const sx = clamp(x + shift, 0, w - 1)
      const si = (y * w + sx) * 4
      d[i] = d[si] // only shift red channel
    }
  }
  ctx.putImageData(img, 0, 0)
}

function shColorRamp(ctx: CanvasRenderingContext2D, w: number, h: number, s: number): void {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const lum = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255
    const t = clamp(lum * s * 2, 0, 1)
    // Cool to warm ramp
    d[i]     = Math.round((0.2 + t * 0.8) * d[i])
    d[i + 1] = Math.round((0.5 + (1 - Math.abs(t - 0.5) * 2) * 0.5) * d[i + 1])
    d[i + 2] = Math.round((0.8 - t * 0.6) * d[i + 2])
  }
  ctx.putImageData(img, 0, 0)
}

function shPixelSort(ctx: CanvasRenderingContext2D, w: number, h: number, s: number): void {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  const threshold = (1 - s) * 255
  for (let y = 0; y < h; y++) {
    let start = -1
    for (let x = 0; x <= w; x++) {
      const i = (y * w + x) * 4
      const bright = x < w ? (d[i] + d[i + 1] + d[i + 2]) / 3 : 0
      if (bright > threshold && start < 0) {
        start = x
      } else if ((bright <= threshold || x === w) && start >= 0) {
        // Sort this run by brightness
        const pixels: [number, number, number, number, number][] = []
        for (let sx = start; sx < x; sx++) {
          const si = (y * w + sx) * 4
          pixels.push([d[si], d[si + 1], d[si + 2], d[si + 3], d[si] + d[si + 1] + d[si + 2]])
        }
        pixels.sort((a, b) => a[4] - b[4])
        for (let j = 0; j < pixels.length; j++) {
          const di = (y * w + start + j) * 4
          d[di] = pixels[j][0]; d[di + 1] = pixels[j][1]
          d[di + 2] = pixels[j][2]; d[di + 3] = pixels[j][3]
        }
        start = -1
      }
    }
  }
  ctx.putImageData(img, 0, 0)
}

function shDataBend(ctx: CanvasRenderingContext2D, w: number, h: number, s: number, t: number): void {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  const nBands = Math.round(3 + s * 12)
  for (let b = 0; b < nBands; b++) {
    const y = Math.floor((Math.sin(b * 7.3 + t * 2) * 0.5 + 0.5) * h)
    const bh = Math.round(2 + s * 6)
    const shift = Math.round((Math.sin(b * 3.1 + t) * 2 - 1) * s * w * 0.15)
    for (let dy = 0; dy < bh && y + dy < h; dy++) {
      const row = y + dy
      for (let x = 0; x < w; x++) {
        const sx = clamp(x + shift, 0, w - 1)
        const di = (row * w + x) * 4
        const si = (row * w + sx) * 4
        d[di] = d[si]; d[di + 1] = d[si + 1]; d[di + 2] = d[si + 2]
      }
    }
  }
  ctx.putImageData(img, 0, 0)
}

function shBlockGlitch(ctx: CanvasRenderingContext2D, w: number, h: number, s: number, t: number): void {
  const nBlocks = Math.round(5 + s * 20)
  const seed = Math.floor(t * 4)
  for (let i = 0; i < nBlocks; i++) {
    const hash = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453
    const r = hash - Math.floor(hash)
    if (r > s) continue
    const bx = Math.floor(r * w * 3.7 % w)
    const by = Math.floor(r * h * 5.3 % h)
    const bw = Math.round(10 + r * 60)
    const bh = Math.round(5 + r * 30)
    const shift = Math.round((r - 0.5) * s * 80)
    try {
      const block = ctx.getImageData(clamp(bx, 0, w - 1), clamp(by, 0, h - 1), Math.min(bw, w - bx), Math.min(bh, h - by))
      ctx.putImageData(block, clamp(bx + shift, 0, w - 1), by)
    } catch { /* ignore out of bounds */ }
  }
}

function shRadialBlur(ctx: CanvasRenderingContext2D, w: number, h: number, s: number): void {
  const passes = Math.max(1, Math.round(s * 4))
  const amount = s * 3
  ctx.save()
  ctx.globalAlpha = 1 / (passes + 1)
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 1; i <= passes; i++) {
    const scale = 1 + (amount * i) / (passes * 100)
    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.scale(scale, scale)
    ctx.translate(-w / 2, -h / 2)
    ctx.drawImage(ctx.canvas, 0, 0)
    ctx.restore()
  }
  ctx.restore()
}

function shSoftFocus(ctx: CanvasRenderingContext2D, _w: number, _h: number, s: number): void {
  const blur = Math.round(1 + s * 6)
  ctx.save()
  ctx.globalAlpha = s * 0.4
  ctx.globalCompositeOperation = 'lighter'
  ctx.filter = `blur(${blur}px)`
  ctx.drawImage(ctx.canvas, 0, 0)
  ctx.restore()
  ctx.filter = 'none'
}

function shEdgeGlow(ctx: CanvasRenderingContext2D, w: number, h: number, s: number): void {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  const edges = new Float32Array(w * h)
  // Sobel-ish edge detection
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4
      const l = (d[idx - 4] + d[idx - 3] + d[idx - 2]) / 3
      const r = (d[idx + 4] + d[idx + 5] + d[idx + 6]) / 3
      const u = (d[((y - 1) * w + x) * 4] + d[((y - 1) * w + x) * 4 + 1] + d[((y - 1) * w + x) * 4 + 2]) / 3
      const dn = (d[((y + 1) * w + x) * 4] + d[((y + 1) * w + x) * 4 + 1] + d[((y + 1) * w + x) * 4 + 2]) / 3
      edges[y * w + x] = Math.min(1, (Math.abs(r - l) + Math.abs(dn - u)) / 255 * s * 3)
    }
  }
  for (let i = 0; i < edges.length; i++) {
    if (edges[i] > 0.05) {
      const pi = i * 4
      const glow = edges[i]
      d[pi] = Math.min(255, d[pi] + Math.round(glow * 80))
      d[pi + 1] = Math.min(255, d[pi + 1] + Math.round(glow * 120))
      d[pi + 2] = Math.min(255, d[pi + 2] + Math.round(glow * 200))
    }
  }
  ctx.putImageData(img, 0, 0)
}

function shBloom(ctx: CanvasRenderingContext2D, w: number, h: number, s: number): void {
  const thr = Math.round(100 + (1 - s) * 100)
  // Downsample 4x
  const sw = Math.ceil(w / 4), sh = Math.ceil(h / 4)
  const tmp = document.createElement('canvas')
  tmp.width = sw; tmp.height = sh
  const tc = tmp.getContext('2d')!
  tc.drawImage(ctx.canvas, 0, 0, sw, sh)
  const sm = tc.getImageData(0, 0, sw, sh)
  const sd = sm.data
  // Threshold
  for (let i = 0; i < sd.length; i += 4) {
    const bright = (sd[i] + sd[i + 1] + sd[i + 2]) / 3
    if (bright < thr) { sd[i] = sd[i + 1] = sd[i + 2] = 0 }
  }
  // 3-pass box blur
  for (let pass = 0; pass < 3; pass++) {
    const copy = new Uint8ClampedArray(sd)
    for (let y = 1; y < sh - 1; y++) {
      for (let x = 1; x < sw - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              sum += copy[((y + dy) * sw + (x + dx)) * 4 + c]
            }
          }
          sd[(y * sw + x) * 4 + c] = Math.round(sum / 9)
        }
      }
    }
  }
  tc.putImageData(sm, 0, 0)
  // Upsample + additive blend
  ctx.save()
  ctx.globalAlpha = s * 0.6
  ctx.globalCompositeOperation = 'lighter'
  ctx.drawImage(tmp, 0, 0, w, h)
  ctx.restore()
}

function shRgbSplit(ctx: CanvasRenderingContext2D, w: number, h: number, s: number, t: number): void {
  const img = ctx.getImageData(0, 0, w, h)
  const src = new Uint8ClampedArray(img.data)
  const d = img.data
  const cx = w / 2, cy = h / 2
  const amount = s * 5
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const angle = Math.atan2(y - cy, x - cx) + t * 0.5
      const dx = Math.round(Math.cos(angle) * amount)
      const dy = Math.round(Math.sin(angle) * amount)
      const i = (y * w + x) * 4
      const rx = clamp(x + dx, 0, w - 1)
      const ry = clamp(y + dy, 0, h - 1)
      const bx = clamp(x - dx, 0, w - 1)
      const by = clamp(y - dy, 0, h - 1)
      d[i] = src[(ry * w + rx) * 4]
      d[i + 2] = src[(by * w + bx) * 4 + 2]
    }
  }
  ctx.putImageData(img, 0, 0)
}

function shWaveDistort(ctx: CanvasRenderingContext2D, w: number, h: number, s: number, t: number): void {
  const img = ctx.getImageData(0, 0, w, h)
  const src = new Uint8ClampedArray(img.data)
  const d = img.data
  const amp = s * 15
  for (let y = 0; y < h; y++) {
    const shift = Math.round(Math.sin(y * 0.03 + t * 2) * amp)
    for (let x = 0; x < w; x++) {
      const sx = clamp(x + shift, 0, w - 1)
      const di = (y * w + x) * 4
      const si = (y * w + sx) * 4
      d[di] = src[si]; d[di + 1] = src[si + 1]; d[di + 2] = src[si + 2]
    }
  }
  ctx.putImageData(img, 0, 0)
}

function shDisplacement(ctx: CanvasRenderingContext2D, w: number, h: number, s: number, t: number): void {
  const img = ctx.getImageData(0, 0, w, h)
  const src = new Uint8ClampedArray(img.data)
  const d = img.data
  const amt = s * 20
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const lum = (src[i] + src[i + 1] + src[i + 2]) / 765
      const dx = Math.round(Math.sin(lum * Math.PI * 2 + t) * amt)
      const dy = Math.round(Math.cos(lum * Math.PI * 2 + t * 0.7) * amt * 0.5)
      const sx = clamp(x + dx, 0, w - 1)
      const sy = clamp(y + dy, 0, h - 1)
      const si = (sy * w + sx) * 4
      d[i] = src[si]; d[i + 1] = src[si + 1]; d[i + 2] = src[si + 2]
    }
  }
  ctx.putImageData(img, 0, 0)
}

function shThreshold(ctx: CanvasRenderingContext2D, w: number, h: number, s: number): void {
  const thr = Math.round(s * 255)
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const v = (d[i] + d[i + 1] + d[i + 2]) / 3 > thr ? 255 : 0
    d[i] = v; d[i + 1] = v; d[i + 2] = v
  }
  ctx.putImageData(img, 0, 0)
}

function shChannelShift(ctx: CanvasRenderingContext2D, w: number, h: number, s: number, t: number): void {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  const shift = Math.floor((t * s * 2) % 3)
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2]
    if (shift === 0) { d[i] = g; d[i + 1] = b; d[i + 2] = r }
    else if (shift === 1) { d[i] = b; d[i + 1] = r; d[i + 2] = g }
  }
  ctx.putImageData(img, 0, 0)
}

// --- Shader Registry ---

const SHADER_FNS: Record<ShaderType, ShaderFn> = {
  'chromatic':     (ctx, w, h, s) => shChromatic(ctx, w, h, s),
  'kaleidoscope':  (ctx, w, h, s, t, p) => shKaleidoscope(ctx, w, h, s, t, p),
  'solarize':      (ctx, w, h, s) => shSolarize(ctx, w, h, s),
  'posterize':     (ctx, w, h, s) => shPosterize(ctx, w, h, s),
  'hue-rotate':    (ctx, w, h, s, t) => shHueRotate(ctx, w, h, s, t),
  'color-wobble':  (ctx, w, h, s, t) => shColorWobble(ctx, w, h, s, t),
  'color-ramp':    (ctx, w, h, s) => shColorRamp(ctx, w, h, s),
  'pixel-sort':    (ctx, w, h, s) => shPixelSort(ctx, w, h, s),
  'data-bend':     (ctx, w, h, s, t) => shDataBend(ctx, w, h, s, t),
  'block-glitch':  (ctx, w, h, s, t) => shBlockGlitch(ctx, w, h, s, t),
  'radial-blur':   (ctx, w, h, s) => shRadialBlur(ctx, w, h, s),
  'soft-focus':    (ctx, w, h, s) => shSoftFocus(ctx, w, h, s),
  'edge-glow':     (ctx, w, h, s) => shEdgeGlow(ctx, w, h, s),
  'bloom':         (ctx, w, h, s) => shBloom(ctx, w, h, s),
  'rgb-split':     (ctx, w, h, s, t) => shRgbSplit(ctx, w, h, s, t),
  'wave-distort':  (ctx, w, h, s, t) => shWaveDistort(ctx, w, h, s, t),
  'displacement':  (ctx, w, h, s, t) => shDisplacement(ctx, w, h, s, t),
  'threshold':     (ctx, w, h, s) => shThreshold(ctx, w, h, s),
  'channel-shift': (ctx, w, h, s, t) => shChannelShift(ctx, w, h, s, t),
}

/**
 * Composable shader pipeline. Add shaders, apply sequentially.
 */
export class ShaderChain {
  private entries: ShaderEntry[] = []

  setEntries(entries: ShaderEntry[]): void {
    this.entries = entries
  }

  apply(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void {
    for (const entry of this.entries) {
      if (!entry.enabled || entry.strength <= 0) continue
      const fn = SHADER_FNS[entry.type]
      if (fn) {
        ctx.save()
        fn(ctx, w, h, entry.strength, time, entry.params)
        ctx.restore()
      }
    }
  }
}

export { SHADER_FNS }

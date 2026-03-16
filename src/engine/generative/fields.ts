import type { GenerativeField } from '@/types'
import { simplex2, simplex3, fbm2 } from '@/engine/noise'

interface FieldResult {
  brightness: Float32Array
  colors: Array<[number, number, number]>
}

type FieldFn = (
  cols: number,
  rows: number,
  time: number,
  scale: number,
  speed: number,
  complexity: number,
) => FieldResult

function hsv2rgb(h: number, s: number, v: number): [number, number, number] {
  h = ((h % 1) + 1) % 1
  const c = v * s
  const x = c * (1 - Math.abs((h * 6) % 2 - 1))
  const m = v - c
  const h6 = h * 6
  let r = 0, g = 0, b = 0
  if (h6 < 1) { r = c; g = x }
  else if (h6 < 2) { r = x; g = c }
  else if (h6 < 3) { g = c; b = x }
  else if (h6 < 4) { g = x; b = c }
  else if (h6 < 5) { r = x; b = c }
  else { r = c; b = x }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

function fieldPlasma(cols: number, rows: number, time: number, scale: number, speed: number, complexity: number): FieldResult {
  const total = cols * rows
  const brightness = new Float32Array(total)
  const colors: Array<[number, number, number]> = new Array(total)
  const t = time * speed * 0.3
  const freq = scale * 1.0

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const u = x / Math.max(cols - 1, 1)
      const v = y / Math.max(rows - 1, 1)

      // spatial frequency is purely scale-driven, time only shifts phase
      let val = Math.sin(u * freq + t * 0.7) * Math.sin(v * freq - t * 0.5)
      val += Math.sin((u + v) * freq * 0.7 + t * 0.9) * 0.5
      if (complexity > 2) val += Math.cos(Math.sqrt(u * u + v * v) * freq * 1.5 - t * 0.6) * 0.3
      if (complexity > 4) val += simplex3(u * freq * 0.5, v * freq * 0.5, t * 0.4) * 0.4
      val = (val + 2) / 4

      brightness[i] = Math.max(0, Math.min(1, val))
      const hue = (val * 0.3 + t * 0.03 + u * 0.1) % 1
      colors[i] = hsv2rgb(hue, 0.8, Math.max(0.1, val))
    }
  }
  return { brightness, colors }
}

function fieldRings(cols: number, rows: number, time: number, scale: number, speed: number, complexity: number): FieldResult {
  const total = cols * rows
  const brightness = new Float32Array(total)
  const colors: Array<[number, number, number]> = new Array(total)
  const t = time * speed * 0.3
  const nRings = Math.round(4 + complexity * 3)

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const u = (x / Math.max(cols - 1, 1)) * 2 - 1
      const v = (y / Math.max(rows - 1, 1)) * 2 - 1
      const dist = Math.sqrt(u * u + v * v)

      let val = 0
      for (let r = 0; r < nRings; r++) {
        const ringDist = (r + 1) * scale * 0.15
        val += Math.max(0, 1 - Math.abs(dist - ringDist - t * 0.1) * (8 / scale))
      }
      val = Math.min(1, val)

      brightness[i] = val
      const angle = Math.atan2(v, u)
      const hue = (angle / (2 * Math.PI) + 0.5 + dist * 0.2 + t * 0.03) % 1
      colors[i] = hsv2rgb(hue, 0.75, Math.max(0.05, val))
    }
  }
  return { brightness, colors }
}

function fieldSpiral(cols: number, rows: number, time: number, scale: number, speed: number, complexity: number): FieldResult {
  const total = cols * rows
  const brightness = new Float32Array(total)
  const colors: Array<[number, number, number]> = new Array(total)
  const t = time * speed * 0.3
  const nArms = Math.max(1, Math.round(complexity))
  const tightness = scale * 0.4

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const u = (x / Math.max(cols - 1, 1)) * 2 - 1
      const v = (y / Math.max(rows - 1, 1)) * 2 - 1
      const dist = Math.sqrt(u * u + v * v)
      const angle = Math.atan2(v, u)

      let val = 0
      for (let a = 0; a < nArms; a++) {
        const offset = a * (2 * Math.PI) / nArms
        const logR = Math.log(dist + 0.01) * tightness
        const armPhase = angle + offset - logR + t * 0.8
        const armVal = Math.cos(armPhase * nArms) * 0.5 + 0.5
        val = Math.max(val, armVal * (1 - dist * 0.4))
      }

      brightness[i] = Math.max(0, Math.min(1, val))
      const hue = (angle / (2 * Math.PI) + 0.5 + t * 0.02) % 1
      colors[i] = hsv2rgb(hue, 0.85, Math.max(0.05, val))
    }
  }
  return { brightness, colors }
}

function fieldVortex(cols: number, rows: number, time: number, scale: number, speed: number, _complexity: number): FieldResult {
  const total = cols * rows
  const brightness = new Float32Array(total)
  const colors: Array<[number, number, number]> = new Array(total)
  const t = time * speed * 0.3
  const twist = scale * 0.8

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const u = (x / Math.max(cols - 1, 1)) * 2 - 1
      const v = (y / Math.max(rows - 1, 1)) * 2 - 1
      const dist = Math.sqrt(u * u + v * v)
      const angle = Math.atan2(v, u)

      const twisted = angle + dist * twist * Math.sin(t * 0.4)
      const val = Math.sin(twisted * scale * 1.5 + t * 0.8) * 0.5 + 0.5

      brightness[i] = Math.max(0, Math.min(1, val * (1 - dist * 0.3)))
      const hue = (twisted / (2 * Math.PI) + dist * 0.3 + t * 0.03) % 1
      colors[i] = hsv2rgb(Math.abs(hue) % 1, 0.8, Math.max(0.05, val))
    }
  }
  return { brightness, colors }
}

function fieldTunnel(cols: number, rows: number, time: number, scale: number, speed: number, complexity: number): FieldResult {
  const total = cols * rows
  const brightness = new Float32Array(total)
  const colors: Array<[number, number, number]> = new Array(total)
  const t = time * speed * 0.3

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const u = (x / Math.max(cols - 1, 1)) * 2 - 1
      const v = (y / Math.max(rows - 1, 1)) * 2 - 1
      const dist = Math.sqrt(u * u + v * v) + 0.01
      const angle = Math.atan2(v, u)

      const depth = 1.0 / dist * scale * 0.3
      const v1 = Math.sin(depth + t * 1.2) * 0.5 + 0.5
      const v2 = Math.sin(angle * complexity + depth * 0.5 + t * 0.8) * 0.3 + 0.5
      const val = v1 * 0.6 + v2 * 0.4

      brightness[i] = Math.max(0, Math.min(1, val))
      const hue = (depth * 0.05 + angle / (2 * Math.PI) + t * 0.03) % 1
      colors[i] = hsv2rgb(Math.abs(hue) % 1, 0.7, Math.max(0.05, val))
    }
  }
  return { brightness, colors }
}

function fieldRipple(cols: number, rows: number, time: number, scale: number, speed: number, complexity: number): FieldResult {
  const total = cols * rows
  const brightness = new Float32Array(total)
  const colors: Array<[number, number, number]> = new Array(total)
  const t = time * speed * 0.3
  const nSources = Math.max(1, Math.round(complexity))
  const freq = scale * 0.3
  const damping = 0.02 / scale

  // Fixed source positions
  const sources: [number, number][] = []
  for (let s = 0; s < nSources; s++) {
    sources.push([
      Math.sin(s * 2.4 + 0.5) * 0.3 + 0.5,
      Math.cos(s * 1.7 + 0.3) * 0.3 + 0.5,
    ])
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const u = x / Math.max(cols - 1, 1)
      const v = y / Math.max(rows - 1, 1)

      let val = 0
      for (const [sx, sy] of sources) {
        const dx = u - sx
        const dy = v - sy
        const d = Math.sqrt(dx * dx + dy * dy)
        val += Math.sin(d * freq * 30 + t * 1.5) * Math.exp(-d * damping * 30) * 0.5
      }
      val = val / nSources + 0.5

      brightness[i] = Math.max(0, Math.min(1, val))
      const hue = (val * 0.4 + t * 0.02) % 1
      colors[i] = hsv2rgb(hue, 0.7, Math.max(0.05, val))
    }
  }
  return { brightness, colors }
}

function fieldSineField(cols: number, rows: number, time: number, scale: number, speed: number, complexity: number): FieldResult {
  const total = cols * rows
  const brightness = new Float32Array(total)
  const colors: Array<[number, number, number]> = new Array(total)
  const t = time * speed * 0.3
  const s = scale * 0.1
  const layers = Math.max(2, Math.round(complexity + 1))

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const u = x / Math.max(cols - 1, 1)
      const v = y / Math.max(rows - 1, 1)

      let val = 0
      for (let l = 0; l < layers; l++) {
        const freqX = s * (3 + l * 2.7)
        const freqY = s * (4 + l * 1.9)
        const sp = 0.3 + l * 0.2
        val += Math.sin(u * freqX + t * sp * 0.5) * Math.cos(v * freqY + t * sp * 0.35) / layers
      }
      val = val * 0.5 + 0.5

      brightness[i] = Math.max(0, Math.min(1, val))
      const hue = (u * 0.3 + v * 0.2 + t * 0.04) % 1
      colors[i] = hsv2rgb(hue, 0.65, Math.max(0.08, val))
    }
  }
  return { brightness, colors }
}

function fieldDomainWarp(cols: number, rows: number, time: number, scale: number, speed: number, complexity: number): FieldResult {
  const total = cols * rows
  const brightness = new Float32Array(total)
  const colors: Array<[number, number, number]> = new Array(total)
  const t = time * speed * 0.3
  const s = scale * 0.8
  const octaves = Math.max(1, Math.round(complexity))

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const u = x / Math.max(cols - 1, 1)
      const v = y / Math.max(rows - 1, 1)

      // First pass: base noise
      const n1x = fbm2(u * s + t * 0.3, v * s, octaves) * 2
      const n1y = fbm2(u * s + 5.2, v * s + t * 0.3, octaves) * 2
      // Second pass: warp by first pass
      const n2x = fbm2((u + n1x * 0.5) * s, (v + n1y * 0.5) * s + t * 0.2, octaves)
      const n2y = fbm2((u + n1x * 0.5) * s + 3.7, (v + n1y * 0.5) * s, octaves)
      // Final value
      const val = fbm2((u + n2x * 0.4) * s + t * 0.1, (v + n2y * 0.4) * s, octaves) * 0.5 + 0.5

      brightness[i] = Math.max(0, Math.min(1, val))
      const hue = (n2x * 0.3 + n2y * 0.2 + t * 0.02 + 0.6) % 1
      colors[i] = hsv2rgb(Math.abs(hue) % 1, 0.75, Math.max(0.05, val))
    }
  }
  return { brightness, colors }
}

export const FIELD_GENERATORS: Record<GenerativeField, FieldFn> = {
  'plasma': fieldPlasma,
  'rings': fieldRings,
  'spiral': fieldSpiral,
  'vortex': fieldVortex,
  'tunnel': fieldTunnel,
  'ripple': fieldRipple,
  'sine-field': fieldSineField,
  'domain-warp': fieldDomainWarp,
}

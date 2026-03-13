import type { DitherAlgorithm } from '@/types'

export function noDither(pixels: Float32Array): Float32Array {
  return pixels
}

export function floydSteinberg(
  pixels: Float32Array,
  w: number,
  h: number,
  strength: number,
): Float32Array {
  const out = new Float32Array(pixels)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const old = out[i]
      const quantized = old > 0.5 ? 1 : 0
      const err = (old - quantized) * strength

      out[i] = quantized

      if (x + 1 < w) out[i + 1] += err * (7 / 16)
      if (y + 1 < h) {
        if (x - 1 >= 0) out[(y + 1) * w + (x - 1)] += err * (3 / 16)
        out[(y + 1) * w + x] += err * (5 / 16)
        if (x + 1 < w) out[(y + 1) * w + (x + 1)] += err * (1 / 16)
      }
    }
  }
  return out
}

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

export function bayerDither(
  pixels: Float32Array,
  w: number,
  h: number,
  strength: number,
): Float32Array {
  const out = new Float32Array(pixels.length)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const threshold = (BAYER_4X4[y % 4][x % 4] / 16 - 0.5) * strength
      out[i] = Math.max(0, Math.min(1, pixels[i] + threshold))
    }
  }
  return out
}

export function atkinsonDither(
  pixels: Float32Array,
  w: number,
  h: number,
  strength: number,
): Float32Array {
  const out = new Float32Array(pixels)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const old = out[i]
      const quantized = old > 0.5 ? 1 : 0
      const err = ((old - quantized) * strength) / 8

      out[i] = quantized

      if (x + 1 < w) out[i + 1] += err
      if (x + 2 < w) out[i + 2] += err
      if (y + 1 < h) {
        if (x - 1 >= 0) out[(y + 1) * w + (x - 1)] += err
        out[(y + 1) * w + x] += err
        if (x + 1 < w) out[(y + 1) * w + (x + 1)] += err
      }
      if (y + 2 < h) {
        out[(y + 2) * w + x] += err
      }
    }
  }
  return out
}

type DitherFn = (
  pixels: Float32Array,
  w: number,
  h: number,
  strength: number,
) => Float32Array

export const DITHER_FUNCTIONS: Record<DitherAlgorithm, DitherFn> = {
  none: (pixels) => noDither(pixels),
  'floyd-steinberg': floydSteinberg,
  bayer: bayerDither,
  atkinson: atkinsonDither,
}

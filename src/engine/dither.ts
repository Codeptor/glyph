import type { DitherAlgorithm } from '@/types'

interface DiffusionKernel {
  offsets: Array<[number, number, number]> // [dx, dy, weight]
  divisor: number
}

function errorDiffusion(
  pixels: Float32Array,
  w: number,
  h: number,
  strength: number,
  kernel: DiffusionKernel,
): Float32Array {
  const out = new Float32Array(pixels)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const old = out[i]
      const quantized = old > 0.5 ? 1 : 0
      const err = (old - quantized) * strength / kernel.divisor
      out[i] = quantized
      for (const [dx, dy, weight] of kernel.offsets) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          out[ny * w + nx] += err * weight
        }
      }
    }
  }
  return out
}

const FLOYD_STEINBERG: DiffusionKernel = {
  offsets: [[1,0,7], [-1,1,3], [0,1,5], [1,1,1]],
  divisor: 16,
}

const JARVIS_JUDICE_NINKE: DiffusionKernel = {
  offsets: [
    [1,0,7], [2,0,5],
    [-2,1,3], [-1,1,5], [0,1,7], [1,1,5], [2,1,3],
    [-2,2,1], [-1,2,3], [0,2,5], [1,2,3], [2,2,1],
  ],
  divisor: 48,
}

const STUCKI: DiffusionKernel = {
  offsets: [
    [1,0,8], [2,0,4],
    [-2,1,2], [-1,1,4], [0,1,8], [1,1,4], [2,1,2],
    [-2,2,1], [-1,2,2], [0,2,4], [1,2,2], [2,2,1],
  ],
  divisor: 42,
}

const ATKINSON: DiffusionKernel = {
  offsets: [[1,0,1], [2,0,1], [-1,1,1], [0,1,1], [1,1,1], [0,2,1]],
  divisor: 8,
}

const SIERRA: DiffusionKernel = {
  offsets: [
    [1,0,5], [2,0,3],
    [-2,1,2], [-1,1,4], [0,1,5], [1,1,4], [2,1,2],
    [-1,2,2], [0,2,3], [1,2,2],
  ],
  divisor: 32,
}

const SIERRA_LITE: DiffusionKernel = {
  offsets: [[1,0,2], [0,1,1], [-1,1,1]],
  divisor: 4,
}

export function noDither(pixels: Float32Array): Float32Array {
  return pixels
}

const BAYER_8X8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
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
      const threshold = (BAYER_8X8[y % 8][x % 8] / 64 - 0.5) * strength
      out[i] = Math.max(0, Math.min(1, pixels[i] + threshold))
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
  'none': noDither,
  'floyd-steinberg': (p, w, h, s) => errorDiffusion(p, w, h, s, FLOYD_STEINBERG),
  'bayer': bayerDither,
  'atkinson': (p, w, h, s) => errorDiffusion(p, w, h, s, ATKINSON),
  'jarvis-judice-ninke': (p, w, h, s) => errorDiffusion(p, w, h, s, JARVIS_JUDICE_NINKE),
  'stucki': (p, w, h, s) => errorDiffusion(p, w, h, s, STUCKI),
  'sierra': (p, w, h, s) => errorDiffusion(p, w, h, s, SIERRA),
  'sierra-lite': (p, w, h, s) => errorDiffusion(p, w, h, s, SIERRA_LITE),
}

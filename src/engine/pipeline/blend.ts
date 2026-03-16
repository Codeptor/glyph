import type { BlendMode } from '@/types'

type BlendFn = (a: number, b: number) => number

const BLEND_FNS: Record<BlendMode, BlendFn> = {
  normal:        (_a, b) => b,
  add:           (a, b) => Math.min(1, a + b),
  subtract:      (a, b) => Math.max(0, a - b),
  screen:        (a, b) => 1 - (1 - a) * (1 - b),
  multiply:      (a, b) => a * b,
  overlay:       (a, b) => a < 0.5 ? 2 * a * b : 1 - 2 * (1 - a) * (1 - b),
  softlight:     (a, b) => (1 - 2 * b) * a * a + 2 * b * a,
  hardlight:     (a, b) => b < 0.5 ? 2 * a * b : 1 - 2 * (1 - a) * (1 - b),
  difference:    (a, b) => Math.abs(a - b),
  exclusion:     (a, b) => a + b - 2 * a * b,
  colordodge:    (a, b) => b >= 1 ? 1 : Math.min(1, a / (1 - b + 1e-6)),
  colorburn:     (a, b) => b <= 0 ? 0 : Math.max(0, 1 - (1 - a) / (b + 1e-6)),
  linearlight:   (a, b) => Math.max(0, Math.min(1, a + 2 * b - 1)),
  vividlight:    (a, b) => b < 0.5
    ? Math.max(0, 1 - (1 - a) / (2 * b + 1e-6))
    : Math.min(1, a / (2 * (1 - b) + 1e-6)),
  pin_light:     (a, b) => b < 0.5 ? Math.min(a, 2 * b) : Math.max(a, 2 * b - 1),
  hard_mix:      (a, b) => a + b >= 1 ? 1 : 0,
  lighten:       (a, b) => Math.max(a, b),
  darken:        (a, b) => Math.min(a, b),
  grain_extract: (a, b) => Math.max(0, Math.min(1, a - b + 0.5)),
  grain_merge:   (a, b) => Math.max(0, Math.min(1, a + b - 0.5)),
}

/**
 * Blend two canvases (as ImageData) using a named blend mode + opacity.
 * Modifies `base` in place and returns it.
 */
export function blendImageData(
  base: ImageData,
  top: ImageData,
  mode: BlendMode,
  opacity: number = 1,
): ImageData {
  const fn = BLEND_FNS[mode] ?? BLEND_FNS.normal
  const bd = base.data
  const td = top.data
  const len = Math.min(bd.length, td.length)

  for (let i = 0; i < len; i += 4) {
    const ta = (td[i + 3] / 255) * opacity
    if (ta <= 0) continue

    const ar = bd[i] / 255, ag = bd[i + 1] / 255, ab = bd[i + 2] / 255
    const br = td[i] / 255, bg = td[i + 1] / 255, bb = td[i + 2] / 255

    const rr = fn(ar, br)
    const rg = fn(ag, bg)
    const rb = fn(ab, bb)

    bd[i]     = Math.round((ar * (1 - ta) + rr * ta) * 255)
    bd[i + 1] = Math.round((ag * (1 - ta) + rg * ta) * 255)
    bd[i + 2] = Math.round((ab * (1 - ta) + rb * ta) * 255)
  }

  return base
}

/**
 * Blend a top canvas onto a base canvas using the specified blend mode.
 * Both canvases must be the same size.
 */
export function blendCanvases(
  baseCtx: CanvasRenderingContext2D,
  topCanvas: HTMLCanvasElement,
  mode: BlendMode,
  opacity: number = 1,
): void {
  if (mode === 'normal' && opacity >= 1) {
    baseCtx.drawImage(topCanvas, 0, 0)
    return
  }

  if (mode === 'normal') {
    baseCtx.globalAlpha = opacity
    baseCtx.drawImage(topCanvas, 0, 0)
    baseCtx.globalAlpha = 1
    return
  }

  const w = baseCtx.canvas.width
  const h = baseCtx.canvas.height
  const baseData = baseCtx.getImageData(0, 0, w, h)

  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = w
  tmpCanvas.height = h
  const tmpCtx = tmpCanvas.getContext('2d')!
  tmpCtx.drawImage(topCanvas, 0, 0)
  const topData = tmpCtx.getImageData(0, 0, w, h)

  blendImageData(baseData, topData, mode, opacity)
  baseCtx.putImageData(baseData, 0, 0)
}

export { BLEND_FNS }

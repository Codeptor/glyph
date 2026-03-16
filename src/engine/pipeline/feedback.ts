import type { FeedbackConfig } from '@/types'
import { blendCanvases } from './blend'

/**
 * Temporal feedback buffer. Stores previous composite frame,
 * applies decay + spatial transforms, blends into current.
 */
export class FeedbackBuffer {
  private buffer: HTMLCanvasElement | null = null
  private bufCtx: CanvasRenderingContext2D | null = null

  /**
   * Apply feedback to the current composite canvas.
   * Call after all layers are composited, before output.
   */
  apply(
    canvas: HTMLCanvasElement,
    config: FeedbackConfig,
  ): void {
    if (!config.enabled) {
      this.buffer = null
      this.bufCtx = null
      return
    }

    const w = canvas.width
    const h = canvas.height
    const ctx = canvas.getContext('2d')!

    // Initialize buffer on first call or size change
    if (!this.buffer || this.buffer.width !== w || this.buffer.height !== h) {
      this.buffer = document.createElement('canvas')
      this.buffer.width = w
      this.buffer.height = h
      this.bufCtx = this.buffer.getContext('2d')!
      this.bufCtx.drawImage(canvas, 0, 0)
      return
    }

    // Apply decay to buffer
    const bufData = this.bufCtx!.getImageData(0, 0, w, h)
    const d = bufData.data
    const decay = config.decay
    for (let i = 0; i < d.length; i += 4) {
      d[i]     = Math.round(d[i] * decay)
      d[i + 1] = Math.round(d[i + 1] * decay)
      d[i + 2] = Math.round(d[i + 2] * decay)
    }

    // Apply hue shift if configured
    if (config.hueShift > 0.001) {
      this._hueShift(d, config.hueShift)
    }

    this.bufCtx!.putImageData(bufData, 0, 0)

    // Apply spatial transform
    if (config.transform !== 'none') {
      this._spatialTransform(config.transform, config.transformAmount, w, h)
    }

    // Blend buffer into current canvas
    blendCanvases(ctx, this.buffer!, config.blendMode, config.opacity)

    // Update buffer with the blended result
    this.bufCtx!.clearRect(0, 0, w, h)
    this.bufCtx!.drawImage(canvas, 0, 0)
  }

  private _spatialTransform(
    transform: FeedbackConfig['transform'],
    amount: number,
    w: number,
    h: number,
  ): void {
    if (!this.bufCtx || !this.buffer) return

    const temp = document.createElement('canvas')
    temp.width = w
    temp.height = h
    const tCtx = temp.getContext('2d')!
    tCtx.drawImage(this.buffer, 0, 0)

    this.bufCtx.clearRect(0, 0, w, h)

    switch (transform) {
      case 'zoom': {
        const m = Math.round(h * amount)
        const n = Math.round(w * amount)
        if (m > 0 && n > 0) {
          this.bufCtx.drawImage(temp, n, m, w - 2 * n, h - 2 * m, 0, 0, w, h)
        }
        break
      }
      case 'shrink': {
        const m = Math.round(h * amount)
        const n = Math.round(w * amount)
        this.bufCtx.drawImage(temp, 0, 0, w, h, n, m, w - 2 * n, h - 2 * m)
        break
      }
      case 'rotate-cw': {
        const angle = amount * 10
        this.bufCtx.save()
        this.bufCtx.translate(w / 2, h / 2)
        this.bufCtx.rotate(angle)
        this.bufCtx.translate(-w / 2, -h / 2)
        this.bufCtx.drawImage(temp, 0, 0)
        this.bufCtx.restore()
        break
      }
      case 'rotate-ccw': {
        const angle = -amount * 10
        this.bufCtx.save()
        this.bufCtx.translate(w / 2, h / 2)
        this.bufCtx.rotate(angle)
        this.bufCtx.translate(-w / 2, -h / 2)
        this.bufCtx.drawImage(temp, 0, 0)
        this.bufCtx.restore()
        break
      }
      case 'shift-up': {
        const px = Math.max(1, Math.round(h * amount))
        this.bufCtx.drawImage(temp, 0, px, w, h - px, 0, 0, w, h - px)
        break
      }
      case 'shift-down': {
        const px = Math.max(1, Math.round(h * amount))
        this.bufCtx.drawImage(temp, 0, 0, w, h - px, 0, px, w, h - px)
        break
      }
    }
  }

  private _hueShift(data: Uint8ClampedArray, amount: number): void {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255
      const g = data[i + 1] / 255
      const b = data[i + 2] / 255

      const mx = Math.max(r, g, b)
      const mn = Math.min(r, g, b)
      const delta = mx - mn

      if (delta < 0.001) continue

      let h = 0
      if (mx === r) h = ((g - b) / delta) % 6
      else if (mx === g) h = (b - r) / delta + 2
      else h = (r - g) / delta + 4
      h = ((h / 6) + amount) % 1
      if (h < 0) h += 1

      const s = delta / (mx + 1e-10)
      const v = mx

      const c = v * s
      const x = c * (1 - Math.abs((h * 6) % 2 - 1))
      const m = v - c
      let ro = 0, go = 0, bo = 0
      const h6 = h * 6
      if (h6 < 1) { ro = c; go = x }
      else if (h6 < 2) { ro = x; go = c }
      else if (h6 < 3) { go = c; bo = x }
      else if (h6 < 4) { go = x; bo = c }
      else if (h6 < 5) { ro = x; bo = c }
      else { ro = c; bo = x }

      data[i]     = Math.round((ro + m) * 255)
      data[i + 1] = Math.round((go + m) * 255)
      data[i + 2] = Math.round((bo + m) * 255)
    }
  }

  reset(): void {
    this.buffer = null
    this.bufCtx = null
  }
}

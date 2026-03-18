import type { Layer, TonemapConfig } from '@/types'
import { pixelBrightness, adjustBrightness } from './brightness.ts'
import { DITHER_FUNCTIONS } from './dither.ts'
import { STYLE_RENDERERS } from './styles/index.ts'
import type { RenderContext } from './styles/types.ts'
import { PRE_RENDER_FX, POST_RENDER_FX } from './fx.ts'
import { drawBgDitherPass, drawInverseDitherPass, drawBorderGlowOverlay } from './renderUtils.ts'
import { tonemap } from './pipeline/tonemap.ts'
import { blendCanvases } from './pipeline/blend.ts'
import { generateMask, applyMaskToCanvas } from './pipeline/masks.ts'
import { FeedbackBuffer } from './pipeline/feedback.ts'
import { ShaderChain } from './pipeline/shaders.ts'
import { FIELD_GENERATORS } from './generative/fields.ts'
import { ParticleSystem } from './generative/particles.ts'

export class AsciiRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private samplerCanvas: HTMLCanvasElement
  private sampler: CanvasRenderingContext2D
  private animId: number = 0
  private startTime: number = 0
  private frameCount: number = 0
  private lastFpsTime: number = 0
  private source: HTMLImageElement | HTMLVideoElement | null = null
  private mouseX: number = -1
  private mouseY: number = -1
  private layerCanvases: Map<string, HTMLCanvasElement> = new Map()
  private layerCtxs: Map<string, CanvasRenderingContext2D> = new Map()
  private feedbackBuffer: FeedbackBuffer = new FeedbackBuffer()
  private shaderChains: Map<string, ShaderChain> = new Map()
  private particleSystems: Map<string, ParticleSystem> = new Map()
  private tonemapConfig: TonemapConfig = { enabled: false, gamma: 0.75 }
  private lastTime: number = 0
  private _timeOverride: number | null = null

  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvas.style.display = 'block'
    const ctx = this.canvas.getContext('2d', { willReadFrequently: false })
    if (!ctx) throw new Error('Failed to get canvas 2d context')
    this.ctx = ctx

    this.samplerCanvas = document.createElement('canvas')
    const sampler = this.samplerCanvas.getContext('2d', { willReadFrequently: true })
    if (!sampler) throw new Error('Failed to get sampler 2d context')
    this.sampler = sampler
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  getSource(): HTMLImageElement | HTMLVideoElement | null {
    return this.source
  }

  setSource(el: HTMLImageElement | HTMLVideoElement | null): void {
    this.source = el
  }

  setMouse(x: number, y: number): void {
    this.mouseX = x
    this.mouseY = y
  }

  setTonemapConfig(config: TonemapConfig): void {
    this.tonemapConfig = config
  }

  setTimeOverride(seconds: number | null): void {
    this._timeOverride = seconds
  }

  resize(w: number, h: number): void {
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }
  }

  private getSourceDimensions(): { sw: number; sh: number } | null {
    if (!this.source) return null
    if (this.source instanceof HTMLImageElement) {
      if (!this.source.naturalWidth) return null
      return { sw: this.source.naturalWidth, sh: this.source.naturalHeight }
    }
    if (!this.source.videoWidth) return null
    return { sw: this.source.videoWidth, sh: this.source.videoHeight }
  }

  computeCanvasSize(
    aspectRatio: string,
    containerW: number,
    containerH: number,
  ): { w: number; h: number } {
    const dims = this.getSourceDimensions()
    let ratio: number | null = null

    switch (aspectRatio) {
      case '16:9': ratio = 16 / 9; break
      case '4:3': ratio = 4 / 3; break
      case '1:1': ratio = 1; break
      case '3:4': ratio = 3 / 4; break
      case '9:16': ratio = 9 / 16; break
      default:
        if (dims) ratio = dims.sw / dims.sh
        break
    }

    if (!ratio) return { w: containerW, h: containerH }

    let w = containerW
    let h = w / ratio
    if (h > containerH) {
      h = containerH
      w = h * ratio
    }
    return { w: Math.round(w), h: Math.round(h) }
  }

  private getLayerCanvas(layerId: string, w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    let canvas = this.layerCanvases.get(layerId)
    let ctx = this.layerCtxs.get(layerId)
    if (!canvas || canvas.width !== w || canvas.height !== h) {
      canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      ctx = canvas.getContext('2d')!
      this.layerCanvases.set(layerId, canvas)
      this.layerCtxs.set(layerId, ctx)
    }
    return { canvas: canvas!, ctx: ctx! }
  }

  private getShaderChain(layerId: string): ShaderChain {
    let chain = this.shaderChains.get(layerId)
    if (!chain) {
      chain = new ShaderChain()
      this.shaderChains.set(layerId, chain)
    }
    return chain
  }

  private getParticleSystem(layerId: string): ParticleSystem {
    let ps = this.particleSystems.get(layerId)
    if (!ps) {
      ps = new ParticleSystem()
      this.particleSystems.set(layerId, ps)
    }
    return ps
  }

  render(layers: Layer[], backgroundColor: string, _aspectRatio?: string): void {
    const { width, height } = this.canvas
    if (width === 0 || height === 0) return

    const time = this._timeOverride ?? (performance.now() - this.startTime) / 1000
    const dt = time - this.lastTime
    this.lastTime = time

    // Clear main canvas
    this.ctx.fillStyle = backgroundColor
    this.ctx.fillRect(0, 0, width, height)

    let postFxLayer: Layer | null = null

    for (const layer of layers) {
      if (layer.opacity <= 0) continue

      // Get per-layer offscreen canvas
      const { canvas: layerCanvas, ctx: layerCtx } = this.getLayerCanvas(layer.id, width, height)
      layerCtx.clearRect(0, 0, width, height)

      // Swap context to layer canvas for renderLayer
      const origCtx = this.ctx
      this.ctx = layerCtx

      // Render the layer content
      if (layer.sourceType === 'generative') {
        this.renderGenerativeLayer(layer, width, height, time)
      } else {
        this.renderLayer(layer, width, height, time)
      }

      // Restore original context
      this.ctx = origCtx

      // Particles overlay on layer canvas
      if (layer.particles.enabled) {
        const ps = this.getParticleSystem(layer.id)
        ps.setConfig(layer.particles)
        ps.update(Math.min(dt, 0.05), width, height)
        ps.render(layerCtx, width, height)
      }

      // Mask
      if (layer.mask.type !== 'none') {
        const cellWidth = layer.fontSize * layer.characterSpacing
        const cellHeight = layer.fontSize * 1.2
        const cols = Math.max(1, Math.floor(width / cellWidth))
        const rows = Math.max(1, Math.floor(height / cellHeight))
        const mask = generateMask(layer.mask, cols, rows, time)
        applyMaskToCanvas(layerCtx, mask, cols, rows, width, height)
      }

      // Shader chain on layer canvas
      if (layer.shaderChain.length > 0) {
        const chain = this.getShaderChain(layer.id)
        chain.setEntries(layer.shaderChain)
        chain.apply(layerCtx, width, height, time)
      }

      // Track post-render FX layer
      if (layer.fxPreset !== 'none' && POST_RENDER_FX[layer.fxPreset]) {
        postFxLayer = layer
      }

      // Composite layer onto main canvas using blend mode
      blendCanvases(this.ctx, layerCanvas, layer.blendMode, layer.opacity)
    }

    // Post-render FX (CRT, matrix-rain) on the composited result
    if (postFxLayer) {
      const fxFn = POST_RENDER_FX[postFxLayer.fxPreset]
      if (fxFn) {
        this.ctx.save()
        fxFn(this.ctx, width, height, postFxLayer, time)
        this.ctx.restore()
      }
    }

    // Feedback buffer on the final composite
    const feedbackLayer = layers.find(l => l.feedback.enabled)
    if (feedbackLayer) {
      this.feedbackBuffer.apply(this.canvas, feedbackLayer.feedback)
    } else {
      this.feedbackBuffer.reset()
    }
  }

  private renderLayer(
    layer: Layer,
    width: number,
    height: number,
    time: number,
  ): void {
    const dims = this.getSourceDimensions()
    if (!dims || !this.source) return

    const cellWidth = layer.fontSize * layer.characterSpacing
    const cellHeight = layer.fontSize * 1.2
    const cols = Math.max(1, Math.floor(width / cellWidth))
    const rows = Math.max(1, Math.floor(height / cellHeight))

    // sample source into grid
    this.samplerCanvas.width = cols
    this.samplerCanvas.height = rows
    this.sampler.drawImage(this.source, 0, 0, dims.sw, dims.sh, 0, 0, cols, rows)

    let imageData: ImageData
    try {
      imageData = this.sampler.getImageData(0, 0, cols, rows)
    } catch {
      return
    }
    const data = imageData.data

    const totalCells = cols * rows
    const brightnessGrid = new Float32Array(totalCells)
    const colorGrid: Array<[number, number, number]> = new Array(totalCells)

    for (let i = 0; i < totalCells; i++) {
      const off = i * 4
      const r = data[off]
      const g = data[off + 1]
      const b = data[off + 2]

      colorGrid[i] = [r, g, b]
      let bri = pixelBrightness(r, g, b)
      bri = adjustBrightness(bri, layer.brightness, layer.contrast)
      brightnessGrid[i] = bri
    }

    // Apply tonemap if enabled
    if (this.tonemapConfig.enabled) {
      const tonemapped = tonemap(brightnessGrid, cols, rows, this.tonemapConfig.gamma)
      brightnessGrid.set(tonemapped)
    }

    // apply pre-render FX (noise, intervals, beam) to brightness grid
    const preFx = PRE_RENDER_FX[layer.fxPreset]
    if (preFx) {
      preFx(brightnessGrid, cols, rows, layer, time)
    }

    // apply dithering
    const ditherFn = DITHER_FUNCTIONS[layer.ditherAlgorithm]
    const dithered = ditherFn(brightnessGrid, cols, rows, layer.ditherStrength)

    // draw bgDither dots (behind characters)
    if (layer.bgDither > 0) {
      this.ctx.save()
      drawBgDitherPass(
        this.ctx, dithered, colorGrid, cols, rows, cellWidth, cellHeight,
        layer.bgDither, time, layer.artStyle, layer.colorMode, layer.customColor,
        layer.retroDuotone, layer.opacity,
      )
      this.ctx.restore()
    }

    // draw inverseDither fills (behind characters)
    if (layer.inverseDither > 0) {
      this.ctx.save()
      const invertedBg = layer.invertColor ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'
      drawInverseDitherPass(
        this.ctx, dithered, cols, rows, cellWidth, cellHeight,
        layer.inverseDither, time, layer.opacity, invertedBg,
      )
      this.ctx.restore()
    }

    const rc: RenderContext = {
      ctx: this.ctx,
      brightnessGrid: dithered,
      colorGrid,
      cols,
      rows,
      layer,
      cellWidth,
      cellHeight,
      time,
      mouseX: this.mouseX,
      mouseY: this.mouseY,
    }

    const styleFn = STYLE_RENDERERS[layer.artStyle]
    if (styleFn) {
      this.ctx.save()
      styleFn(rc)
      this.ctx.restore()
    }

    // draw border glow overlay (on top of everything)
    if (layer.borderGlow > 0.001) {
      this.ctx.save()
      drawBorderGlowOverlay(
        this.ctx, width, height, layer.artStyle, layer.colorMode,
        layer.customColor, layer.retroDuotone, layer.borderGlow, layer.invertColor,
      )
      this.ctx.restore()
    }
  }

  private renderGenerativeLayer(
    layer: Layer,
    width: number,
    height: number,
    time: number,
  ): void {
    const cellWidth = layer.fontSize * layer.characterSpacing
    const cellHeight = layer.fontSize * 1.2
    const cols = Math.max(1, Math.floor(width / cellWidth))
    const rows = Math.max(1, Math.floor(height / cellHeight))

    // Generate brightness + color from procedural field
    const fieldFn = FIELD_GENERATORS[layer.generativeField]
    if (!fieldFn) return
    const { brightness: brightnessGrid, colors: colorGrid } = fieldFn(
      cols, rows, time,
      layer.generativeScale, layer.generativeSpeed, layer.generativeComplexity,
    )

    // Apply tonemap if enabled
    let grid = brightnessGrid
    if (this.tonemapConfig.enabled) {
      grid = tonemap(grid, cols, rows, this.tonemapConfig.gamma)
    }

    // Apply pre-render FX
    const preFx = PRE_RENDER_FX[layer.fxPreset]
    if (preFx) {
      preFx(grid, cols, rows, layer, time)
    }

    // Apply dithering
    const ditherFn = DITHER_FUNCTIONS[layer.ditherAlgorithm]
    const dithered = ditherFn(grid, cols, rows, layer.ditherStrength)

    // BG dither pass
    if (layer.bgDither > 0) {
      this.ctx.save()
      drawBgDitherPass(
        this.ctx, dithered, colorGrid, cols, rows, cellWidth, cellHeight,
        layer.bgDither, time, layer.artStyle, layer.colorMode, layer.customColor,
        layer.retroDuotone, layer.opacity,
      )
      this.ctx.restore()
    }

    // Inverse dither pass
    if (layer.inverseDither > 0) {
      this.ctx.save()
      const invertedBg = layer.invertColor ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'
      drawInverseDitherPass(
        this.ctx, dithered, cols, rows, cellWidth, cellHeight,
        layer.inverseDither, time, layer.opacity, invertedBg,
      )
      this.ctx.restore()
    }

    // Style renderer
    const rc: RenderContext = {
      ctx: this.ctx,
      brightnessGrid: dithered,
      colorGrid,
      cols, rows,
      layer,
      cellWidth, cellHeight,
      time,
      mouseX: this.mouseX,
      mouseY: this.mouseY,
    }

    const styleFn = STYLE_RENDERERS[layer.artStyle]
    if (styleFn) {
      this.ctx.save()
      styleFn(rc)
      this.ctx.restore()
    }

    // Border glow
    if (layer.borderGlow > 0.001) {
      this.ctx.save()
      drawBorderGlowOverlay(
        this.ctx, width, height, layer.artStyle, layer.colorMode,
        layer.customColor, layer.retroDuotone, layer.borderGlow, layer.invertColor,
      )
      this.ctx.restore()
    }
  }

  startLoop(
    layers: Layer[],
    backgroundColor: string,
    aspectRatio: string,
    onFps: (fps: number) => void,
  ): void {
    this.stopLoop()
    this.startTime = performance.now()
    this.frameCount = 0
    this.lastFpsTime = performance.now()

    // store references for the closure — caller should call startLoop again on changes
    let currentLayers = layers
    let currentBg = backgroundColor
    let currentAr = aspectRatio

    const frame = (): void => {
      this.render(currentLayers, currentBg, currentAr)
      this.frameCount++

      const now = performance.now()
      const elapsed = now - this.lastFpsTime
      if (elapsed >= 1000) {
        onFps(Math.round((this.frameCount * 1000) / elapsed))
        this.frameCount = 0
        this.lastFpsTime = now
      }

      this.animId = requestAnimationFrame(frame)
    }

    // expose update method via closure
    this._updateLoop = (l: Layer[], bg: string, ar: string) => {
      currentLayers = l
      currentBg = bg
      currentAr = ar
    }

    this.animId = requestAnimationFrame(frame)
  }

  // internal reference for updating loop params without restarting
  private _updateLoop: ((l: Layer[], bg: string, ar: string) => void) | null = null

  updateLoop(layers: Layer[], backgroundColor: string, aspectRatio: string): void {
    if (this._updateLoop) {
      this._updateLoop(layers, backgroundColor, aspectRatio)
    }
  }

  stopLoop(): void {
    if (this.animId) {
      cancelAnimationFrame(this.animId)
      this.animId = 0
    }
    this._updateLoop = null
  }

  destroy(): void {
    this.stopLoop()
    this.source = null
    this.layerCanvases.clear()
    this.layerCtxs.clear()
    this.feedbackBuffer.reset()
    this.shaderChains.clear()
    this.particleSystems.forEach(ps => ps.reset())
    this.particleSystems.clear()
  }

  toDataURL(): string {
    return this.canvas.toDataURL('image/png')
  }

  exportSourceImage(): string | null {
    const dims = this.getSourceDimensions()
    if (!dims || !this.source) return null
    const temp = document.createElement('canvas')
    temp.width = dims.sw
    temp.height = dims.sh
    const ctx = temp.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(this.source, 0, 0)
    return temp.toDataURL('image/png')
  }

  exportLayerImages(
    layers: Layer[],
    backgroundColor: string,
  ): { dataUrl: string; name: string; width: number; height: number }[] {
    const { width, height } = this.canvas
    if (width === 0 || height === 0) return []
    const time = (performance.now() - this.startTime) / 1000

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return []

    const origCtx = this.ctx
    const results: { dataUrl: string; name: string; width: number; height: number }[] = []

    for (const layer of layers) {
      if (layer.opacity <= 0) continue

      tempCtx.clearRect(0, 0, width, height)
      tempCtx.fillStyle = backgroundColor
      tempCtx.fillRect(0, 0, width, height)

      this.ctx = tempCtx
      this.renderLayer(layer, width, height, time)
      this.ctx = origCtx

      results.push({
        dataUrl: tempCanvas.toDataURL('image/png'),
        name: layer.name,
        width,
        height,
      })
    }

    return results
  }
}

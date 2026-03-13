import type { Layer } from '@/types'

export interface RenderContext {
  ctx: CanvasRenderingContext2D
  brightnessGrid: Float32Array
  colorGrid: Array<[number, number, number]>
  cols: number
  rows: number
  layer: Layer
  cellWidth: number
  cellHeight: number
  time: number
  mouseX: number
  mouseY: number
}

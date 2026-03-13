import type { AsciiRenderer } from '@/engine/AsciiRenderer'

let _renderer: AsciiRenderer | null = null

export function setGlobalRenderer(r: AsciiRenderer | null) {
  _renderer = r
}

export function getGlobalRenderer(): AsciiRenderer | null {
  return _renderer
}

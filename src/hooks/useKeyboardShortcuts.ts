import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { getGlobalRenderer } from '@/lib/rendererRef'
import { downloadDataUrl } from '@/lib/exportGenerators'
import type { ArtStyle } from '@/types'

const ART_STYLES: ArtStyle[] = [
  'classic', 'braille', 'halftone', 'dotcross', 'line',
  'particles', 'claude-code', 'retro', 'terminal',
]

interface Options {
  onOpenExport: () => void
}

export function useKeyboardShortcuts({ onOpenExport }: Options) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'

      // Ctrl/Cmd shortcuts work even in inputs
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's': {
            e.preventDefault()
            const renderer = getGlobalRenderer()
            if (renderer) {
              downloadDataUrl(renderer.toDataURL(), `glyph-${Date.now()}.png`)
            }
            return
          }
          case 'e': {
            e.preventDefault()
            onOpenExport()
            return
          }
          case 'z': {
            e.preventDefault()
            if (e.shiftKey) {
              useStore.getState().redo()
            } else {
              useStore.getState().undo()
            }
            return
          }
          case 'r': {
            if (!isInput) {
              e.preventDefault()
              useStore.getState().randomizeActiveLayer()
            }
            return
          }
        }
      }

      // Non-modifier shortcuts only fire outside inputs
      if (isInput) return

      switch (e.key.toLowerCase()) {
        case 'f': {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {})
          } else {
            document.exitFullscreen().catch(() => {})
          }
          return
        }
        case 'h': {
          const state = useStore.getState()
          state.setSidebarHidden(!state.sidebarHidden)
          return
        }
        case '[': {
          const state = useStore.getState()
          if (state.activeLayerIndex > 0) {
            state.setActiveLayerIndex(state.activeLayerIndex - 1)
          }
          return
        }
        case ']': {
          const state = useStore.getState()
          if (state.activeLayerIndex < state.layers.length - 1) {
            state.setActiveLayerIndex(state.activeLayerIndex + 1)
          }
          return
        }
      }

      // Number keys 1-9 for art style
      const num = parseInt(e.key)
      if (num >= 1 && num <= 9 && num <= ART_STYLES.length) {
        useStore.getState().updateActiveLayer({ artStyle: ART_STYLES[num - 1] })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onOpenExport])
}

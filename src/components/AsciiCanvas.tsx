import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { AsciiRenderer } from '@/engine/AsciiRenderer'
import { LeftModeButtons } from './LeftModeButtons'
import { LeftBottomBar } from './LeftBottomBar'

export function AsciiCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<AsciiRenderer | null>(null)
  const [fps, setFps] = useState(0)
  const [loopStarted, setLoopStarted] = useState(false)

  const layers = useStore((s) => s.layers)
  const backgroundColor = useStore((s) => s.backgroundColor)
  const aspectRatio = useStore((s) => s.aspectRatio)
  const sourceImage = useStore((s) => s.sourceImage)
  const sourceMode = useStore((s) => s.sourceMode)
  const sidebarHidden = useStore((s) => s.sidebarHidden)
  const setSidebarHidden = useStore((s) => s.setSidebarHidden)

  useEffect(() => {
    const renderer = new AsciiRenderer()
    rendererRef.current = renderer
    const container = containerRef.current
    if (container) {
      container.appendChild(renderer.getCanvas())
    }
    return () => {
      renderer.destroy()
      if (container) {
        const canvas = renderer.getCanvas()
        if (container.contains(canvas)) container.removeChild(canvas)
      }
      rendererRef.current = null
    }
  }, [])

  useEffect(() => {
    const renderer = rendererRef.current
    const container = containerRef.current
    if (!renderer || !container) return

    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      const { w, h } = renderer.computeCanvasSize(aspectRatio, rect.width, rect.height)
      renderer.resize(w, h)
    }

    handleResize()
    const observer = new ResizeObserver(handleResize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [aspectRatio])

  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer) return

    if (sourceMode === 'image' && sourceImage) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        renderer.setSource(img)
        const container = containerRef.current
        if (container) {
          const rect = container.getBoundingClientRect()
          const { w, h } = renderer.computeCanvasSize(aspectRatio, rect.width, rect.height)
          renderer.resize(w, h)
        }
        if (!loopStarted) {
          renderer.startLoop(layers, backgroundColor, aspectRatio, setFps)
          setLoopStarted(true)
        }
      }
      img.src = sourceImage
    } else if (sourceMode === 'image' && !sourceImage) {
      renderer.setSource(null)
    }
  }, [sourceImage, sourceMode])

  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer || !loopStarted) return
    renderer.updateLoop(layers, backgroundColor, aspectRatio)
  }, [layers, backgroundColor, aspectRatio, loopStarted])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const renderer = rendererRef.current
    if (!renderer) return
    const canvas = renderer.getCanvas()
    const rect = canvas.getBoundingClientRect()
    renderer.setMouse(e.clientX - rect.left, e.clientY - rect.top)
  }, [])

  const handleMouseLeave = useCallback(() => {
    rendererRef.current?.setMouse(-1, -1)
  }, [])

  return (
    <div id="canvas-container">
      <div
        className="ascii-renderer"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      <LeftModeButtons />
      <LeftBottomBar fps={fps} />
      <div className="left-sidebar-controls">
        <button
          className="left-mode-button"
          onClick={() => setSidebarHidden(!sidebarHidden)}
          title={sidebarHidden ? 'Show sidebar' : 'Hide sidebar'}
        >
          {sidebarHidden ? '\u25B6' : '\u25C0'}
        </button>
      </div>
    </div>
  )
}

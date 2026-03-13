import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { AsciiRenderer } from '@/engine/AsciiRenderer'
import { LeftModeButtons } from './LeftModeButtons'
import { LeftBottomBar } from './LeftBottomBar'
import { ExportPopover } from './ExportPopover'
import { SavePopover } from './SavePopover'
import { GalleryView } from './GalleryView'
import { TemplatesView } from './TemplatesView'

export function AsciiCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<AsciiRenderer | null>(null)
  const [fps, setFps] = useState(0)
  const [loopStarted, setLoopStarted] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  const layers = useStore((s) => s.layers)
  const backgroundColor = useStore((s) => s.backgroundColor)
  const aspectRatio = useStore((s) => s.aspectRatio)
  const sourceImage = useStore((s) => s.sourceImage)
  const sourceMode = useStore((s) => s.sourceMode)
  const sidebarHidden = useStore((s) => s.sidebarHidden)
  const setSidebarHidden = useStore((s) => s.setSidebarHidden)
  const addGalleryAsset = useStore((s) => s.addGalleryAsset)
  const leftPanel = useStore((s) => s.leftPanel)

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

  // Camera mode: receive video element from SourceUpload via custom event
  useEffect(() => {
    const handleCameraReady = (e: Event) => {
      const renderer = rendererRef.current
      if (!renderer) return
      const video = (e as CustomEvent).detail as HTMLVideoElement
      renderer.setSource(video)
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

    const handleCameraStop = () => {
      rendererRef.current?.setSource(null)
    }

    window.addEventListener('camera-ready', handleCameraReady)
    window.addEventListener('camera-stop', handleCameraStop)
    return () => {
      window.removeEventListener('camera-ready', handleCameraReady)
      window.removeEventListener('camera-stop', handleCameraStop)
    }
  }, [aspectRatio, loopStarted, layers, backgroundColor])

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

  const handleSaveToGallery = useCallback(() => {
    const renderer = rendererRef.current
    if (!renderer) return
    const dataUrl = renderer.toDataURL()
    addGalleryAsset({
      id: crypto.randomUUID(),
      name: `Creation ${new Date().toLocaleTimeString()}`,
      data: dataUrl,
      mimeType: 'image/png',
      createdAt: new Date().toISOString(),
    })
  }, [addGalleryAsset])

  const handleDownload = useCallback(() => {
    const renderer = rendererRef.current
    if (!renderer) return
    const dataUrl = renderer.toDataURL()
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `asc11-${Date.now()}.png`
    a.click()
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
          onClick={handleDownload}
          title="Download PNG"
        >
          ↓
        </button>
        <button
          className="left-mode-button"
          onClick={handleSaveToGallery}
          title="Save to gallery"
        >
          +
        </button>
        <button
          className="left-mode-button"
          onClick={() => setShowExport(!showExport)}
          title="Export preset"
        >
          { }
        </button>
        <button
          className="left-mode-button"
          onClick={() => setShowPresets(!showPresets)}
          title="Presets"
        >
          ★
        </button>
        <button
          className="left-mode-button"
          onClick={() => setSidebarHidden(!sidebarHidden)}
          title={sidebarHidden ? 'Show sidebar' : 'Hide sidebar'}
        >
          {sidebarHidden ? '▶' : '◀'}
        </button>
      </div>
      {showExport && <ExportPopover onClose={() => setShowExport(false)} />}
      {showPresets && <SavePopover onClose={() => setShowPresets(false)} />}
      {leftPanel === 'library' && <GalleryView />}
      {leftPanel === 'templates' && <TemplatesView />}
      {leftPanel === 'creations' && <GalleryView />}
    </div>
  )
}

import { useState, useCallback, useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarHeader } from './SidebarHeader'
import { SourceUpload } from './SourceUpload'
import { LayerTabs } from './LayerTabs'
import { ControlsPanel } from './ControlsPanel'
import { FooterBar } from './FooterBar'
import { ExportPopover } from './ExportPopover'
import { SavePopover } from './SavePopover'

const MIN_WIDTH = 280
const MAX_WIDTH = 520
const DEFAULT_WIDTH = 320

export function Sidebar() {
  const [showExport, setShowExport] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    isDragging.current = true
    startX.current = e.clientX
    startWidth.current = width
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [width])

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      const delta = startX.current - e.clientX
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta)))
    }

    const onPointerUp = () => {
      if (!isDragging.current) return
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [])

  return (
    <aside
      className="relative flex flex-col border-l border-border bg-background z-[var(--z-sidebar)]"
      style={{ width, minWidth: MIN_WIDTH, maxWidth: MAX_WIDTH }}
    >
      {/* Resize handle */}
      <div
        className="absolute inset-y-0 -left-1 w-2 cursor-col-resize z-20 group"
        onPointerDown={onPointerDown}
      >
        <div className="absolute inset-y-0 left-[3px] w-px bg-border group-hover:bg-accent/50 transition-colors" />
      </div>

      <ScrollArea className="flex-1">
        <SidebarHeader />
        <SourceUpload />
        <div className="px-4 py-2">
          <LayerTabs />
        </div>
        <ControlsPanel />
      </ScrollArea>
      <FooterBar
        onExport={() => setShowExport(!showExport)}
        onPresets={() => setShowPresets(!showPresets)}
      />
      {showExport && <ExportPopover onClose={() => setShowExport(false)} />}
      {showPresets && <SavePopover onClose={() => setShowPresets(false)} />}
    </aside>
  )
}

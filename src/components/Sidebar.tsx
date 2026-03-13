import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarHeader } from './SidebarHeader'
import { SourceUpload } from './SourceUpload'
import { LayerTabs } from './LayerTabs'
import { ControlsPanel } from './ControlsPanel'
import { FooterBar } from './FooterBar'
import { ExportPopover } from './ExportPopover'
import { SavePopover } from './SavePopover'

export function Sidebar() {
  const [showExport, setShowExport] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  return (
    <aside className="relative flex w-[var(--sidebar-width)] min-w-[var(--sidebar-width)] flex-col border-l border-border bg-background z-[var(--z-sidebar)]">
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

import { useState } from 'react'
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
    <aside className="ui-layer">
      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
        <SidebarHeader />
        <SourceUpload />
        <div style={{ padding: '0.6rem 1.2rem' }}>
          <LayerTabs />
        </div>
        <ControlsPanel />
      </div>
      <FooterBar
        onExport={() => setShowExport(!showExport)}
        onPresets={() => setShowPresets(!showPresets)}
      />
      {showExport && <ExportPopover onClose={() => setShowExport(false)} />}
      {showPresets && <SavePopover onClose={() => setShowPresets(false)} />}
    </aside>
  )
}

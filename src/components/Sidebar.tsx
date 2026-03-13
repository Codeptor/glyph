import { SidebarHeader } from './SidebarHeader'
import { SourceUpload } from './SourceUpload'
import { LayerTabs } from './LayerTabs'
import { ControlsPanel } from './ControlsPanel'
import { PresetsPanel } from './PresetsPanel'

export function Sidebar() {
  return (
    <div className="ui-layer">
      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
        <SidebarHeader />
        <SourceUpload />
        <div style={{ padding: '0.6rem 1.2rem' }}>
          <LayerTabs />
        </div>
        <ControlsPanel />
        <PresetsPanel />
      </div>
    </div>
  )
}

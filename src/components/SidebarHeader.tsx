import { useStore } from '@/store/useStore'

export function SidebarHeader() {
  const exportPreset = useStore((s) => s.exportPreset)

  const handleExportPreset = () => {
    const json = exportPreset()
    navigator.clipboard.writeText(json)
  }

  return (
    <div className="hero-edition">
      <div className="hero-title-group">
        <div className="ascii-mark">ASC11</div>
        <div className="hero-description">
          Convert images and video into stylized ASCII art with real-time effects and customization.
        </div>
      </div>
      <div className="header-action-row">
        <button className="header-legal-link" onClick={handleExportPreset}>
          Export
        </button>
        <span className="changelog-link">v1.0</span>
      </div>
    </div>
  )
}

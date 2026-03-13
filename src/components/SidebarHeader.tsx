import { Link } from 'react-router-dom'
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
        <Link to="/terms" className="header-legal-link">
          Terms
        </Link>
        <Link to="/privacy" className="header-legal-link">
          Privacy
        </Link>
        <span className="changelog-link">v1.0</span>
      </div>
    </div>
  )
}

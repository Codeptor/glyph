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
        <div className="ascii-mark">ASCII</div>
        <div className="hero-description">
          ASCII editor for art, video, live cam, and canvas exports
        </div>
      </div>
      <div className="header-action-row">
        <Link to="/terms" className="header-legal-link">
          TERMS
        </Link>
        <Link to="/privacy" className="header-legal-link">
          PRIVACY
        </Link>
        <button className="header-legal-link" onClick={handleExportPreset}>
          CHANGELOG
        </button>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { useStore } from '@/store/useStore'

export function SidebarHeader() {
  const exportPreset = useStore((s) => s.exportPreset)

  const handleExportPreset = () => {
    const json = exportPreset()
    navigator.clipboard.writeText(json)
  }

  return (
    <div className="flex flex-col gap-1 px-4 pt-4 pb-2">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tighter text-foreground">
          ASCII
        </span>
        <span className="text-[10px] text-muted-foreground leading-snug">
          ASCII editor for art, video, live cam, and canvas exports
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          to="/terms"
          className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-crosshair"
        >
          Terms
        </Link>
        <Link
          to="/privacy"
          className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-crosshair"
        >
          Privacy
        </Link>
        <button
          className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-crosshair bg-transparent border-none"
          onClick={handleExportPreset}
        >
          Changelog
        </button>
      </div>
    </div>
  )
}

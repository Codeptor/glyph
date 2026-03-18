import { SourcePanel } from '@/components/left/SourcePanel'
import { LayerStack } from '@/components/left/LayerStack'
import { CompositionPanel } from '@/components/left/CompositionPanel'
import { GlobalPanel } from '@/components/left/GlobalPanel'

interface LeftSidebarProps {
  onExport?: () => void
}

export function LeftSidebar({ onExport }: LeftSidebarProps) {
  return (
    <aside className="w-[280px] shrink-0 border-r border-zinc-800 bg-zinc-950 overflow-y-auto h-full">
      <div className="space-y-1 py-2">
        <SourcePanel />
        <LayerStack />
        <CompositionPanel />
        <GlobalPanel onExport={onExport} />
      </div>
    </aside>
  )
}

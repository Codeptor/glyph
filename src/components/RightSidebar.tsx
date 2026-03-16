import { StylePanel } from '@/components/right/StylePanel'
import { DitherPanel } from '@/components/right/DitherPanel'
import { ColorPanel } from '@/components/right/ColorPanel'
import { EffectsPanel } from '@/components/right/EffectsPanel'
import { AdjustmentsPanel } from '@/components/right/AdjustmentsPanel'

export function RightSidebar() {
  return (
    <aside className="w-[300px] shrink-0 border-l border-zinc-800 bg-zinc-950 overflow-y-auto h-full">
      <div className="space-y-1 py-2">
        <StylePanel />
        <DitherPanel />
        <ColorPanel />
        <EffectsPanel />
        <AdjustmentsPanel />
      </div>
    </aside>
  )
}

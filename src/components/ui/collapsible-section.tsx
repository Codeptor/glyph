import { useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { ChevronDown } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-200 transition-colors">
        {title}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? '' : '-rotate-90'}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

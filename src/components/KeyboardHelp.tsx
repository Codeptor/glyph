import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
const mod = isMac ? '\u2318' : 'Ctrl'

const SHORTCUTS = [
  { section: 'File' as const, items: [
    { keys: `${mod}+S`, action: 'Save PNG' },
    { keys: `${mod}+E`, action: 'Open export dialog' },
  ]},
  { section: 'Edit' as const, items: [
    { keys: `${mod}+Z`, action: 'Undo' },
    { keys: `${mod}+Shift+Z`, action: 'Redo' },
    { keys: `${mod}+R`, action: 'Randomize layer' },
  ]},
  { section: 'View' as const, items: [
    { keys: 'F', action: 'Toggle fullscreen' },
    { keys: 'H', action: 'Toggle sidebar' },
    { keys: '?', action: 'Keyboard shortcuts' },
  ]},
  { section: 'Layers' as const, items: [
    { keys: '[ / ]', action: 'Switch layers' },
    { keys: '1-9', action: 'Set art style' },
  ]},
]

interface Props {
  open: boolean
  onClose: () => void
}

export function KeyboardHelp({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm uppercase tracking-wider">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {SHORTCUTS.map((group) => (
            <div key={group.section}>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{group.section}</h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <div key={item.keys} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.action}</span>
                    <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {item.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

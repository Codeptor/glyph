import { useState, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { AsciiCanvas } from '@/components/AsciiCanvas'
import { Sidebar } from '@/components/Sidebar'
import { ToastProvider } from '@/components/Toast'
import { DragOverlay } from '@/components/DragOverlay'
import { DBInit } from '@/components/DBInit'
import { MobileDisclaimer } from '@/components/MobileDisclaimer'
import { ExportPopover } from '@/components/ExportPopover'
import { KeyboardHelp } from '@/components/KeyboardHelp'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function App() {
  const themeMode = useStore((s) => s.themeMode)
  const sidebarHidden = useStore((s) => s.sidebarHidden)
  const [showExport, setShowExport] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const openExport = useCallback(() => setShowExport(true), [])
  const openShortcuts = useCallback(() => setShowShortcuts(true), [])

  useKeyboardShortcuts({ onOpenExport: openExport, onOpenShortcuts: openShortcuts })

  return (
    <ToastProvider>
      <DBInit />
      <main
        className={`flex h-full w-full ${themeMode === 'light' ? 'light' : ''}`}
      >
        <AsciiCanvas />
        {!sidebarHidden && <Sidebar />}
      </main>
      <DragOverlay />
      <MobileDisclaimer />
      {showExport && <ExportPopover onClose={() => setShowExport(false)} />}
      <KeyboardHelp open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </ToastProvider>
  )
}

export default App

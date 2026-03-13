import { useStore } from '@/store/useStore'
import { AsciiCanvas } from '@/components/AsciiCanvas'
import { Sidebar } from '@/components/Sidebar'
import { ToastProvider } from '@/components/Toast'
import { DragOverlay } from '@/components/DragOverlay'
import { DBInit } from '@/components/DBInit'

function App() {
  const themeMode = useStore((s) => s.themeMode)
  const sidebarHidden = useStore((s) => s.sidebarHidden)

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
    </ToastProvider>
  )
}

export default App

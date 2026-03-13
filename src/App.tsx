import { useStore } from '@/store/useStore'
import { AsciiCanvas } from '@/components/AsciiCanvas'
import { Sidebar } from '@/components/Sidebar'
import '@/styles/variables.css'
import '@/styles/shell.css'
import '@/styles/canvas.css'
import '@/styles/sidebar.css'
import '@/styles/controls.css'
import '@/styles/upload.css'
import '@/styles/gallery.css'
import '@/styles/export.css'
import '@/styles/presets.css'
import '@/styles/toast.css'
import '@/styles/footer.css'
import '@/styles/drag.css'

function App() {
  const themeMode = useStore((s) => s.themeMode)
  const sidebarHidden = useStore((s) => s.sidebarHidden)

  return (
    <div
      className={`a7-shell${sidebarHidden ? ' is-right-sidebar-hidden' : ''}`}
      data-theme={themeMode}
    >
      <AsciiCanvas />
      {!sidebarHidden && <Sidebar />}
    </div>
  )
}

export default App

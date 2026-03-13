import { useStore } from '@/store/useStore'

function App() {
  const themeMode = useStore((s) => s.themeMode)

  return (
    <div className="app-shell" data-theme={themeMode}>
      <header className="app-header">
        <div className="app-logo">ASC11</div>
      </header>
      <main className="app-main">
        <aside className="app-sidebar-left" />
        <section className="app-canvas" />
        <aside className="app-sidebar-right" />
      </main>
    </div>
  )
}

export default App

export function SidebarHeader() {
  return (
    <div className="flex flex-col gap-1.5 px-4 pt-4 pb-2">
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold tracking-tighter font-mono text-accent">
          GLYPH
        </span>
        <span className="text-[10px] text-muted-foreground leading-snug">
          ascii art generator
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-muted-foreground/50 font-mono">v1.0</span>
        <a
          href="https://github.com/Codeptor/glyph"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors cursor-crosshair"
        >
          GitHub
        </a>
        <button
          className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-crosshair bg-transparent border-none"
          onClick={() => {
            window.open('https://github.com/Codeptor/glyph/issues', '_blank')
          }}
        >
          Feedback
        </button>
      </div>
    </div>
  )
}

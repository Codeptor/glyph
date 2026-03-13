export function SidebarHeader() {
  return (
    <div className="flex flex-col gap-3 px-4 pt-5 pb-3">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-accent text-accent-foreground font-mono font-black text-sm leading-none select-none">
          G
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight font-mono text-foreground leading-none">
            GLYPH
          </span>
          <span className="text-[9px] text-muted-foreground/60 tracking-widest uppercase mt-0.5">
            ASCII Art Engine
          </span>
        </div>
      </div>

      {/* Links */}
      <div className="flex items-center gap-2 border-t border-border/50 pt-2.5">
        <a
          href="https://github.com/Codeptor/glyph"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70 hover:text-accent transition-colors cursor-crosshair"
        >
          GitHub
        </a>
        <span className="text-muted-foreground/20 text-[9px]">/</span>
        <a
          href="https://github.com/Codeptor/glyph/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70 hover:text-foreground transition-colors cursor-crosshair"
        >
          Feedback
        </a>
        <span className="text-muted-foreground/20 text-[9px]">/</span>
        <span className="text-[9px] text-muted-foreground/30 font-mono">v1.0</span>
      </div>
    </div>
  )
}

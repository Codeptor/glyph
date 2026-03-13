import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { AspectRatio } from '@/types'

const ASPECTS: { value: AspectRatio; label: string }[] = [
  { value: 'original', label: 'Original' },
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '1:1', label: '1:1' },
  { value: '3:4', label: '3:4' },
  { value: '9:16', label: '9:16' },
]

interface Props {
  fps: number
}

export function LeftBottomBar({ fps }: Props) {
  const aspectRatio = useStore((s) => s.aspectRatio)
  const setAspectRatio = useStore((s) => s.setAspectRatio)
  const backgroundColor = useStore((s) => s.backgroundColor)
  const setBackgroundColor = useStore((s) => s.setBackgroundColor)

  const fpsDisplay = fps > 0 ? `FPS ${fps}` : 'FPS --'
  const fpsColor = fps > 0 && fps < 15 ? 'text-destructive' : fps > 0 && fps < 25 ? 'text-[var(--accent)]' : 'text-muted-foreground'

  return (
    <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
      <span className={`text-[10px] font-mono uppercase tracking-wider ${fpsColor}`}>
        {fpsDisplay}
      </span>
      <div className="flex items-center gap-0.5">
        {ASPECTS.map((a) => (
          <Button
            key={a.value}
            variant={aspectRatio === a.value ? 'default' : 'ghost'}
            size="xs"
            className="text-[10px] cursor-crosshair"
            onClick={() => setAspectRatio(a.value)}
          >
            {a.label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">BG</span>
        <Input
          type="text"
          value={backgroundColor}
          onChange={(e) => {
            const v = e.target.value
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setBackgroundColor(v)
          }}
          className="h-6 w-20 text-[10px] font-mono bg-transparent border-border cursor-crosshair"
          title="Background color"
        />
      </div>
    </div>
  )
}

import { useStore } from '@/store/useStore'
import type { AspectRatio } from '@/types'

const ASPECTS: { value: AspectRatio; label: string }[] = [
  { value: 'original', label: 'OG' },
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

  const fpsClass = fps < 15 ? ' is-critical' : fps < 25 ? ' is-warning' : ''

  return (
    <div className="left-bottom-bar">
      <div className={`fps-overlay${fpsClass}`}>{fps} FPS</div>
      <div className="aspect-overlay-tabs">
        {ASPECTS.map((a) => (
          <button
            key={a.value}
            className={`aspect-overlay-tab${aspectRatio === a.value ? ' is-active' : ''}`}
            onClick={() => setAspectRatio(a.value)}
          >
            {a.label}
          </button>
        ))}
      </div>
      <div className="bg-overlay-picker">
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
          title="Background color"
        />
      </div>
    </div>
  )
}

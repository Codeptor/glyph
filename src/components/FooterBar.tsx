import { useStore } from '@/store/useStore'

interface Props {
  onExport: () => void
  onPresets: () => void
}

export function FooterBar({ onExport, onPresets }: Props) {
  const layers = useStore((s) => s.layers)
  const activeLayerIndex = useStore((s) => s.activeLayerIndex)
  const aspectRatio = useStore((s) => s.aspectRatio)
  const backgroundColor = useStore((s) => s.backgroundColor)
  const randomizeActiveLayer = useStore((s) => s.randomizeActiveLayer)

  const layer = layers[activeLayerIndex]
  if (!layer) return null

  const items = [
    { label: 'FMT', value: 'ASCII CANVAS' },
    { label: 'STYLE', value: layer.artStyle.toUpperCase().replace('-', ' ') },
    { label: 'FONT', value: layer.font.toUpperCase() },
    { label: 'AR', value: aspectRatio === 'original' ? 'SOURCE' : aspectRatio },
    { label: 'FX', value: layer.fxPreset === 'none' ? 'NONE' : layer.fxPreset.toUpperCase().replace('-', ' ') },
    { label: 'BG', value: backgroundColor },
    { label: 'RES', value: 'DYNAMIC' },
  ]

  return (
    <div className="app-footer">
      <div className="footer-links">
        {items.map((item) => (
          <span key={item.label} className="footer-link" style={{ cursor: 'default' }}>
            <span style={{ opacity: 0.5 }}>{item.label}</span>{' '}
            <span>{item.value}</span>
          </span>
        ))}
      </div>
      <div className="footer-links">
        <button className="footer-link" onClick={onPresets}>PRESETS</button>
        <button className="footer-link" onClick={randomizeActiveLayer}>RANDOM</button>
        <button className="footer-link" onClick={onExport}>EXPORT</button>
      </div>
    </div>
  )
}

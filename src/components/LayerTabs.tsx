import { useStore } from '@/store/useStore'

export function LayerTabs() {
  const layers = useStore((s) => s.layers)
  const activeLayerIndex = useStore((s) => s.activeLayerIndex)
  const setActiveLayerIndex = useStore((s) => s.setActiveLayerIndex)
  const addLayer = useStore((s) => s.addLayer)
  const removeLayer = useStore((s) => s.removeLayer)

  return (
    <div className="control-row">
      <div className="control-row-head">
        <div className="control-label">Layer</div>
        {layers.length > 1 && (
          <button
            className="header-legal-link"
            onClick={() => removeLayer(activeLayerIndex)}
          >
            Remove
          </button>
        )}
      </div>
      <div className="layer-tabs">
        {layers.map((layer, i) => (
          <button
            key={layer.id}
            className={`${i === activeLayerIndex ? 'active' : ''}`}
            onClick={() => setActiveLayerIndex(i)}
          >
            {layer.name}
          </button>
        ))}
        <button className="layer-add-button" onClick={addLayer}>ADD LAYER</button>
      </div>
    </div>
  )
}

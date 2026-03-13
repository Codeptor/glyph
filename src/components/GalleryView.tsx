import { useStore } from '@/store/useStore'

export function GalleryView() {
  const galleryAssets = useStore((s) => s.galleryAssets)
  const removeGalleryAsset = useStore((s) => s.removeGalleryAsset)
  const setSourceImage = useStore((s) => s.setSourceImage)

  if (galleryAssets.length === 0) {
    return (
      <div className="left-gallery-view">
        <div className="gallery-browser">
          <div className="gallery-header">
            <div className="gallery-header-title">Library</div>
          </div>
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            No images yet. Upload an image to get started.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="left-gallery-view">
      <div className="gallery-browser">
        <div className="gallery-header">
          <div className="gallery-header-title">Library ({galleryAssets.length})</div>
        </div>
        <div className="gallery-grid">
          {galleryAssets.map((asset) => (
            <div key={asset.id} className="asset-card-shell">
              <div
                className="gallery-item"
                onClick={() => setSourceImage(asset.data)}
              >
                <img src={asset.data} alt={asset.name} />
                <div className="gallery-item-name">{asset.name}</div>
              </div>
              <button
                className="asset-card-delete"
                onClick={(e) => {
                  e.stopPropagation()
                  removeGalleryAsset(asset.id)
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

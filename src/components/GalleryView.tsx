import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'

export function GalleryView() {
  const galleryAssets = useStore((s) => s.galleryAssets)
  const removeGalleryAsset = useStore((s) => s.removeGalleryAsset)
  const setSourceImage = useStore((s) => s.setSourceImage)

  return (
    <div className="absolute top-12 left-3 z-20 w-72 rounded-md border border-border bg-background/95 backdrop-blur-sm shadow-lg">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Library {galleryAssets.length > 0 && `(${galleryAssets.length})`}
        </span>
      </div>
      {galleryAssets.length === 0 ? (
        <div className="px-3 py-8 text-center text-[10px] uppercase tracking-wider text-muted-foreground/50">
          No images yet. Upload an image to get started.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 p-2 max-h-80 overflow-y-auto">
          {galleryAssets.map((asset) => (
            <div key={asset.id} className="group relative">
              <div
                className="aspect-square rounded-sm overflow-hidden cursor-crosshair border border-border hover:border-[var(--accent)] transition-colors"
                onClick={() => setSourceImage(asset.data)}
              >
                <img
                  src={asset.data}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-[8px] text-muted-foreground truncate mt-0.5 px-0.5">
                {asset.name}
              </div>
              <Button
                variant="destructive"
                size="xs"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  removeGalleryAsset(asset.id)
                }}
              >
                x
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

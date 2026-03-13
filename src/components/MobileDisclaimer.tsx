import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Monitor } from 'lucide-react'

export function MobileDisclaimer() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background/95 backdrop-blur-sm p-8 lg:hidden">
      <div className="max-w-sm text-center space-y-6">
        <Monitor className="h-12 w-12 mx-auto text-muted-foreground" />
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Desktop Recommended</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Glyph is a creative tool designed for larger screens. For the best
            experience with all controls and real-time rendering, please use a
            desktop or laptop.
          </p>
        </div>
        <Button
          variant="outline"
          className="cursor-crosshair"
          onClick={() => setDismissed(true)}
        >
          Continue Anyway
        </Button>
      </div>
    </div>
  )
}

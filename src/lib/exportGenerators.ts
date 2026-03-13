import type { Layer } from '@/types'

interface ExportConfig {
  layers: Layer[]
  backgroundColor: string
  aspectRatio: string
  canvasDataUrl: string
  width: number
  height: number
}

export function generateHtmlExport(config: ExportConfig): string {
  const { layers, backgroundColor, aspectRatio, canvasDataUrl, width, height } = config
  const safeAr = aspectRatio.replace(/"/g, '&quot;')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Glyph ASCII Export</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: ${backgroundColor}; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  canvas { max-width: 100%; height: auto; }
  .info { position: fixed; bottom: 12px; right: 12px; font-family: monospace; font-size: 10px; color: rgba(255,255,255,0.3); }
</style>
</head>
<body>
<canvas id="glyph-canvas" width="${width}" height="${height}"></canvas>
<div class="info">Generated with Glyph</div>
<script>
(function() {
  var canvas = document.getElementById('glyph-canvas');
  var ctx = canvas.getContext('2d');
  var img = new Image();
  img.onload = function() {
    ctx.drawImage(img, 0, 0, ${width}, ${height});
  };
  img.src = ${JSON.stringify(canvasDataUrl)};
})();
</script>
<!-- Config: aspect=${safeAr} bg=${backgroundColor} layers=${layers.length} -->
</body>
</html>`
}

export function generateReactExport(config: ExportConfig): string {
  const { canvasDataUrl, width, height, backgroundColor } = config

  return `import { useEffect, useRef } from 'react'

interface AsciiArtProps {
  className?: string
  style?: React.CSSProperties
}

/**
 * Self-contained ASCII art component exported from Glyph.
 * Renders a pre-rendered ASCII canvas image.
 *
 * Usage:
 *   <AsciiArt />
 *   <AsciiArt className="rounded-lg shadow-xl" />
 *   <AsciiArt style={{ maxWidth: 800 }} />
 */
export function AsciiArt({ className, style }: AsciiArtProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, ${width}, ${height})
    }
    img.src = DATA_URL
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={${width}}
      height={${height}}
      className={className}
      style={{
        background: '${backgroundColor}',
        maxWidth: '100%',
        height: 'auto',
        ...style,
      }}
    />
  )
}

const DATA_URL = ${JSON.stringify(canvasDataUrl)}
`
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

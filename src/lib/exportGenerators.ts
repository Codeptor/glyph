import type { Layer } from '@/types'

interface ExportConfig {
  layers: Layer[]
  backgroundColor: string
  aspectRatio: string
  canvasDataUrl: string
  width: number
  height: number
}

interface LayerImage {
  dataUrl: string
  name: string
  width: number
  height: number
}

interface ReactExportConfig {
  layerImages: LayerImage[]
  compositeDataUrl: string
  backgroundColor: string
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

export function generateReactExport(config: ReactExportConfig): string {
  const { layerImages, compositeDataUrl, backgroundColor, width, height } = config

  if (layerImages.length <= 1) {
    return generateSingleLayerTsx(compositeDataUrl, backgroundColor, width, height)
  }
  return generateMultiLayerTsx(layerImages, compositeDataUrl, backgroundColor, width, height)
}

function generateSingleLayerTsx(
  dataUrl: string,
  backgroundColor: string,
  width: number,
  height: number,
): string {
  return `import { useEffect, useRef } from 'react'

interface AsciiArtProps {
  className?: string
  style?: React.CSSProperties
}

/**
 * Self-contained ASCII art component exported from Glyph.
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
    img.onload = () => ctx.drawImage(img, 0, 0, ${width}, ${height})
    img.src = FRAME_DATA
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

// Glyph frame data (base64-encoded PNG)
const FRAME_DATA = ${JSON.stringify(dataUrl)}
`
}

function generateMultiLayerTsx(
  layerImages: LayerImage[],
  compositeDataUrl: string,
  backgroundColor: string,
  width: number,
  height: number,
): string {
  const layerConsts = layerImages
    .map((l, i) => `  { name: ${JSON.stringify(l.name)}, src: LAYER_${i}_DATA },`)
    .join('\n')

  const layerDataConsts = layerImages
    .map((l, i) => `const LAYER_${i}_DATA = ${JSON.stringify(l.dataUrl)}`)
    .join('\n\n')

  return `import { useEffect, useRef } from 'react'

interface AsciiArtProps {
  className?: string
  style?: React.CSSProperties
  /** Render only the composite frame instead of individual layers */
  composite?: boolean
}

/**
 * Multi-layer ASCII art component exported from Glyph.
 * Contains ${layerImages.length} layers that are composited together.
 *
 * Usage:
 *   <AsciiArt />
 *   <AsciiArt composite />
 *   <AsciiArt className="rounded-lg shadow-xl" />
 *   <AsciiArt style={{ maxWidth: 800 }} />
 */
export function AsciiArt({ className, style, composite = false }: AsciiArtProps) {
  if (composite) {
    return (
      <CompositeFrame
        className={className}
        style={style}
      />
    )
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: ${width},
        maxWidth: '100%',
        background: '${backgroundColor}',
        ...style,
      }}
    >
      {LAYERS.map((layer, i) => (
        <LayerCanvas
          key={i}
          src={layer.src}
          isFirst={i === 0}
        />
      ))}
    </div>
  )
}

function LayerCanvas({ src, isFirst }: { src: string; isFirst: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => ctx.drawImage(img, 0, 0, ${width}, ${height})
    img.src = src
  }, [src])

  return (
    <canvas
      ref={canvasRef}
      width={${width}}
      height={${height}}
      style={{
        display: 'block',
        maxWidth: '100%',
        height: 'auto',
        ...(isFirst ? {} : { position: 'absolute', top: 0, left: 0 }),
      }}
    />
  )
}

function CompositeFrame({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => ctx.drawImage(img, 0, 0, ${width}, ${height})
    img.src = COMPOSITE_DATA
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

// Layer definitions (${layerImages.length} layers)
const LAYERS = [
${layerConsts}
]

// Composite frame data (all layers merged)
const COMPOSITE_DATA = ${JSON.stringify(compositeDataUrl)}

// Individual layer data (base64-encoded PNG)
${layerDataConsts}
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

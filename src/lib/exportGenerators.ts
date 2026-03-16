import JSZip from 'jszip'
import type { Layer } from '@/types'

// Import all engine source files as raw strings at build time
const engineSources = import.meta.glob(
  ['../engine/**/*.ts', '../types/index.ts'],
  { query: '?raw', eager: true, import: 'default' },
) as Record<string, string>

interface ExportConfig {
  layers: Layer[]
  backgroundColor: string
  aspectRatio: string
  canvasDataUrl: string
  width: number
  height: number
}

interface ReactExportConfig {
  sourceDataUrl: string
  layers: Layer[]
  backgroundColor: string
  aspectRatio: string
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

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1]
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function getExportPath(globKey: string): string {
  if (globKey.startsWith('../types/')) return 'engine/types.ts'
  return globKey.replace('../', '')
}

function rewriteImports(content: string, exportPath: string): string {
  const isInStyles = exportPath.includes('/styles/')
  if (isInStyles) {
    return content
      .replace(/'@\/types'/g, "'../types'")
      .replace(/'@\/engine\//g, "'../")
  }
  return content.replace(/'@\/types'/g, "'./types'")
}

export async function generateReactExport(config: ReactExportConfig): Promise<Blob> {
  const { sourceDataUrl, layers, backgroundColor, aspectRatio, width, height } = config
  const zip = new JSZip()
  const folder = zip.folder('AsciiArt')!

  // Source image
  folder.file('source.png', dataUrlToUint8Array(sourceDataUrl))

  // Engine source files with rewritten path aliases
  for (const [globKey, content] of Object.entries(engineSources)) {
    const exportPath = getExportPath(globKey)
    folder.file(exportPath, rewriteImports(content, exportPath))
  }

  // Wrapper component with baked-in layer config
  const aspectCss = aspectRatio === 'original'
    ? `${width} / ${height}`
    : aspectRatio.replace(':', ' / ')

  folder.file('AsciiArt.tsx', generateWrapperTsx(layers, backgroundColor, aspectCss))

  return zip.generateAsync({ type: 'blob' })
}

function generateWrapperTsx(
  layers: Layer[],
  backgroundColor: string,
  aspectRatio: string,
): string {
  return `import { useEffect, useRef } from 'react'
import { AsciiRenderer } from './engine/AsciiRenderer'
import type { Layer } from './engine/types'
import sourceSrc from './source.png'

interface AsciiArtProps {
  className?: string
  style?: React.CSSProperties
}

/**
 * Live ASCII art component exported from Glyph.
 * Includes the full rendering engine with animations and mouse interactions.
 *
 * Usage:
 *   <AsciiArt />
 *   <AsciiArt className="rounded-lg shadow-xl" />
 *   <AsciiArt style={{ maxWidth: 800 }} />
 */
export function AsciiArt({ className, style }: AsciiArtProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<AsciiRenderer | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new AsciiRenderer()
    rendererRef.current = renderer
    const canvas = renderer.getCanvas()
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    container.appendChild(canvas)

    const img = new Image()
    img.onload = () => {
      renderer.setSource(img)
      const { width, height } = container.getBoundingClientRect()
      renderer.resize(Math.round(width), Math.round(height))
      renderer.startLoop(LAYERS, '${backgroundColor}', 'original', () => {})
    }
    img.src = sourceSrc

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      renderer.resize(Math.round(width), Math.round(height))
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
      renderer.destroy()
      canvas.remove()
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    const renderer = rendererRef.current
    if (!renderer) return
    const rect = renderer.getCanvas().getBoundingClientRect()
    renderer.setMouse(e.clientX - rect.left, e.clientY - rect.top)
  }

  const handleMouseLeave = () => {
    rendererRef.current?.setMouse(-1, -1)
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        background: '${backgroundColor}',
        width: '100%',
        aspectRatio: '${aspectRatio}',
        cursor: 'crosshair',
        overflow: 'hidden',
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  )
}

const LAYERS: Layer[] = ${JSON.stringify(layers, null, 2)}
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

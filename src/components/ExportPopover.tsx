import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { getGlobalRenderer } from '@/lib/rendererRef'
import {
  generateHtmlExport,
  generateReactExport,
  downloadFile,
  downloadDataUrl,
} from '@/lib/exportGenerators'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, Copy, Check, FileCode, FileImage, FileJson, Film, Save } from 'lucide-react'
import { exportVideo } from '@/lib/videoExport'
import type { VideoResolution } from '@/lib/videoExport'

interface Props {
  onClose: () => void
}

type ExportTab = 'png' | 'video' | 'html' | 'react' | 'json'

export function ExportPopover({ onClose }: Props) {
  const layers = useStore((s) => s.layers)
  const backgroundColor = useStore((s) => s.backgroundColor)
  const aspectRatio = useStore((s) => s.aspectRatio)
  const tonemapConfig = useStore((s) => s.tonemapConfig)
  const exportPreset = useStore((s) => s.exportPreset)
  const savePreset = useStore((s) => s.savePreset)

  const [tab, setTab] = useState<ExportTab>('png')
  const [copied, setCopied] = useState(false)
  const [pngScale, setPngScale] = useState('1')
  const [saveName, setSaveName] = useState('')
  const [videoRes, setVideoRes] = useState<string>('720')
  const [videoDuration, setVideoDuration] = useState<string>('5')
  const [videoFps, setVideoFps] = useState<string>('30')
  const [recording, setRecording] = useState(false)
  const [progress, setProgress] = useState(0)

  const json = exportPreset()

  const getCanvasData = () => {
    const renderer = getGlobalRenderer()
    if (!renderer) return null
    const canvas = renderer.getCanvas()
    return {
      dataUrl: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height,
    }
  }

  const handlePngDownload = () => {
    const renderer = getGlobalRenderer()
    if (!renderer) return
    const canvas = renderer.getCanvas()
    const scale = parseInt(pngScale)

    if (scale === 1) {
      downloadDataUrl(canvas.toDataURL('image/png'), `glyph-${Date.now()}.png`)
      return
    }

    const offscreen = document.createElement('canvas')
    offscreen.width = canvas.width * scale
    offscreen.height = canvas.height * scale
    const ctx = offscreen.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height)
    downloadDataUrl(offscreen.toDataURL('image/png'), `glyph-${Date.now()}@${scale}x.png`)
  }

  const handleHtmlDownload = () => {
    const data = getCanvasData()
    if (!data) return
    const html = generateHtmlExport({
      layers,
      backgroundColor,
      aspectRatio,
      canvasDataUrl: data.dataUrl,
      width: data.width,
      height: data.height,
    })
    downloadFile(html, `glyph-${Date.now()}.html`, 'text/html')
  }

  const handleReactDownload = async () => {
    const renderer = getGlobalRenderer()
    if (!renderer) return
    const sourceDataUrl = renderer.exportSourceImage()
    if (!sourceDataUrl) return
    const canvas = renderer.getCanvas()

    const blob = await generateReactExport({
      sourceDataUrl,
      layers,
      backgroundColor,
      aspectRatio,
      width: canvas.width,
      height: canvas.height,
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'AsciiArt.zip'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleVideoRecord = async () => {
    const renderer = getGlobalRenderer()
    if (!renderer) return
    const source = renderer.getSource()
    if (!source) return

    setRecording(true)
    setProgress(0)

    const { blob, ext } = await exportVideo({
      source,
      layers,
      backgroundColor,
      aspectRatio,
      tonemapConfig,
      resolution: parseInt(videoRes) as VideoResolution,
      duration: parseInt(videoDuration),
      fps: parseInt(videoFps),
      onProgress: setProgress,
    })

    setRecording(false)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `glyph-${Date.now()}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadJson = () => {
    downloadFile(json, `glyph-preset-${Date.now()}.json`, 'application/json')
  }

  const handleSave = () => {
    if (saveName.trim()) {
      savePreset(saveName.trim())
      setSaveName('')
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm uppercase tracking-wider font-medium">
            Export
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as ExportTab)}>
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="png" className="text-xs cursor-crosshair gap-1.5">
              <FileImage className="h-3 w-3" />
              PNG
            </TabsTrigger>
            <TabsTrigger value="video" className="text-xs cursor-crosshair gap-1.5">
              <Film className="h-3 w-3" />
              Video
            </TabsTrigger>
            <TabsTrigger value="html" className="text-xs cursor-crosshair gap-1.5">
              <FileCode className="h-3 w-3" />
              HTML
            </TabsTrigger>
            <TabsTrigger value="react" className="text-xs cursor-crosshair gap-1.5">
              <FileCode className="h-3 w-3" />
              React
            </TabsTrigger>
            <TabsTrigger value="json" className="text-xs cursor-crosshair gap-1.5">
              <FileJson className="h-3 w-3" />
              JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="png" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Resolution
              </Label>
              <Select value={pngScale} onValueChange={setPngScale}>
                <SelectTrigger className="cursor-crosshair">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x (Original)</SelectItem>
                  <SelectItem value="2">2x (Double)</SelectItem>
                  <SelectItem value="4">4x (Quad)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full cursor-crosshair gap-2"
              onClick={handlePngDownload}
            >
              <Download className="h-4 w-4" />
              Download PNG
            </Button>
          </TabsContent>

          <TabsContent value="video" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Resolution
                </Label>
                <Select value={videoRes} onValueChange={setVideoRes} disabled={recording}>
                  <SelectTrigger className="cursor-crosshair text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="480">480p</SelectItem>
                    <SelectItem value="720">720p</SelectItem>
                    <SelectItem value="1080">1080p</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Duration
                </Label>
                <Select value={videoDuration} onValueChange={setVideoDuration} disabled={recording}>
                  <SelectTrigger className="cursor-crosshair text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3s</SelectItem>
                    <SelectItem value="5">5s</SelectItem>
                    <SelectItem value="10">10s</SelectItem>
                    <SelectItem value="15">15s</SelectItem>
                    <SelectItem value="30">30s</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  FPS
                </Label>
                <Select value={videoFps} onValueChange={setVideoFps} disabled={recording}>
                  <SelectTrigger className="cursor-crosshair text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {recording && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Recording...</span>
                  <span>{Math.round(progress * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-150"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              className="w-full cursor-crosshair gap-2"
              onClick={handleVideoRecord}
              disabled={recording}
            >
              {recording ? (
                <>Recording {Math.round(progress * 100)}%</>
              ) : (
                <>
                  <Film className="h-4 w-4" />
                  Record Video
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="html" className="space-y-4 mt-4">
            <div className="rounded-md bg-muted/50 px-4 py-3 text-xs text-muted-foreground space-y-1">
              <p>Generates a self-contained HTML file with the current canvas frame embedded.</p>
              <p>Open it in any browser — no dependencies required.</p>
            </div>
            <Button
              className="w-full cursor-crosshair gap-2"
              onClick={handleHtmlDownload}
            >
              <Download className="h-4 w-4" />
              Download HTML
            </Button>
          </TabsContent>

          <TabsContent value="react" className="space-y-4 mt-4">
            <div className="rounded-md bg-muted/50 px-4 py-3 text-xs text-muted-foreground space-y-1">
              <p>Exports a live component with the full rendering engine — animations, FX, and mouse interactions included.</p>
              <p>Unzip into any React + Vite project:</p>
              <pre className="mt-2 rounded bg-background p-2 text-[10px] font-mono text-foreground/70">
{`import { AsciiArt } from './AsciiArt/AsciiArt'

<AsciiArt className="rounded-lg" />`}
              </pre>
            </div>
            <Button
              className="w-full cursor-crosshair gap-2"
              onClick={handleReactDownload}
            >
              <Download className="h-4 w-4" />
              Download AsciiArt.zip
            </Button>
          </TabsContent>

          <TabsContent value="json" className="space-y-3 mt-4">
            <Textarea
              value={json}
              readOnly
              className="h-40 font-mono text-[10px] resize-none bg-muted/50"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 cursor-crosshair gap-2"
                onClick={handleCopyJson}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 cursor-crosshair gap-2"
                onClick={handleDownloadJson}
              >
                <Download className="h-3 w-3" />
                Download
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Save as Preset
              </Label>
              <div className="flex gap-2">
                <Input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Preset name..."
                  className="flex-1 text-xs cursor-crosshair"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-crosshair gap-1.5"
                  onClick={handleSave}
                >
                  <Save className="h-3 w-3" />
                  Save
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-[10px] text-muted-foreground/50 text-center">
          All data is stored locally in your browser.
        </div>
      </DialogContent>
    </Dialog>
  )
}

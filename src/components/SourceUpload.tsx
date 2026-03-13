import { useRef, useState, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { CameraView } from './CameraView'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SourceMode, SourceQuality } from '@/types'

const QUALITIES: SourceQuality[] = [320, 480, 720]

export function SourceUpload() {
  const sourceMode = useStore((s) => s.sourceMode)
  const setSourceMode = useStore((s) => s.setSourceMode)
  const sourceQuality = useStore((s) => s.sourceQuality)
  const setSourceQuality = useStore((s) => s.setSourceQuality)
  const setSourceImage = useStore((s) => s.setSourceImage)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          setSourceImage(result)
        }
      }
      reader.readAsDataURL(file)
    } else if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file)
      const video = document.createElement('video')
      video.src = url
      video.loop = true
      video.muted = true
      video.playsInline = true
      video.onloadeddata = () => {
        video.play()
        window.dispatchEvent(new CustomEvent('camera-ready', { detail: video }))
      }
    }
  }, [setSourceImage])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleVideoReady = useCallback((video: HTMLVideoElement) => {
    window.dispatchEvent(new CustomEvent('camera-ready', { detail: video }))
  }, [])

  const handleVideoStop = useCallback(() => {
    window.dispatchEvent(new CustomEvent('camera-stop'))
  }, [])

  return (
    <div className="px-4 py-2 space-y-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        Source
      </Label>
      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          value={sourceMode}
          onValueChange={(v) => { if (v) setSourceMode(v as SourceMode) }}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <ToggleGroupItem value="image" className="flex-1 text-xs cursor-crosshair">
            Image / Video
          </ToggleGroupItem>
          <ToggleGroupItem value="camera" className="flex-1 text-xs cursor-crosshair">
            Live Cam
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Quality</span>
          <Select
            value={String(sourceQuality)}
            onValueChange={(v) => setSourceQuality(Number(v) as SourceQuality)}
          >
            <SelectTrigger size="sm" className="w-16 h-7 text-xs cursor-crosshair">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUALITIES.map((q) => (
                <SelectItem key={q} value={String(q)}>{q}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {sourceMode === 'image' && (
        <div
          className={`flex flex-col items-center justify-center gap-1 rounded-md border border-dashed py-4 px-3 cursor-crosshair transition-colors ${
            isDragActive
              ? 'border-[var(--accent)] bg-[var(--accent-dim)]'
              : 'border-border hover:border-muted-foreground hover:bg-[var(--bg-surface)]'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
        >
          <div className="text-xs text-muted-foreground">
            Drop image/video or click to browse
          </div>
          <div className="text-[10px] text-muted-foreground/60">
            Supports: JPG, PNG, GIF, MP4, WebM
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      {sourceMode === 'camera' && (
        <CameraView
          quality={sourceQuality}
          onVideoReady={handleVideoReady}
          onVideoStop={handleVideoStop}
        />
      )}
    </div>
  )
}

import { useRef, useState, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { CameraView } from './CameraView'
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
    <div className="upload-widget">
      <div className="control-label" style={{ padding: '0 1.2rem', marginBottom: '0.3rem' }}>Source</div>
      <div className="upload-controls-row">
        {([['image', 'Image / Video'], ['camera', 'Live Cam']] as [SourceMode, string][]).map(([mode, label]) => (
          <button
            key={mode}
            className={`source-mode-button${sourceMode === mode ? ' is-active' : ''}`}
            onClick={() => setSourceMode(mode)}
          >
            {label}
          </button>
        ))}
        <div className="source-quality-wrap">
          <span className="control-label">Quality</span>
          <select
            className="source-resolution-inline"
            value={sourceQuality}
            onChange={(e) => setSourceQuality(Number(e.target.value) as SourceQuality)}
          >
            {QUALITIES.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>
      </div>

      {sourceMode === 'image' && (
        <div
          className={`upload-dropzone${isDragActive ? ' is-drag-active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
        >
          <div className="upload-hint">Drop image/video or click to browse</div>
          <div className="upload-hint-sub">Supports: JPG, PNG, GIF, MP4, WebM</div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: 'none' }}
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

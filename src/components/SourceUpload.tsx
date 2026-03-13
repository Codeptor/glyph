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
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        setSourceImage(result)
      }
    }
    reader.readAsDataURL(file)
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
      <div className="upload-controls-row">
        {(['image', 'camera'] as SourceMode[]).map((mode) => (
          <button
            key={mode}
            className={`source-mode-button${sourceMode === mode ? ' is-active' : ''}`}
            onClick={() => setSourceMode(mode)}
          >
            {mode}
          </button>
        ))}
        <select
          className="source-resolution-inline"
          value={sourceQuality}
          onChange={(e) => setSourceQuality(Number(e.target.value) as SourceQuality)}
        >
          {QUALITIES.map((q) => (
            <option key={q} value={q}>{q}p</option>
          ))}
        </select>
      </div>

      {sourceMode === 'image' && (
        <div
          className={`upload-dropzone${isDragActive ? ' is-drag-active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
        >
          <div className="upload-hint">Drop image or click to upload</div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
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

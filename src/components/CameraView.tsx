import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  quality: number
  onVideoReady: (video: HTMLVideoElement) => void
  onVideoStop: () => void
}

export function CameraView({ quality, onVideoReady, onVideoStop }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [activeDeviceId, setActiveDeviceId] = useState<string>('')
  const [error, setError] = useState<string>('')

  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: quality * (16 / 9) },
          height: { ideal: quality },
          ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (!videoRef.current) {
        const video = document.createElement('video')
        video.playsInline = true
        video.muted = true
        videoRef.current = video
      }

      videoRef.current.srcObject = stream
      await videoRef.current.play()
      onVideoReady(videoRef.current)

      // Get list of devices after permission is granted
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput')
      setDevices(videoDevices)

      const activeTrack = stream.getVideoTracks()[0]
      const settings = activeTrack.getSettings()
      if (settings.deviceId) {
        setActiveDeviceId(settings.deviceId)
      }

      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Camera access denied')
      onVideoStop()
    }
  }, [quality, onVideoReady, onVideoStop])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    onVideoStop()
  }, [onVideoStop])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  // Restart when quality changes
  useEffect(() => {
    if (streamRef.current) {
      startCamera(activeDeviceId || undefined)
    }
  }, [quality])

  const switchDevice = (deviceId: string) => {
    startCamera(deviceId)
  }

  if (error) {
    return (
      <div>
        <div className="camera-error">{error}</div>
        <button
          className="source-mode-button"
          style={{ marginTop: '0.4rem', width: '100%' }}
          onClick={() => startCamera()}
        >
          Retry
        </button>
      </div>
    )
  }

  if (devices.length > 1) {
    return (
      <div className="camera-device-menu">
        {devices.map((d) => (
          <button
            key={d.deviceId}
            className={`camera-device-item${activeDeviceId === d.deviceId ? ' is-active' : ''}`}
            onClick={() => switchDevice(d.deviceId)}
          >
            {d.label || `Camera ${devices.indexOf(d) + 1}`}
          </button>
        ))}
      </div>
    )
  }

  return null
}

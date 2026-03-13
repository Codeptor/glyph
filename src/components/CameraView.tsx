import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'

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
      <div className="space-y-2">
        <div className="text-xs text-destructive px-1">{error}</div>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs cursor-crosshair"
          onClick={() => startCamera()}
        >
          Retry
        </Button>
      </div>
    )
  }

  if (devices.length > 1) {
    return (
      <div className="flex flex-col gap-1">
        {devices.map((d) => (
          <Button
            key={d.deviceId}
            variant={activeDeviceId === d.deviceId ? 'default' : 'outline'}
            size="xs"
            className="text-[10px] justify-start cursor-crosshair"
            onClick={() => switchDevice(d.deviceId)}
          >
            {d.label || `Camera ${devices.indexOf(d) + 1}`}
          </Button>
        ))}
      </div>
    )
  }

  return null
}

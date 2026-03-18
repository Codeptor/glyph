import { Muxer, ArrayBufferTarget } from 'mp4-muxer'
import { AsciiRenderer } from '@/engine/AsciiRenderer'
import type { Layer, TonemapConfig } from '@/types'

export type VideoResolution = 480 | 720 | 1080

interface VideoExportConfig {
  source: HTMLImageElement | HTMLVideoElement
  layers: Layer[]
  backgroundColor: string
  aspectRatio: string
  tonemapConfig: TonemapConfig
  resolution: VideoResolution
  duration: number
  fps: number
  onProgress: (progress: number) => void
}

function computeDimensions(
  aspectRatio: string,
  resolution: number,
  sourceW: number,
  sourceH: number,
): { width: number; height: number } {
  const h = resolution
  let ratio: number
  switch (aspectRatio) {
    case '16:9': ratio = 16 / 9; break
    case '4:3': ratio = 4 / 3; break
    case '1:1': ratio = 1; break
    case '3:4': ratio = 3 / 4; break
    case '9:16': ratio = 9 / 16; break
    default: ratio = sourceW / sourceH; break
  }
  let w = Math.round(h * ratio)
  if (w % 2 !== 0) w++
  const height = h % 2 === 0 ? h : h + 1
  return { width: w, height }
}

export async function exportVideo(config: VideoExportConfig): Promise<{ blob: Blob; ext: string }> {
  const {
    source, layers, backgroundColor, aspectRatio, tonemapConfig,
    resolution, duration, fps, onProgress,
  } = config

  const sw = source instanceof HTMLImageElement ? source.naturalWidth : source.videoWidth
  const sh = source instanceof HTMLImageElement ? source.naturalHeight : source.videoHeight
  const { width, height } = computeDimensions(aspectRatio, resolution, sw, sh)

  const renderer = new AsciiRenderer()
  renderer.setSource(source)
  renderer.setTonemapConfig(tonemapConfig)
  renderer.resize(width, height)

  const bitrate = resolution >= 1080 ? 16_000_000 : resolution >= 720 ? 10_000_000 : 5_000_000

  const target = new ArrayBufferTarget()
  const muxer = new Muxer({
    target,
    video: { codec: 'avc', width, height },
    fastStart: 'in-memory',
  })

  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error('VideoEncoder error:', e),
  })

  encoder.configure({
    codec: 'avc1.640028',
    width,
    height,
    bitrate,
    framerate: fps,
  })

  const canvas = renderer.getCanvas()
  const totalFrames = Math.round(duration * fps)
  const frameDurationUs = Math.round(1_000_000 / fps)

  for (let i = 0; i < totalFrames; i++) {
    const time = i / fps
    renderer.setTimeOverride(time)
    renderer.render(layers, backgroundColor)

    const frame = new VideoFrame(canvas, {
      timestamp: i * frameDurationUs,
      duration: frameDurationUs,
    })
    const keyFrame = i % (fps * 2) === 0
    encoder.encode(frame, { keyFrame })
    frame.close()

    onProgress((i + 1) / totalFrames)

    // yield to UI every few frames so progress bar updates
    if (i % 4 === 0) {
      await new Promise<void>((r) => setTimeout(r, 0))
    }
  }

  await encoder.flush()
  encoder.close()
  muxer.finalize()
  renderer.setTimeOverride(null)
  renderer.destroy()

  return {
    blob: new Blob([target.buffer], { type: 'video/mp4' }),
    ext: 'mp4',
  }
}

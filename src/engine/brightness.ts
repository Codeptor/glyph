// Pre-computed sRGB-to-linear lookup table (256 entries, avoids Math.pow per pixel)
const SRGB_TO_LINEAR = new Float32Array(256)
for (let i = 0; i < 256; i++) {
  const s = i / 255
  SRGB_TO_LINEAR[i] = s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

// BT.709 luminance from linear RGB (uses LUT for zero-cost linearization)
export function pixelBrightness(r: number, g: number, b: number): number {
  return 0.2126 * SRGB_TO_LINEAR[r] + 0.7152 * SRGB_TO_LINEAR[g] + 0.0722 * SRGB_TO_LINEAR[b]
}

export function adjustBrightness(
  value: number,
  brightness: number,
  contrast: number,
): number {
  let v = value + brightness
  v = (v - 0.5) * contrast + 0.5
  return Math.max(0, Math.min(1, v))
}

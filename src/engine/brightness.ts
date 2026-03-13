// sRGB linearization (gamma decode)
function srgbToLinear(c: number): number {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

// BT.709 luminance from linear RGB
export function pixelBrightness(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
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

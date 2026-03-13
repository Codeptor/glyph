export function pixelBrightness(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
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

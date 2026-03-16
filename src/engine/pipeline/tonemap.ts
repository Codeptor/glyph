/**
 * Adaptive tone mapping — percentile-based normalization + gamma correction.
 * Replaces linear brightness multipliers which clip highlights or leave darks invisible.
 */

export function tonemap(
  grid: Float32Array,
  cols: number,
  rows: number,
  gamma: number = 0.75,
): Float32Array {
  const total = cols * rows
  if (total === 0) return grid

  const out = new Float32Array(grid)

  // Subsample for percentile calculation (4x fewer values, negligible accuracy loss)
  const step = Math.max(1, Math.floor(Math.sqrt(total / 1000)))
  const samples: number[] = []
  for (let i = 0; i < total; i += step) {
    samples.push(out[i])
  }
  samples.sort((a, b) => a - b)

  const lo = samples[Math.floor(samples.length * 0.01)] ?? 0
  const hi = samples[Math.floor(samples.length * 0.995)] ?? 1
  const range = hi - lo < 0.01 ? 0.01 : hi - lo

  for (let i = 0; i < total; i++) {
    let v = (out[i] - lo) / range
    v = Math.max(0, Math.min(1, v))
    out[i] = Math.pow(v, gamma)
  }

  return out
}

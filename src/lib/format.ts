export function fmtPx(v: number) { return `${Math.round(v)}px` }
export function fmtMul(v: number) { return `${Number(v.toFixed(1))}x` }
export function fmtInt(v: number) { return String(Math.round(v)) }
export function fmtDeg(v: number) { return `${Math.round(v)}\u00B0` }

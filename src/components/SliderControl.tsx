interface Props {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
}

function formatValue(label: string, value: number, step?: number): string {
  if (label === 'Font Size') return `${Math.round(value)}px`
  if (label === 'Area Size') return `${Math.round(value)}px`
  if (label === 'Character Spacing' || label === 'Spread') return `${Number(value.toFixed(1)).toString()}x`
  if (step && step >= 1) return String(Math.round(value))
  return String(parseFloat(value.toFixed(2)))
}

export function SliderControl({ label, value, min, max, step = 0.01, onChange }: Props) {
  return (
    <div className="control-row">
      <div className="split-line">
        <span className="control-label">{label}</span>
        <span className="control-value">{formatValue(label, value, step)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  )
}

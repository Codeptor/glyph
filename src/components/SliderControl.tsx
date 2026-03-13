interface Props {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}

export function SliderControl({ label, value, min, max, step = 0.01, onChange }: Props) {
  return (
    <div className="control-row">
      <div className="split-line">
        <span className="control-label">{label}</span>
        <span className="control-value">{typeof value === 'number' ? value.toFixed(2) : value}</span>
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

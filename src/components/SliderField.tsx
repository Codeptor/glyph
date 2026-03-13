import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
}

export function SliderField({ label, value, min, max, step = 0.01, onChange, formatValue }: SliderFieldProps) {
  const displayValue = formatValue ? formatValue(value) : String(parseFloat(value.toFixed(2)))

  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
        <span className="text-xs font-mono text-muted-foreground">{displayValue}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="cursor-crosshair"
      />
    </div>
  )
}

export function fmtPx(v: number) { return `${Math.round(v)}px` }
export function fmtMul(v: number) { return `${Number(v.toFixed(1))}x` }
export function fmtInt(v: number) { return String(Math.round(v)) }
export function fmtDeg(v: number) { return `${Math.round(v)}\u00B0` }

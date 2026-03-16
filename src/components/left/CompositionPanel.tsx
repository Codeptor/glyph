import { useStore } from '@/store/useStore'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { SliderField } from '@/components/SliderField'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MaskType, MaskConfig, FeedbackConfig, BlendMode } from '@/types'

const MASK_TYPES: MaskType[] = [
  'none', 'circle', 'rect', 'ring', 'gradient-h', 'gradient-v', 'gradient-radial',
  'iris', 'wipe-h', 'wipe-v', 'dissolve',
]

const ANIMATED_MASKS: MaskType[] = ['iris', 'wipe-h', 'wipe-v', 'dissolve']

const FEEDBACK_TRANSFORMS: FeedbackConfig['transform'][] = [
  'none', 'zoom', 'shrink', 'rotate-cw', 'rotate-ccw', 'shift-up', 'shift-down',
]

const BLEND_MODES: BlendMode[] = [
  'normal', 'add', 'screen', 'multiply', 'overlay',
  'softlight', 'hardlight', 'difference', 'exclusion',
  'colordodge', 'colorburn', 'linearlight', 'vividlight',
  'pin_light', 'hard_mix', 'lighten', 'darken',
  'grain_extract', 'grain_merge', 'subtract',
]

export function CompositionPanel() {
  const layers = useStore((s) => s.layers)
  const activeLayerIndex = useStore((s) => s.activeLayerIndex)
  const updateActiveLayer = useStore((s) => s.updateActiveLayer)
  const layer = layers[activeLayerIndex]

  if (!layer) return null

  const { mask, feedback } = layer

  const updateMask = (changes: Partial<MaskConfig>) =>
    updateActiveLayer({ mask: { ...mask, ...changes } })

  const updateFeedback = (changes: Partial<FeedbackConfig>) =>
    updateActiveLayer({ feedback: { ...feedback, ...changes } })

  const isAnimated = ANIMATED_MASKS.includes(mask.type)

  return (
    <CollapsibleSection title="Composition">
      <div className="space-y-3">
        {/* Mask */}
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Mask
          </Label>
          <Select
            value={mask.type}
            onValueChange={(v) => updateMask({ type: v as MaskType })}
          >
            <SelectTrigger size="sm" className="w-full h-7 text-xs cursor-crosshair">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MASK_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {mask.type !== 'none' && (
            <div className="space-y-2">
              <SliderField
                label="Feather"
                value={mask.feather}
                min={0}
                max={0.3}
                step={0.01}
                onChange={(v) => updateMask({ feather: v })}
              />
              <SliderField
                label="Center X"
                value={mask.centerX}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => updateMask({ centerX: v })}
              />
              <SliderField
                label="Center Y"
                value={mask.centerY}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => updateMask({ centerY: v })}
              />
              <SliderField
                label="Radius"
                value={mask.radius}
                min={0.05}
                max={1}
                step={0.01}
                onChange={(v) => updateMask({ radius: v })}
              />

              {mask.type === 'ring' && (
                <SliderField
                  label="Inner Radius"
                  value={mask.innerRadius}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => updateMask({ innerRadius: v })}
                />
              )}

              {isAnimated && (
                <SliderField
                  label="Anim Speed"
                  value={mask.animSpeed}
                  min={0}
                  max={5}
                  step={0.1}
                  onChange={(v) => updateMask({ animSpeed: v })}
                />
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  id="mask-invert"
                  checked={mask.invert}
                  onCheckedChange={(v) => updateMask({ invert: v === true })}
                  className="cursor-crosshair"
                />
                <Label htmlFor="mask-invert" className="text-[11px] uppercase tracking-wider text-muted-foreground cursor-crosshair">
                  Invert
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Feedback */}
        <div className="space-y-2 border-t border-zinc-800 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Feedback
            </Label>
            <Switch
              size="sm"
              checked={feedback.enabled}
              onCheckedChange={(v) => updateFeedback({ enabled: v })}
              className="cursor-crosshair"
            />
          </div>

          {feedback.enabled && (
            <div className="space-y-2">
              <SliderField
                label="Decay"
                value={feedback.decay}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => updateFeedback({ decay: v })}
              />
              <SliderField
                label="Opacity"
                value={feedback.opacity}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => updateFeedback({ opacity: v })}
              />

              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Transform
              </Label>
              <Select
                value={feedback.transform}
                onValueChange={(v) => updateFeedback({ transform: v as FeedbackConfig['transform'] })}
              >
                <SelectTrigger size="sm" className="w-full h-7 text-xs cursor-crosshair">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_TRANSFORMS.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <SliderField
                label="Transform Amt"
                value={feedback.transformAmount}
                min={0}
                max={0.1}
                step={0.005}
                onChange={(v) => updateFeedback({ transformAmount: v })}
              />
              <SliderField
                label="Hue Shift"
                value={feedback.hueShift}
                min={0}
                max={0.1}
                step={0.005}
                onChange={(v) => updateFeedback({ hueShift: v })}
              />

              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Blend
              </Label>
              <Select
                value={feedback.blendMode}
                onValueChange={(v) => updateFeedback({ blendMode: v as BlendMode })}
              >
                <SelectTrigger size="sm" className="w-full h-7 text-xs cursor-crosshair">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLEND_MODES.map((m) => (
                    <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </CollapsibleSection>
  )
}

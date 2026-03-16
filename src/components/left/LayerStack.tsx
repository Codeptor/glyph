import { useStore } from '@/store/useStore'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Plus, Minus, Copy } from 'lucide-react'
import { useRef } from 'react'
import type { BlendMode } from '@/types'

const BLEND_MODES: BlendMode[] = [
  'normal', 'add', 'screen', 'multiply', 'overlay',
  'softlight', 'hardlight', 'difference', 'exclusion',
  'colordodge', 'colorburn', 'linearlight', 'vividlight',
  'pin_light', 'hard_mix', 'lighten', 'darken',
  'grain_extract', 'grain_merge', 'subtract',
]

const BLEND_LABELS: Record<BlendMode, string> = {
  normal: 'Normal',
  add: 'Add',
  screen: 'Screen',
  multiply: 'Multiply',
  overlay: 'Overlay',
  softlight: 'Soft Lt',
  hardlight: 'Hard Lt',
  difference: 'Diff',
  exclusion: 'Excl',
  colordodge: 'C.Dodge',
  colorburn: 'C.Burn',
  linearlight: 'Lin Lt',
  vividlight: 'Vivid Lt',
  pin_light: 'Pin Lt',
  hard_mix: 'Hard Mix',
  lighten: 'Lighten',
  darken: 'Darken',
  grain_extract: 'Grain Ex',
  grain_merge: 'Grain Mg',
  subtract: 'Subtract',
}

export function LayerStack() {
  const layers = useStore((s) => s.layers)
  const activeLayerIndex = useStore((s) => s.activeLayerIndex)
  const setActiveLayerIndex = useStore((s) => s.setActiveLayerIndex)
  const addLayer = useStore((s) => s.addLayer)
  const removeLayer = useStore((s) => s.removeLayer)
  const duplicateLayer = useStore((s) => s.duplicateLayer)
  const updateActiveLayer = useStore((s) => s.updateActiveLayer)

  const savedOpacityRef = useRef<Map<string, number>>(new Map())

  const toggleVisibility = (layerId: string, currentOpacity: number, index: number) => {
    if (index !== activeLayerIndex) {
      setActiveLayerIndex(index)
      // defer the toggle so updateActiveLayer targets the correct layer
      requestAnimationFrame(() => {
        const saved = savedOpacityRef.current
        if (currentOpacity === 0) {
          const prev = saved.get(layerId) ?? 1
          saved.delete(layerId)
          useStore.getState().updateActiveLayer({ opacity: prev })
        } else {
          saved.set(layerId, currentOpacity)
          useStore.getState().updateActiveLayer({ opacity: 0 })
        }
      })
      return
    }

    const saved = savedOpacityRef.current
    if (currentOpacity === 0) {
      const prev = saved.get(layerId) ?? 1
      saved.delete(layerId)
      updateActiveLayer({ opacity: prev })
    } else {
      saved.set(layerId, currentOpacity)
      updateActiveLayer({ opacity: 0 })
    }
  }

  const handleBlendChange = (value: string, index: number) => {
    if (index !== activeLayerIndex) {
      setActiveLayerIndex(index)
      requestAnimationFrame(() => {
        useStore.getState().updateActiveLayer({ blendMode: value as BlendMode })
      })
      return
    }
    updateActiveLayer({ blendMode: value as BlendMode })
  }

  return (
    <CollapsibleSection title="Layers">
      <div className="space-y-1">
        {layers.map((layer, i) => {
          const isActive = i === activeLayerIndex
          const isHidden = layer.opacity === 0

          return (
            <div
              key={layer.id}
              className={`flex items-center gap-1 rounded px-1.5 py-1 cursor-crosshair transition-colors ${
                isActive ? 'bg-yellow-500/20 text-yellow-200' : 'text-zinc-400 hover:bg-zinc-800/60'
              }`}
              onClick={() => setActiveLayerIndex(i)}
            >
              <span className="text-[11px] truncate flex-1 min-w-0 select-none">
                {layer.name}
              </span>

              <select
                value={layer.blendMode}
                onChange={(e) => {
                  e.stopPropagation()
                  handleBlendChange(e.target.value, i)
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-5 w-16 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-400 cursor-crosshair appearance-none px-1 focus:outline-none"
              >
                {BLEND_MODES.map((mode) => (
                  <option key={mode} value={mode}>{BLEND_LABELS[mode]}</option>
                ))}
              </select>

              <button
                className={`p-0.5 rounded transition-colors ${
                  isHidden ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleVisibility(layer.id, layer.opacity, i)
                }}
                title={isHidden ? 'Show layer' : 'Hide layer'}
              >
                {isHidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-1 pt-1 border-t border-zinc-800">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={addLayer}
          title="Add layer"
          className="cursor-crosshair"
        >
          <Plus className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => removeLayer(activeLayerIndex)}
          disabled={layers.length <= 1}
          title="Remove layer"
          className="cursor-crosshair"
        >
          <Minus className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => duplicateLayer(activeLayerIndex)}
          title="Duplicate layer"
          className="cursor-crosshair"
        >
          <Copy className="size-3.5" />
        </Button>
      </div>
    </CollapsibleSection>
  )
}

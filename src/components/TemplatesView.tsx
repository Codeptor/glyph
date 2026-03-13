import { useStore } from '@/store/useStore'
import { DEFAULT_TEMPLATES } from '@/lib/templates'
import type { TemplateAsset } from '@/types'

export function TemplatesView() {
  const updateActiveLayer = useStore((s) => s.updateActiveLayer)

  const handleApply = (template: TemplateAsset) => {
    updateActiveLayer(template.preset)
  }

  return (
    <div className="left-gallery-view">
      <div className="gallery-browser">
        <div className="gallery-header">
          <div className="gallery-header-title">Templates ({DEFAULT_TEMPLATES.length})</div>
        </div>
        <div className="gallery-grid">
          {DEFAULT_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="gallery-item"
              onClick={() => handleApply(tpl)}
            >
              <div style={{
                width: '100%',
                aspectRatio: '1 / 1',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'var(--fg-muted)',
              }}>
                {tpl.preset.artStyle === 'classic' ? 'A' :
                 tpl.preset.artStyle === 'braille' ? '⠿' :
                 tpl.preset.artStyle === 'halftone' ? '●' :
                 tpl.preset.artStyle === 'line' ? '/' :
                 tpl.preset.artStyle === 'particles' ? '·' :
                 tpl.preset.artStyle === 'claude-code' ? '>' :
                 tpl.preset.artStyle === 'retro' ? '▓' :
                 tpl.preset.artStyle === 'terminal' ? '$' : '#'}
              </div>
              <div className="gallery-item-name">{tpl.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

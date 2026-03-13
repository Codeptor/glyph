import { useState } from 'react'
import { useStore } from '@/store/useStore'

interface Props {
  onClose: () => void
}

export function SavePopover({ onClose }: Props) {
  const presets = useStore((s) => s.presets)
  const savePreset = useStore((s) => s.savePreset)
  const loadPreset = useStore((s) => s.loadPreset)
  const deletePreset = useStore((s) => s.deletePreset)
  const importPreset = useStore((s) => s.importPreset)
  const exportPreset = useStore((s) => s.exportPreset)
  const [name, setName] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importJson, setImportJson] = useState('')

  const handleSave = () => {
    if (name.trim()) {
      savePreset(name.trim())
      setName('')
    }
  }

  const handleImport = () => {
    if (importJson.trim()) {
      importPreset(importJson.trim())
      setImportJson('')
      setShowImport(false)
    }
  }

  const handleExportCopy = () => {
    navigator.clipboard.writeText(exportPreset())
  }

  return (
    <div className="save-popover">
      <div className="save-popover-head">
        <span>Presets</span>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <button className="save-popover-close" onClick={() => setShowImport(!showImport)}>
            Import
          </button>
          <button className="save-popover-close" onClick={handleExportCopy}>
            Export
          </button>
          <button className="save-popover-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {showImport && (
        <div className="save-popover-line">
          <div className="control-label">Import JSON</div>
          <textarea
            className="control-textarea"
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder="Paste preset JSON..."
          />
          <button className="save-popover-close" onClick={handleImport}>
            Load
          </button>
        </div>
      )}

      <div className="save-popover-line">
        <div className="control-label">Save Current</div>
        <div className="save-name-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Preset name..."
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button onClick={handleSave}>Save</button>
        </div>
      </div>

      {presets.length > 0 && (
        <div className="save-popover-line">
          <div className="control-label">Saved ({presets.length})</div>
          <div className="save-preset-grid">
            {presets.map((p) => (
              <div key={p.id} className="preset-item">
                <div className="preset-item-name">{p.name}</div>
                <div className="preset-item-actions">
                  <button onClick={() => loadPreset(p.id)}>Load</button>
                  <button className="preset-delete" onClick={() => deletePreset(p.id)}>Del</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

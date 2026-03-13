import { useState } from 'react'
import { useStore } from '@/store/useStore'

export function PresetsPanel() {
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

  const handleExport = () => {
    const json = exportPreset()
    navigator.clipboard.writeText(json)
  }

  const handleImport = () => {
    if (importJson.trim()) {
      importPreset(importJson.trim())
      setImportJson('')
      setShowImport(false)
    }
  }

  return (
    <div style={{ padding: '0.6rem 1.2rem', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="control-section">
        <div className="control-row-head">
          <div className="control-label">Presets</div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button className="header-legal-link" onClick={handleExport}>Export</button>
            <button className="header-legal-link" onClick={() => setShowImport(!showImport)}>Import</button>
          </div>
        </div>

        {showImport && (
          <div className="control-row">
            <textarea
              className="control-textarea"
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste preset JSON..."
            />
            <button className="source-mode-button" onClick={handleImport}>Load</button>
          </div>
        )}

        <div className="control-row" style={{ display: 'flex', gap: '0.35rem' }}>
          <input
            className="control-text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Preset name..."
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button className="source-mode-button" style={{ flex: '0 0 auto', width: '4rem' }} onClick={handleSave}>Save</button>
        </div>

        {presets.length > 0 && (
          <div className="control-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {presets.map((p) => (
              <div key={p.id} className="split-line">
                <button className="header-legal-link" onClick={() => loadPreset(p.id)}>
                  {p.name}
                </button>
                <button className="header-legal-link" onClick={() => deletePreset(p.id)}>
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

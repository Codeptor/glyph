import { useState } from 'react'
import { useStore } from '@/store/useStore'

interface Props {
  onClose: () => void
}

type ExportTab = 'json' | 'image' | 'save'

export function ExportPopover({ onClose }: Props) {
  const exportPreset = useStore((s) => s.exportPreset)
  const savePreset = useStore((s) => s.savePreset)
  const [tab, setTab] = useState<ExportTab>('json')
  const [copied, setCopied] = useState(false)
  const [saveName, setSaveName] = useState('')

  const json = exportPreset()

  const handleCopy = () => {
    navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    if (saveName.trim()) {
      savePreset(saveName.trim())
      setSaveName('')
    }
  }

  const tabs: { value: ExportTab; label: string }[] = [
    { value: 'json', label: 'JSON' },
    { value: 'image', label: 'Image' },
    { value: 'save', label: 'Save' },
  ]

  return (
    <div className="export-popover">
      <div className="export-popover-head">
        <span>Export</span>
        <button className="export-close" onClick={onClose}>Close</button>
      </div>
      <div className="export-popover-tabs">
        {tabs.map((t) => (
          <button
            key={t.value}
            className={tab === t.value ? 'active' : ''}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'json' && (
        <>
          <textarea
            className="export-code-block"
            value={json}
            readOnly
          />
          <div className="export-popover-actions">
            <button className="export-copy" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>
        </>
      )}

      {tab === 'image' && (
        <div className="export-popover-note">
          Image export — use the canvas download button to save the current frame as PNG.
        </div>
      )}

      {tab === 'save' && (
        <div style={{ padding: '0.6rem 0.8rem' }}>
          <div className="save-name-row">
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Preset name..."
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button onClick={handleSave}>Save</button>
          </div>
        </div>
      )}

      <div className="export-popover-disclaimer">
        All data is stored locally in your browser.
      </div>
    </div>
  )
}

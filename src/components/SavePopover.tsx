import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

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
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm uppercase tracking-wider">Presets</DialogTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="xs"
                className="text-[10px] uppercase tracking-wider cursor-crosshair"
                onClick={() => setShowImport(!showImport)}
              >
                Import
              </Button>
              <Button
                variant="ghost"
                size="xs"
                className="text-[10px] uppercase tracking-wider cursor-crosshair"
                onClick={handleExportCopy}
              >
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>

        {showImport && (
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Import JSON
            </Label>
            <Textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste preset JSON..."
              className="h-24 font-mono text-[10px] resize-none bg-[var(--bg-surface)]"
            />
            <Button
              variant="outline"
              size="sm"
              className="cursor-crosshair"
              onClick={handleImport}
            >
              Load
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Save Current
          </Label>
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Preset name..."
              className="flex-1 text-xs cursor-crosshair"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <Button
              variant="outline"
              size="sm"
              className="cursor-crosshair"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>

        {presets.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Saved ({presets.length})
              </Label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {presets.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-sm bg-[var(--bg-surface)] px-2 py-1.5"
                  >
                    <span className="text-xs text-foreground truncate flex-1">
                      {p.name}
                    </span>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-[10px] cursor-crosshair"
                        onClick={() => loadPreset(p.id)}
                      >
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-[10px] text-destructive hover:text-destructive cursor-crosshair"
                        onClick={() => deletePreset(p.id)}
                      >
                        Del
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

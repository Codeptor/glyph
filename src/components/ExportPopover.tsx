import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm uppercase tracking-wider">Export</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as ExportTab)}>
          <TabsList className="w-full">
            <TabsTrigger value="json" className="flex-1 text-xs cursor-crosshair">JSON</TabsTrigger>
            <TabsTrigger value="image" className="flex-1 text-xs cursor-crosshair">Image</TabsTrigger>
            <TabsTrigger value="save" className="flex-1 text-xs cursor-crosshair">Save</TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="space-y-3 mt-3">
            <Textarea
              value={json}
              readOnly
              className="h-48 font-mono text-[10px] resize-none bg-[var(--bg-surface)]"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full cursor-crosshair"
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy JSON'}
            </Button>
          </TabsContent>

          <TabsContent value="image" className="mt-3">
            <div className="rounded-md bg-[var(--bg-surface)] px-4 py-6 text-center text-xs text-muted-foreground">
              Image export -- use the canvas download button to save the current frame as PNG.
            </div>
          </TabsContent>

          <TabsContent value="save" className="space-y-3 mt-3">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Preset Name
              </Label>
              <div className="flex gap-2">
                <Input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
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
          </TabsContent>
        </Tabs>

        <div className="text-[10px] text-muted-foreground/50 text-center">
          All data is stored locally in your browser.
        </div>
      </DialogContent>
    </Dialog>
  )
}

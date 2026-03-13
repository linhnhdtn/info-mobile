import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { TagInput } from "./TagInput"
import { NOTE_COLORS, type Note } from "@/types"
import { noteRepo } from "@/db/repositories/note-repo"
import { toast } from "sonner"

interface NoteEditorProps {
  note?: Note | null
  open: boolean
  onClose: () => void
  onSaved: (note: Note) => void
}

export function NoteEditor({ note, open, onClose, onSaved }: NoteEditorProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [color, setColor] = useState("#FFFFFF")
  const [isPinned, setIsPinned] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (note) {
      setTitle(note.title || "")
      setContent(note.content)
      setColor(note.color || "#FFFFFF")
      setIsPinned(note.isPinned)
      setTags(note.tags)
    } else {
      setTitle("")
      setContent("")
      setColor("#FFFFFF")
      setIsPinned(false)
      setTags([])
    }
  }, [note, open])

  async function handleSave() {
    if (!content.trim() && !title.trim()) {
      toast.error("Vui lòng nhập nội dung ghi chú")
      return
    }
    setSaving(true)
    try {
      let saved: Note
      if (note) {
        saved = (await noteRepo.update(note.id, { title, content, color, isPinned, tags }))!
      } else {
        saved = await noteRepo.create({ title, content, color, isPinned, tags })
      }
      onSaved(saved)
      toast.success(note ? "Ghi chú đã được cập nhật" : "Đã thêm ghi chú mới")
      onClose()
    } catch {
      toast.error("Không thể lưu ghi chú")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{note ? "Chỉnh sửa ghi chú" : "Ghi chú mới"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Tiêu đề (tuỳ chọn)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tiêu đề..."
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Nội dung</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung ghi chú..."
              rows={6}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Màu sắc</Label>
            <div className="flex gap-2 flex-wrap">
              {NOTE_COLORS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  title={label}
                  onClick={() => setColor(value)}
                  className="h-7 w-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: value,
                    borderColor: color === value ? "#6b7280" : "#e5e7eb",
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Tags</Label>
            <TagInput tags={tags} onChange={setTags} />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="pinned" checked={isPinned} onCheckedChange={setIsPinned} />
            <Label htmlFor="pinned" className="text-sm cursor-pointer">Ghim ghi chú</Label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Huỷ</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

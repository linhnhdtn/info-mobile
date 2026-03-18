import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { EVENT_COLORS, type CalendarEvent } from "@/types"
import { eventRepo } from "@/db/repositories/event-repo"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { scheduleEventReminder, cancelEventReminder } from "@/lib/notifications"

interface EventFormProps {
  event?: Partial<CalendarEvent> & { defaultStart?: string } | null
  open: boolean
  onClose: () => void
  onSaved: (event: CalendarEvent) => void
  onDeleted?: (id: string) => void
}

function toInputDateTime(iso: string | null | undefined) {
  if (!iso) return ""
  return iso.slice(0, 16)
}

export function EventForm({ event, open, onClose, onSaved, onDeleted }: EventFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [allDay, setAllDay] = useState(false)
  const [location, setLocation] = useState("")
  const [color, setColor] = useState("#3B82F6")
  const [reminderAt, setReminderAt] = useState("")
  const [repeat, setRepeat] = useState("none")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (event) {
      setTitle(event.title || "")
      setDescription(event.description || "")
      setStart(toInputDateTime(event.start || (event as { defaultStart?: string }).defaultStart))
      setEnd(toInputDateTime(event.end))
      setAllDay(event.allDay || false)
      setLocation(event.location || "")
      setColor(event.color || "#3B82F6")
      setReminderAt(toInputDateTime(event.reminderAt))
      setRepeat("none")
    } else {
      setTitle(""); setDescription(""); setStart(""); setEnd("")
      setAllDay(false); setLocation(""); setColor("#3B82F6")
      setReminderAt(""); setRepeat("none")
    }
  }, [event, open])

  function buildRrule(r: string) {
    if (r === "daily") return "FREQ=DAILY"
    if (r === "weekly") return "FREQ=WEEKLY"
    if (r === "monthly") return "FREQ=MONTHLY"
    return null
  }

  async function handleSave() {
    if (!title.trim()) { toast.error("Vui lòng nhập tiêu đề"); return }
    if (!start) { toast.error("Vui lòng chọn ngày bắt đầu"); return }
    setSaving(true)
    try {
      const repeatRule = buildRrule(repeat)
      const body = {
        title, description, start, end: end || null, allDay,
        location, color, reminderAt: reminderAt || null,
        isRepeating: repeat !== "none",
        repeatRule,
      }
      const isEdit = event && "id" in event && event.id
      let saved: CalendarEvent
      if (isEdit) {
        saved = (await eventRepo.update(event.id!, body))!
      } else {
        saved = await eventRepo.create(body)
      }
      // Schedule or cancel notification
      if (saved.reminderAt) {
        await scheduleEventReminder({
          eventId: saved.id,
          title: `Nhắc nhở: ${saved.title}`,
          body: saved.description || saved.location || 'Bạn có sự kiện sắp tới',
          at: new Date(saved.reminderAt),
        })
      } else {
        await cancelEventReminder(saved.id)
      }

      onSaved(saved)
      toast.success(isEdit ? "Đã cập nhật sự kiện" : "Đã thêm sự kiện mới")
      onClose()
    } catch {
      toast.error("Không thể lưu sự kiện")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!event || !("id" in event) || !event.id) return
    if (!confirm("Xoá sự kiện này?")) return
    setDeleting(true)
    try {
      await eventRepo.delete(event.id)
      await cancelEventReminder(event.id)
      onDeleted?.(event.id)
      toast.success("Đã xoá sự kiện")
      onClose()
    } catch {
      toast.error("Không thể xoá sự kiện")
    } finally {
      setDeleting(false)
    }
  }

  const isEdit = event && "id" in event && event.id

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa sự kiện" : "Sự kiện mới"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Tiêu đề *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên sự kiện..." />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Mô tả</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Chi tiết sự kiện..." rows={2} />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="allDay" checked={allDay} onCheckedChange={setAllDay} />
            <Label htmlFor="allDay" className="text-sm cursor-pointer">Cả ngày</Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Bắt đầu *</Label>
              <Input type={allDay ? "date" : "datetime-local"} value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Kết thúc</Label>
              <Input type={allDay ? "date" : "datetime-local"} value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Địa điểm</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Địa điểm..." />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Màu sắc</Label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: color === c ? "#111" : "transparent" }}
                />
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Nhắc nhở</Label>
            <Input type="datetime-local" value={reminderAt} onChange={(e) => setReminderAt(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Lặp lại</Label>
            <Select value={repeat} onValueChange={setRepeat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không lặp</SelectItem>
                <SelectItem value="daily">Hàng ngày</SelectItem>
                <SelectItem value="weekly">Hàng tuần</SelectItem>
                <SelectItem value="monthly">Hàng tháng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between pt-2">
            {isEdit && (
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-1" />
                {deleting ? "Đang xoá..." : "Xoá"}
              </Button>
            )}
            <div className={`flex gap-2 ${isEdit ? "" : "ml-auto"}`}>
              <Button variant="outline" onClick={onClose} disabled={saving}>Huỷ</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

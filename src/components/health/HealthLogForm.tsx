import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { healthRepo } from "@/db/repositories/health-repo"
import { MOOD_OPTIONS } from "@/types"
import type { HealthLog } from "@/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface HealthLogFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: string
  existing: HealthLog | null
  onSaved: () => void
}

export function HealthLogForm({ open, onOpenChange, date, existing, onSaved }: HealthLogFormProps) {
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [bpSys, setBpSys] = useState("")
  const [bpDia, setBpDia] = useState("")
  const [heartRate, setHeartRate] = useState("")
  const [sleepHours, setSleepHours] = useState("")
  const [waterMl, setWaterMl] = useState("")
  const [steps, setSteps] = useState("")
  const [exerciseMinutes, setExerciseMinutes] = useState("")
  const [mood, setMood] = useState("")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (existing) {
        setWeight(existing.weight?.toString() ?? "")
        setHeight(existing.height?.toString() ?? "")
        setBpSys(existing.bloodPressureSys?.toString() ?? "")
        setBpDia(existing.bloodPressureDia?.toString() ?? "")
        setHeartRate(existing.heartRate?.toString() ?? "")
        setSleepHours(existing.sleepHours?.toString() ?? "")
        setWaterMl(existing.waterMl?.toString() ?? "")
        setSteps(existing.steps?.toString() ?? "")
        setExerciseMinutes(existing.exerciseMinutes?.toString() ?? "")
        setMood(existing.mood ?? "")
        setNote(existing.note ?? "")
      } else {
        setWeight("")
        setHeight("")
        setBpSys("")
        setBpDia("")
        setHeartRate("")
        setSleepHours("")
        setWaterMl("")
        setSteps("")
        setExerciseMinutes("")
        setMood("")
        setNote("")
        // Auto-fill height from latest
        healthRepo.getLatestHeight().then((h) => {
          if (h) setHeight(h.toString())
        })
      }
    }
  }, [open, existing])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await healthRepo.upsert(date, {
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        bloodPressureSys: bpSys ? parseInt(bpSys) : null,
        bloodPressureDia: bpDia ? parseInt(bpDia) : null,
        heartRate: heartRate ? parseInt(heartRate) : null,
        sleepHours: sleepHours ? parseFloat(sleepHours) : null,
        waterMl: waterMl ? parseInt(waterMl) : null,
        steps: steps ? parseInt(steps) : null,
        exerciseMinutes: exerciseMinutes ? parseInt(exerciseMinutes) : null,
        mood: mood || null,
        note: note || null,
      })
      toast.success(existing ? "Đã cập nhật" : "Đã ghi nhận")
      onOpenChange(false)
      onSaved()
    } catch {
      toast.error("Lỗi khi lưu")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Cập nhật" : "Ghi nhận"} sức khỏe - {date}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Cân nặng (kg)</Label>
              <Input type="number" step="0.1" placeholder="VD: 65.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Chiều cao (cm)</Label>
              <Input type="number" step="0.1" placeholder="VD: 170" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Huyết áp tâm thu</Label>
              <Input type="number" placeholder="VD: 120" value={bpSys} onChange={(e) => setBpSys(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Huyết áp tâm trương</Label>
              <Input type="number" placeholder="VD: 80" value={bpDia} onChange={(e) => setBpDia(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nhịp tim (bpm)</Label>
              <Input type="number" placeholder="VD: 72" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Giờ ngủ</Label>
              <Input type="number" step="0.5" placeholder="VD: 7.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nước uống (ml)</Label>
              <Input type="number" step="100" placeholder="VD: 2000" value={waterMl} onChange={(e) => setWaterMl(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Số bước đi</Label>
              <Input type="number" placeholder="VD: 10000" value={steps} onChange={(e) => setSteps(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Thời gian tập luyện (phút)</Label>
            <Input type="number" placeholder="VD: 30" value={exerciseMinutes} onChange={(e) => setExerciseMinutes(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Tâm trạng</Label>
            <div className="flex gap-2">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(mood === m.value ? "" : m.value)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-0.5 p-2 rounded-lg border transition-colors",
                    mood === m.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Ghi chú</Label>
            <Textarea placeholder="Ghi chú thêm..." value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Đang lưu..." : (existing ? "Cập nhật" : "Ghi nhận")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

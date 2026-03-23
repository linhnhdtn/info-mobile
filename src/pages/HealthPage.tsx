import { useState, useEffect, useCallback } from "react"
import { HeartPulse, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { HealthSummaryCard } from "@/components/health/HealthSummaryCard"
import { HealthLogForm } from "@/components/health/HealthLogForm"
import { HealthDayCard } from "@/components/health/HealthDayCard"
import { HealthChart } from "@/components/health/HealthChart"
import { HealthPhotoGallery } from "@/components/health/HealthPhotoGallery"
import { healthRepo } from "@/db/repositories/health-repo"
import { useAppResume } from "@/lib/useAppResume"
import type { HealthLog, HealthPhoto } from "@/types"
import { toast } from "sonner"
import { format, subDays } from "date-fns"

export default function HealthPage() {
  const [logs, setLogs] = useState<HealthLog[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<HealthLog | null>(null)
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"))

  // Photo gallery state
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryLog, setGalleryLog] = useState<HealthLog | null>(null)
  const [galleryPhotos, setGalleryPhotos] = useState<HealthPhoto[]>([])
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({})

  const today = format(new Date(), "yyyy-MM-dd")
  const todayLog = logs.find((l) => l.date === today) || null

  const loadData = useCallback(async () => {
    try {
      const startDate = format(subDays(new Date(), 90), "yyyy-MM-dd")
      const endDate = today
      const data = await healthRepo.getRange(startDate, endDate)
      setLogs(data)

      // Load photo counts for each log
      const counts: Record<string, number> = {}
      for (const log of data) {
        const photos = await healthRepo.getPhotos(log.id)
        counts[log.id] = photos.length
      }
      setPhotoCounts(counts)
    } catch {
      toast.error("Không thể tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => { loadData() }, [loadData])
  useAppResume(loadData)

  function handleAdd() {
    setEditingLog(null)
    setFormDate(today)
    setFormOpen(true)
  }

  function handleEdit(log: HealthLog) {
    setEditingLog(log)
    setFormDate(log.date)
    setFormOpen(true)
  }

  async function handleDelete(id: string) {
    try {
      await healthRepo.delete(id)
      setLogs((prev) => prev.filter((l) => l.id !== id))
      toast.success("Đã xóa")
    } catch {
      toast.error("Lỗi khi xóa")
    }
  }

  async function handleViewPhotos(log: HealthLog) {
    const photos = await healthRepo.getPhotos(log.id)
    setGalleryLog(log)
    setGalleryPhotos(photos)
    setGalleryOpen(true)
  }

  async function handlePhotosChanged() {
    if (!galleryLog) return
    const photos = await healthRepo.getPhotos(galleryLog.id)
    setGalleryPhotos(photos)
    setPhotoCounts((prev) => ({ ...prev, [galleryLog.id]: photos.length }))
  }

  const reversedLogs = [...logs].reverse()

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900">Sức khỏe</h2>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Ghi nhận
        </Button>
      </div>

      <HealthSummaryCard todayLog={todayLog} recentLogs={logs} />

      <HealthChart logs={logs} />

      {reversedLogs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <HeartPulse className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có dữ liệu sức khỏe.</p>
          <p className="text-sm mt-1">Nhấn "Ghi nhận" để bắt đầu theo dõi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Lịch sử</h3>
          {reversedLogs.map((log) => (
            <HealthDayCard
              key={log.id}
              log={log}
              photoCount={photoCounts[log.id] || 0}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewPhotos={handleViewPhotos}
            />
          ))}
        </div>
      )}

      <HealthLogForm
        open={formOpen}
        onOpenChange={setFormOpen}
        date={formDate}
        existing={editingLog}
        onSaved={loadData}
      />

      {galleryLog && (
        <HealthPhotoGallery
          open={galleryOpen}
          onOpenChange={setGalleryOpen}
          healthLogId={galleryLog.id}
          date={galleryLog.date}
          photos={galleryPhotos}
          onChanged={handlePhotosChanged}
        />
      )}
    </div>
  )
}

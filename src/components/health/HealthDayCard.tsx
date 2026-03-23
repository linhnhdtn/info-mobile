import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, ImageIcon } from "lucide-react"
import { MOOD_OPTIONS } from "@/types"
import type { HealthLog } from "@/types"
import { format, parseISO } from "date-fns"
import { vi } from "date-fns/locale"

interface HealthDayCardProps {
  log: HealthLog
  photoCount: number
  onEdit: (log: HealthLog) => void
  onDelete: (id: string) => void
  onViewPhotos: (log: HealthLog) => void
}

export function HealthDayCard({ log, photoCount, onEdit, onDelete, onViewPhotos }: HealthDayCardProps) {
  const mood = log.mood ? MOOD_OPTIONS.find((m) => m.value === log.mood) : null
  const dateObj = parseISO(log.date)

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">
              {format(dateObj, "EEEE, dd/MM", { locale: vi })}
            </h3>
            {mood && <span className="text-lg">{mood.emoji}</span>}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-blue-500 relative" onClick={() => onViewPhotos(log)}>
              <ImageIcon className="h-3.5 w-3.5" />
              {photoCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[9px] rounded-full h-3.5 w-3.5 flex items-center justify-center">
                  {photoCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-blue-500" onClick={() => onEdit(log)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500" onClick={() => onDelete(log.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {log.weight && (
            <div>
              <span className="text-muted-foreground text-xs">Cân nặng: </span>
              <span className="font-medium">{log.weight} kg</span>
            </div>
          )}
          {log.bloodPressureSys && log.bloodPressureDia && (
            <div>
              <span className="text-muted-foreground text-xs">Huyết áp: </span>
              <span className="font-medium">{log.bloodPressureSys}/{log.bloodPressureDia}</span>
            </div>
          )}
          {log.heartRate && (
            <div>
              <span className="text-muted-foreground text-xs">Nhịp tim: </span>
              <span className="font-medium">{log.heartRate} bpm</span>
            </div>
          )}
          {log.sleepHours && (
            <div>
              <span className="text-muted-foreground text-xs">Ngủ: </span>
              <span className="font-medium">{log.sleepHours}h</span>
            </div>
          )}
          {log.waterMl && (
            <div>
              <span className="text-muted-foreground text-xs">Nước: </span>
              <span className="font-medium">{log.waterMl} ml</span>
            </div>
          )}
          {log.steps && (
            <div>
              <span className="text-muted-foreground text-xs">Bước: </span>
              <span className="font-medium">{log.steps.toLocaleString()}</span>
            </div>
          )}
          {log.exerciseMinutes && (
            <div>
              <span className="text-muted-foreground text-xs">Tập: </span>
              <span className="font-medium">{log.exerciseMinutes} ph</span>
            </div>
          )}
        </div>

        {log.note && (
          <p className="text-xs text-muted-foreground line-clamp-2">{log.note}</p>
        )}
      </CardContent>
    </Card>
  )
}

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, MapPin } from "lucide-react"
import { Link } from "react-router-dom"
import { eventRepo } from "@/db/repositories/event-repo"
import { useAppResume } from "@/lib/useAppResume"
import type { CalendarEvent } from "@/types"

export function UpcomingEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  const loadEvents = useCallback(() => {
    const start = new Date().toISOString()
    const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    eventRepo.getByDateRange(start, end)
      .then((data) => {
        setEvents(data.slice(0, 5))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { loadEvents() }, [loadEvents])
  useAppResume(loadEvents)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">Sự kiện sắp tới</CardTitle>
        <Link to="/schedule" className="text-xs text-blue-600 hover:underline">Xem tất cả →</Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded" />
          ))
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Không có sự kiện nào</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex items-start gap-3">
              <div
                className="mt-0.5 h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: event.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{event.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  <span>{new Date(event.start).toLocaleDateString("vi-VN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  {event.location && (
                    <>
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{event.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

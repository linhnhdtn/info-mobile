import { useEffect, useState } from "react"
import { ArrowLeftRight, Calendar, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LunarConverterCard } from "@/components/dashboard/LunarConverterCard"
import { getLunarDateInfo, getHoangDaoHours, type LunarDateInfo, type HoangDaoHour } from "@/lib/lunar"

const WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]

function formatTime(date: Date): string {
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
}

function formatSolarDate(date: Date): string {
  const weekday = WEEKDAYS[date.getDay()]
  const dd = date.getDate().toString().padStart(2, "0")
  const mm = (date.getMonth() + 1).toString().padStart(2, "0")
  const yyyy = date.getFullYear()
  return `${weekday}, ngày ${dd} tháng ${mm} năm ${yyyy}`
}

function formatLunarDate(lunar: LunarDateInfo): string {
  const leapStr = lunar.isLeapMonth ? " (nhuận)" : ""
  return `Ngày ${lunar.lunarDay} tháng ${lunar.lunarMonth}${leapStr} năm ${lunar.canChiYear}`
}

export function DateTimeCard() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!now) return null

  const lunar = getLunarDateInfo(now)
  const hoangDaoHours = getHoangDaoHours(now.getDate(), now.getMonth() + 1, now.getFullYear())
    .filter((h) => h.isHoangDao)
  const currentHour = now.getHours()

  function isCurrentHour(h: HoangDaoHour): boolean {
    if (h.startHour > h.endHour) {
      return currentHour >= h.startHour || currentHour < h.endHour
    }
    return currentHour >= h.startHour && currentHour < h.endHour
  }

  return (
    <div className="bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl p-6 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-violet-200 shrink-0" />
          <Dialog>
            <DialogTrigger asChild>
              <button
                title="Chuyển đổi lịch âm dương"
                className="rounded-md p-1 hover:bg-white/20 transition-colors"
              >
                <ArrowLeftRight className="h-4 w-4 text-violet-200" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogTitle className="sr-only">Chuyển đổi lịch âm dương</DialogTitle>
              <LunarConverterCard />
            </DialogContent>
          </Dialog>
          <span className="text-4xl font-mono font-bold tracking-wider">
            {formatTime(now)}
          </span>
        </div>
        <div className="sm:ml-auto space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-200 shrink-0" />
            <span className="text-violet-100">{formatSolarDate(now)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-200 shrink-0" />
            <span className="text-violet-100">
              {formatLunarDate(lunar)} — con {lunar.conGiap}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-xs text-violet-200 mb-2 font-medium">Giờ hoàng đạo hôm nay</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {hoangDaoHours.map((h) => {
            const active = isCurrentHour(h)
            return (
              <div
                key={h.chi}
                className={`rounded-lg px-2.5 py-1.5 text-center text-xs transition-colors ${
                  active
                    ? "bg-white/30 ring-1 ring-white/50 font-semibold"
                    : "bg-white/10"
                }`}
              >
                <div className="font-medium">{h.chi} <span className="text-violet-200">({h.timeRange.replace("-", "–")}h)</span></div>
                <div className="text-[10px] text-violet-200">{h.sao}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

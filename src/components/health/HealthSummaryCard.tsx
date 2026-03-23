import { Card, CardContent } from "@/components/ui/card"
import { MOOD_OPTIONS } from "@/types"
import type { HealthLog } from "@/types"
import { cn } from "@/lib/utils"

interface HealthSummaryCardProps {
  todayLog: HealthLog | null
  recentLogs: HealthLog[]
}

function calcBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100
  return weight / (heightM * heightM)
}

function getBMILabel(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Thiếu cân", color: "text-yellow-600" }
  if (bmi < 25) return { label: "Bình thường", color: "text-emerald-600" }
  if (bmi < 30) return { label: "Thừa cân", color: "text-orange-600" }
  return { label: "Béo phì", color: "text-red-600" }
}

export function HealthSummaryCard({ todayLog, recentLogs }: HealthSummaryCardProps) {
  const mood = todayLog?.mood
    ? MOOD_OPTIONS.find((m) => m.value === todayLog.mood)
    : null

  const bmi = todayLog?.weight && todayLog?.height
    ? calcBMI(todayLog.weight, todayLog.height)
    : null

  const bmiInfo = bmi ? getBMILabel(bmi) : null

  // Weight trend: compare today vs previous log
  const prevLog = recentLogs.length > 1
    ? recentLogs.find((l) => l.date !== todayLog?.date && l.weight)
    : null
  const weightDiff = todayLog?.weight && prevLog?.weight
    ? todayLog.weight - prevLog.weight
    : null

  // Streak: consecutive days with logs
  const streak = (() => {
    if (recentLogs.length === 0) return 0
    let count = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      if (recentLogs.some((l) => l.date === dateStr)) {
        count++
      } else {
        break
      }
    }
    return count
  })()

  return (
    <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-200">Hôm nay</p>
            {todayLog?.weight ? (
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{todayLog.weight} kg</p>
                {weightDiff !== null && (
                  <span className={cn("text-sm font-medium", weightDiff > 0 ? "text-red-300" : weightDiff < 0 ? "text-emerald-300" : "text-blue-200")}>
                    {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)} kg
                  </span>
                )}
              </div>
            ) : (
              <p className="text-lg text-blue-200">Chưa ghi nhận</p>
            )}
          </div>
          {mood && (
            <div className="text-center">
              <span className="text-3xl">{mood.emoji}</span>
              <p className="text-xs text-blue-200 mt-1">{mood.label}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {bmi !== null && bmiInfo && (
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-200">BMI</p>
              <p className="font-bold">{bmi.toFixed(1)}</p>
              <p className="text-xs text-blue-200">{bmiInfo.label}</p>
            </div>
          )}
          {todayLog?.sleepHours && (
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-200">Giấc ngủ</p>
              <p className="font-bold">{todayLog.sleepHours}h</p>
            </div>
          )}
          {todayLog?.waterMl && (
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-200">Nước</p>
              <p className="font-bold">{todayLog.waterMl} ml</p>
            </div>
          )}
          {todayLog?.steps && (
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-200">Bước đi</p>
              <p className="font-bold">{todayLog.steps.toLocaleString()}</p>
            </div>
          )}
          {todayLog?.exerciseMinutes && (
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-200">Tập luyện</p>
              <p className="font-bold">{todayLog.exerciseMinutes} ph</p>
            </div>
          )}
          {streak > 0 && (
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-200">Streak</p>
              <p className="font-bold">{streak} ngày</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

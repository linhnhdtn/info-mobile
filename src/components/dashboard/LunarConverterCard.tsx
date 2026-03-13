import { useState } from "react"
import { ArrowLeftRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { getLunarDateInfo, getSolarFromLunar, getCanChiDay } from "@/lib/lunar"

const WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]

type Tab = "solar-to-lunar" | "lunar-to-solar"

export function LunarConverterCard() {
  const [tab, setTab] = useState<Tab>("solar-to-lunar")

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  const [solarDate, setSolarDate] = useState(todayStr)

  const [lunarDay, setLunarDay] = useState(1)
  const [lunarMonth, setLunarMonth] = useState(1)
  const [lunarYear, setLunarYear] = useState(today.getFullYear())
  const [isLeapMonth, setIsLeapMonth] = useState(false)

  const solarResult = (() => {
    if (!solarDate) return null
    const [y, m, d] = solarDate.split("-").map(Number)
    if (!y || !m || !d) return null
    const date = new Date(y, m - 1, d)
    if (isNaN(date.getTime())) return null
    return getLunarDateInfo(date)
  })()

  const lunarResult = (() => {
    if (lunarDay < 1 || lunarDay > 30 || lunarMonth < 1 || lunarMonth > 12 || lunarYear < 1) return null
    try {
      const { day, month, year } = getSolarFromLunar(lunarDay, lunarMonth, lunarYear, isLeapMonth)
      if (!day || !month || !year) return null
      const date = new Date(year, month - 1, day)
      const weekday = WEEKDAYS[date.getDay()]
      return {
        day, month, year, weekday,
        canChiDay: getCanChiDay(day, month, year),
      }
    } catch {
      return null
    }
  })()

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowLeftRight className="h-5 w-5" />
          Chuyển đổi lịch âm dương
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex rounded-lg bg-muted p-1">
          <button
            onClick={() => setTab("solar-to-lunar")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "solar-to-lunar" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dương → Âm
          </button>
          <button
            onClick={() => setTab("lunar-to-solar")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "lunar-to-solar" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Âm → Dương
          </button>
        </div>

        {tab === "solar-to-lunar" ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="solar-input">Chọn ngày dương lịch</Label>
              <Input
                id="solar-input"
                type="date"
                value={solarDate}
                onChange={(e) => setSolarDate(e.target.value)}
                className="mt-1"
              />
            </div>
            {solarResult && (
              <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
                <p className="font-medium">
                  Ngày {solarResult.lunarDay} tháng {solarResult.lunarMonth}
                  {solarResult.isLeapMonth ? " (nhuận)" : ""} năm {solarResult.canChiYear}
                </p>
                <p className="text-muted-foreground">
                  Con giáp: {solarResult.conGiap}
                </p>
                <p className="text-muted-foreground">
                  Ngày: {solarResult.canChiDay}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="lunar-day">Ngày</Label>
                <Input
                  id="lunar-day"
                  type="number"
                  min={1}
                  max={30}
                  value={lunarDay}
                  onChange={(e) => setLunarDay(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lunar-month">Tháng</Label>
                <Input
                  id="lunar-month"
                  type="number"
                  min={1}
                  max={12}
                  value={lunarMonth}
                  onChange={(e) => setLunarMonth(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lunar-year">Năm</Label>
                <Input
                  id="lunar-year"
                  type="number"
                  min={1}
                  max={9999}
                  value={lunarYear}
                  onChange={(e) => setLunarYear(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="leap-month"
                checked={isLeapMonth}
                onCheckedChange={(checked) => setIsLeapMonth(checked === true)}
              />
              <Label htmlFor="leap-month" className="text-sm font-normal">
                Tháng nhuận
              </Label>
            </div>
            {lunarResult && (
              <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
                <p className="font-medium">
                  {lunarResult.weekday}, ngày {String(lunarResult.day).padStart(2, "0")}/{String(lunarResult.month).padStart(2, "0")}/{lunarResult.year}
                </p>
                <p className="text-muted-foreground">
                  Ngày: {lunarResult.canChiDay}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

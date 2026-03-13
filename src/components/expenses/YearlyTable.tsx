import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { expenseRepo } from "@/db/repositories/expense-repo"

interface MonthData {
  month: number
  totalBudget: number | null
  totalSpent: number
}

interface YearlyData {
  year: number
  months: MonthData[]
}

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ"
}

function getProgressColor(pct: number) {
  if (pct >= 80) return { bg: "bg-red-500", text: "text-red-600" }
  if (pct >= 50) return { bg: "bg-yellow-500", text: "text-yellow-600" }
  return { bg: "bg-green-500", text: "text-green-600" }
}

export function YearlyTable() {
  const navigate = useNavigate()
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [data, setData] = useState<YearlyData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    expenseRepo.getYearlySummary(year)
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [year])

  const handleRowClick = (month: number) => {
    navigate(`/expenses?month=${month}`)
  }

  const monthsWithBudget = data?.months.filter((m) => m.totalBudget !== null) ?? []
  const totalBudget = monthsWithBudget.reduce((s, m) => s + (m.totalBudget ?? 0), 0)
  const totalSpent = data?.months.reduce((s, m) => s + m.totalSpent, 0) ?? 0
  const totalRemaining = totalBudget - totalSpent
  const totalPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold">Tổng quan chi tiêu</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYear((y) => y - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold w-12 text-center">{year}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYear((y) => y + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Tháng</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground text-right">Ngân sách</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground text-right">Đã tiêu</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground text-right">Còn lại</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground text-right w-14">%</th>
                  <th className="pb-2 font-medium text-muted-foreground hidden sm:table-cell w-32">Tiến trình</th>
                </tr>
              </thead>
              <tbody>
                {data?.months.map((m, i) => {
                  const hasBudget = m.totalBudget !== null
                  const remaining = hasBudget ? (m.totalBudget ?? 0) - m.totalSpent : null
                  const pct = hasBudget && m.totalBudget! > 0
                    ? Math.round((m.totalSpent / m.totalBudget!) * 100)
                    : null
                  const colors = pct !== null ? getProgressColor(pct) : null

                  return (
                    <tr
                      key={m.month}
                      onClick={() => hasBudget ? handleRowClick(m.month) : undefined}
                      className={cn(
                        "border-b last:border-0 transition-colors",
                        hasBudget && "cursor-pointer hover:bg-gray-50"
                      )}
                    >
                      <td className="py-2.5 pr-4 font-medium">T{i + 1}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">
                        {hasBudget ? formatVND(m.totalBudget!) : <span className="text-muted-foreground">&mdash;</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">
                        {hasBudget ? formatVND(m.totalSpent) : <span className="text-muted-foreground">&mdash;</span>}
                      </td>
                      <td className={cn("py-2.5 pr-4 text-right tabular-nums", remaining !== null && remaining < 0 && "text-red-600")}>
                        {remaining !== null ? formatVND(remaining) : <span className="text-muted-foreground">&mdash;</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-right">
                        {pct !== null ? (
                          <span className={cn("font-medium", colors!.text)}>{pct}%</span>
                        ) : (
                          <span className="text-muted-foreground">&mdash;</span>
                        )}
                      </td>
                      <td className="py-2.5 hidden sm:table-cell">
                        {pct !== null && (
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all", colors!.bg)}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {monthsWithBudget.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 font-semibold">
                    <td className="pt-3 pr-4">Tổng</td>
                    <td className="pt-3 pr-4 text-right tabular-nums">{formatVND(totalBudget)}</td>
                    <td className="pt-3 pr-4 text-right tabular-nums">{formatVND(totalSpent)}</td>
                    <td className={cn("pt-3 pr-4 text-right tabular-nums", totalRemaining < 0 && "text-red-600")}>
                      {formatVND(totalRemaining)}
                    </td>
                    <td className="pt-3 pr-4 text-right">
                      <span className={cn("font-medium", getProgressColor(totalPct).text)}>{totalPct}%</span>
                    </td>
                    <td className="pt-3 hidden sm:table-cell">
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", getProgressColor(totalPct).bg)}
                          style={{ width: `${Math.min(totalPct, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

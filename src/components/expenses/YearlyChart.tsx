import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { expenseRepo } from "@/db/repositories/expense-repo"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts"

function formatVND(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "tr"
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k"
  return n.toLocaleString("vi-VN") + "đ"
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tooltipVND(value: any) {
  const n = Number(value)
  return n.toLocaleString("vi-VN") + "đ"
}

interface YearlyChartProps {
  year?: number
}

interface ChartData {
  month: string
  "Ngân sách": number
  "Thực chi": number
}

export function YearlyChart({ year: yearProp }: YearlyChartProps) {
  const [year] = useState(() => yearProp ?? new Date().getFullYear())
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const summary = await expenseRepo.getYearlySummary(year)
        setData(
          summary.months.map((m) => ({
            month: `T${m.month % 100}`,
            "Ngân sách": m.totalBudget ?? 0,
            "Thực chi": m.totalSpent,
          }))
        )
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [year])

  if (loading) {
    return <Skeleton className="h-[280px] w-full" />
  }

  const hasData = data.some((d) => d["Ngân sách"] > 0 || d["Thực chi"] > 0)
  if (!hasData) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Biểu đồ năm {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={formatVND} />
            <Tooltip formatter={tooltipVND} />
            <Legend />
            <Line
              type="monotone"
              dataKey="Ngân sách"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Thực chi"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

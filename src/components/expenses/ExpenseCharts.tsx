import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EXPENSE_CATEGORIES } from "@/types"
import type { Budget, Expense } from "@/types"
import {
  PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
  AreaChart, Area,
  ResponsiveContainer,
} from "recharts"

const CATEGORY_COLORS: Record<string, string> = {
  food: "#10B981",
  transport: "#3B82F6",
  shopping: "#F59E0B",
  entertainment: "#8B5CF6",
  bills: "#EF4444",
  other: "#6B7280",
}

function getCategoryLabel(value: string) {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)?.label || value
}

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

interface ExpenseChartsProps {
  expenses: Expense[]
  budget: Budget | null
  monthKey: number
}

export function ExpenseCharts({ expenses, budget, monthKey }: ExpenseChartsProps) {
  const daysInMonth = useMemo(() => {
    const year = Math.floor(monthKey / 100)
    const month = monthKey % 100
    return new Date(year, month, 0).getDate()
  }, [monthKey])

  // Pie chart data - expenses by category
  const pieData = useMemo(() => {
    const byCategory: Record<string, number> = {}
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
    })
    return Object.entries(byCategory)
      .map(([cat, value]) => ({
        name: getCategoryLabel(cat),
        value,
        fill: CATEGORY_COLORS[cat] || "#6B7280",
      }))
      .sort((a, b) => b.value - a.value)
  }, [expenses])

  // Bar chart data - daily spending
  const { barData, avgDailyBudget } = useMemo(() => {
    const dailySpend: Record<number, number> = {}
    expenses.forEach((e) => {
      const day = new Date(e.date).getDate()
      dailySpend[day] = (dailySpend[day] || 0) + e.amount
    })

    const allowances = budget?.dailyAllowances as number[] | undefined
    const avg = budget
      ? budget.totalBudget / daysInMonth
      : 0

    const data = []
    for (let d = 1; d <= daysInMonth; d++) {
      const spent = dailySpend[d] || 0
      const dailyBudget = allowances?.[d - 1] ?? avg
      data.push({
        day: d,
        "Chi tiêu": spent,
        fill: spent > dailyBudget && dailyBudget > 0 ? "#EF4444" : "#3B82F6",
      })
    }
    return { barData: data, avgDailyBudget: avg }
  }, [expenses, budget, daysInMonth])

  // Area chart data - cumulative spending vs budget
  const areaData = useMemo(() => {
    const dailySpend: Record<number, number> = {}
    expenses.forEach((e) => {
      const day = new Date(e.date).getDate()
      dailySpend[day] = (dailySpend[day] || 0) + e.amount
    })

    const allowances = budget?.dailyAllowances as number[] | undefined
    let cumBudget = 0
    let cumSpent = 0
    const data = []
    for (let d = 1; d <= daysInMonth; d++) {
      cumBudget += allowances?.[d - 1] ?? (budget ? budget.totalBudget / daysInMonth : 0)
      cumSpent += dailySpend[d] || 0
      data.push({
        day: d,
        "Ngân sách": Math.round(cumBudget),
        "Thực chi": Math.round(cumSpent),
      })
    }
    return data
  }, [expenses, budget, daysInMonth])

  if (expenses.length === 0) return null

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderPieLabel = (props: any) => {
    const percent = props.percent as number
    if (percent < 0.05) return null
    return `${(percent * 100).toFixed(0)}%`
  }

  return (
    <div className="space-y-4">
      {/* Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Chi tiêu theo danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={renderPieLabel}
                labelLine={false}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={tooltipVND} />
              <Legend
                formatter={(value: string) => {
                  const item = pieData.find((p) => p.name === value)
                  return `${value} (${item ? tooltipVND(item.value) : ""})`
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-muted-foreground mt-1">
            Tổng: {total.toLocaleString("vi-VN")}đ
          </p>
        </CardContent>
      </Card>

      {/* Bar Chart - Daily Spending */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Chi tiêu theo ngày</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10 }}
                tickFormatter={(d) => (d % 5 === 0 || d === 1 ? String(d) : "")}
              />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={formatVND} />
              <Tooltip
                formatter={tooltipVND}
                labelFormatter={(label) => `Ngày ${label}`}
              />
              <Bar dataKey="Chi tiêu" radius={[2, 2, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
              {budget && (
                <ReferenceLine
                  y={avgDailyBudget}
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  label={{ value: "TB", position: "right", fontSize: 10, fill: "#EF4444" }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Area Chart - Cumulative */}
      {budget && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Tích lũy trong tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={areaData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(d) => (d % 5 === 0 || d === 1 ? String(d) : "")}
                />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={formatVND} />
                <Tooltip
                  formatter={tooltipVND}
                  labelFormatter={(label) => `Ngày ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="Ngân sách"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="Thực chi"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

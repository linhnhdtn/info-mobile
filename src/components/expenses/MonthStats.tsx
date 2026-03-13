import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EXPENSE_CATEGORIES } from "@/types"
import type { Expense } from "@/types"

interface MonthStatsProps {
  expenses: Expense[]
}

function getCategoryLabel(value: string) {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)?.label || value
}

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ"
}

const CATEGORY_COLORS: Record<string, string> = {
  food: "#10B981",
  transport: "#3B82F6",
  shopping: "#F59E0B",
  entertainment: "#8B5CF6",
  bills: "#EF4444",
  other: "#6B7280",
}

export function MonthStats({ expenses }: MonthStatsProps) {
  if (expenses.length === 0) return null

  const totalMonth = expenses.reduce((sum, e) => sum + e.amount, 0)

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

  const top3 = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 3)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Thống kê tháng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase">Chi tiêu theo danh mục</p>
          {sorted.map(([cat, amount]) => {
            const pct = (amount / totalMonth) * 100
            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{getCategoryLabel(cat)}</span>
                  <span className="text-muted-foreground">{formatVND(amount)} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat] || "#6B7280" }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {top3.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">Top khoản chi lớn nhất</p>
            {top3.map((e, i) => (
              <div key={e.id} className="flex items-center gap-2 text-sm">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                <span className="flex-1 truncate">{e.description || getCategoryLabel(e.category)}</span>
                <span className="font-semibold">{formatVND(e.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

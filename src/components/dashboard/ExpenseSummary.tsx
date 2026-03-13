import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
import { budgetRepo } from "@/db/repositories/budget-repo"
import { expenseRepo } from "@/db/repositories/expense-repo"
import type { Budget, Expense } from "@/types"

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ"
}

function getDateString(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getColorClass(remaining: number, total: number) {
  if (total <= 0) return "bg-gray-200"
  const ratio = remaining / total
  if (ratio > 0.5) return "bg-emerald-500"
  if (ratio > 0.2) return "bg-amber-500"
  return "bg-red-500"
}

export function ExpenseSummary() {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    const monthKey = today.getFullYear() * 100 + (today.getMonth() + 1)

    Promise.all([
      budgetRepo.getByMonth(monthKey),
      expenseRepo.getByMonth(monthKey),
    ])
      .then(([b, e]) => {
        setBudget(b)
        setExpenses(e)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20" />
        </CardContent>
      </Card>
    )
  }

  const today = new Date()
  const todayStr = getDateString(today)
  const monthSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const todayExpenses = expenses.filter((e) => getDateString(new Date(e.date)) === todayStr)
  const todaySpent = todayExpenses.reduce((s, e) => s + e.amount, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">Chi tiêu</CardTitle>
        <Link to="/expenses" className="text-xs text-blue-600 hover:underline">Chi tiết →</Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {!budget ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            <Link to="/expenses" className="text-blue-600 hover:underline">Thiết lập ngân sách →</Link>
          </p>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Tháng</span>
                <span>{formatVND(monthSpent)} / {formatVND(budget.totalBudget)}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getColorClass(budget.totalBudget - monthSpent, budget.totalBudget)}`}
                  style={{ width: `${Math.min((monthSpent / budget.totalBudget) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Hôm nay</span>
                <span>{formatVND(todaySpent)}</span>
              </div>
            </div>
            {todayExpenses.length > 0 && (
              <div className="space-y-1">
                {todayExpenses.slice(0, 3).map((e) => (
                  <div key={e.id} className="flex justify-between text-xs text-muted-foreground">
                    <span className="truncate">{e.description || e.category}</span>
                    <span>{formatVND(e.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

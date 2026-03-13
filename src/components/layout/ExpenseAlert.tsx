import { useEffect, useState, useCallback } from "react"
import { useLocation } from "react-router-dom"
import { AlertTriangle } from "lucide-react"
import { budgetRepo } from "@/db/repositories/budget-repo"
import { expenseRepo } from "@/db/repositories/expense-repo"
import { useAppResume } from "@/lib/useAppResume"

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ"
}

function getDateString(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function ExpenseAlert() {
  const { pathname } = useLocation()
  const [overAmount, setOverAmount] = useState<number | null>(null)
  const [dismissed, setDismissed] = useState(false)

  const check = useCallback(async () => {
    try {
      const today = new Date()
      const monthKey = today.getFullYear() * 100 + (today.getMonth() + 1)
      const todayStr = getDateString(today)
      const todayIndex = today.getDate() - 1

      const [budget, expenses] = await Promise.all([
        budgetRepo.getByMonth(monthKey),
        expenseRepo.getByMonth(monthKey),
      ])

      if (!budget) { setOverAmount(null); return }

      const allowances = budget.dailyAllowances as number[]

      // Cumulative allowance up to today
      let cumulativeAllowance = 0
      for (let i = 0; i <= todayIndex; i++) {
        cumulativeAllowance += allowances[i] || 0
      }

      // Expenses before today
      const beforeTodaySpent = expenses
        .filter((e) => getDateString(new Date(e.date)) < todayStr)
        .reduce((s, e) => s + e.amount, 0)

      const todayBudget = cumulativeAllowance - beforeTodaySpent
      const todaySpent = expenses
        .filter((e) => getDateString(new Date(e.date)) === todayStr)
        .reduce((s, e) => s + e.amount, 0)

      if (todaySpent > todayBudget && todayBudget > 0) {
        setOverAmount(todaySpent - todayBudget)
        setDismissed(false)
      } else {
        setOverAmount(null)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => { check() }, [check, pathname])
  useAppResume(check)

  // Also recheck every 30s in case user added expense from another flow
  useEffect(() => {
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [check])

  // Chỉ hiển thị ngoài trang chi tiêu
  if (!overAmount || dismissed || pathname.startsWith("/expenses")) return null

  return (
    <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-800">Vượt ngân sách hôm nay!</p>
        <p className="text-xs text-red-600 mt-0.5">
          Bạn đã chi vượt <strong>{formatVND(overAmount)}</strong> so với ngân sách cho hôm nay.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-red-400 hover:text-red-600 text-lg leading-none px-1"
      >
        ×
      </button>
    </div>
  )
}

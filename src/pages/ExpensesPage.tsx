import { useEffect, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, CalendarDays, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ExpenseSummaryCard } from "@/components/expenses/ExpenseSummaryCard"
import { BudgetSetupForm } from "@/components/expenses/BudgetSetupForm"
import { ExpenseQuickAdd } from "@/components/expenses/ExpenseQuickAdd"
import { ExpenseList } from "@/components/expenses/ExpenseList"
import { MonthStats } from "@/components/expenses/MonthStats"
import { budgetRepo } from "@/db/repositories/budget-repo"
import { expenseRepo } from "@/db/repositories/expense-repo"
import type { Budget, Expense } from "@/types"

function getMonthKey(date: Date) {
  return date.getFullYear() * 100 + (date.getMonth() + 1)
}

function getDaysInMonth(monthKey: number) {
  const year = Math.floor(monthKey / 100)
  const month = monthKey % 100
  return new Date(year, month, 0).getDate()
}

function formatMonth(monthKey: number) {
  const month = monthKey % 100
  const year = Math.floor(monthKey / 100)
  return `T${month}/${year}`
}

function getDateString(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export default function ExpensesPage() {
  const [today] = useState(() => new Date())
  const [monthKey, setMonthKey] = useState(() => getMonthKey(new Date()))
  const [budget, setBudget] = useState<Budget | null>(null)
  const [monthExpenses, setMonthExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showSetup, setShowSetup] = useState(false)

  const isCurrentMonth = monthKey === getMonthKey(today)
  const todayIndex = isCurrentMonth ? today.getDate() - 1 : 0
  const todayStr = getDateString(today)
  const daysInMonth = getDaysInMonth(monthKey)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [budgetData, expensesData] = await Promise.all([
        budgetRepo.getByMonth(monthKey),
        expenseRepo.getByMonth(monthKey),
      ])
      setBudget(budgetData)
      setMonthExpenses(Array.isArray(expensesData) ? expensesData : [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [monthKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function prevMonth() {
    const m = monthKey % 100
    const y = Math.floor(monthKey / 100)
    setMonthKey(m === 1 ? (y - 1) * 100 + 12 : y * 100 + (m - 1))
  }

  function nextMonth() {
    const m = monthKey % 100
    const y = Math.floor(monthKey / 100)
    setMonthKey(m === 12 ? (y + 1) * 100 + 1 : y * 100 + (m + 1))
  }

  const monthSpent = monthExpenses.reduce((s, e) => s + e.amount, 0)
  const todayExpenses = monthExpenses.filter((e) => {
    const d = new Date(e.date)
    return getDateString(d) === todayStr
  })
  const todaySpent = todayExpenses.reduce((s, e) => s + e.amount, 0)

  let todayAllowance = 0
  if (budget && isCurrentMonth) {
    const allowances = budget.dailyAllowances as number[]
    let cumulativeAllowance = 0
    for (let i = 0; i <= todayIndex; i++) {
      cumulativeAllowance += allowances[i] || 0
    }
    const beforeTodayExpenses = monthExpenses.filter((e) => {
      const d = new Date(e.date)
      return getDateString(d) < todayStr
    })
    const cumulativeSpent = beforeTodayExpenses.reduce((s, e) => s + e.amount, 0)
    todayAllowance = cumulativeAllowance - cumulativeSpent
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-24" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Chi tiêu
        </h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[80px] text-center">{formatMonth(monthKey)}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {budget && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ExpenseSummaryCard
            title="Ngân sách tháng"
            total={budget.totalBudget}
            spent={monthSpent}
            icon={<CalendarDays className="h-4 w-4" />}
          />
          {isCurrentMonth && (
            <ExpenseSummaryCard
              title={`Ngân sách hôm nay (${today.getDate()}/${today.getMonth() + 1})`}
              total={todayAllowance > 0 ? todayAllowance : 0}
              spent={todaySpent}
            />
          )}
        </div>
      )}

      {!budget && !showSetup && (
        <div className="border rounded-lg p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Chưa thiết lập ngân sách cho {formatMonth(monthKey)}</p>
          <Button onClick={() => setShowSetup(true)}>Thiết lập ngân sách</Button>
        </div>
      )}

      {(showSetup || (budget && showSetup)) && (
        <BudgetSetupForm
          month={monthKey}
          daysInMonth={daysInMonth}
          existingBudget={budget}
          onSaved={() => { setShowSetup(false); fetchData() }}
        />
      )}

      {budget && !showSetup && (
        <Button variant="outline" size="sm" onClick={() => setShowSetup(true)}>
          Chỉnh sửa ngân sách
        </Button>
      )}

      {isCurrentMonth && (
        <ExpenseQuickAdd date={todayStr} onAdded={fetchData} />
      )}

      {isCurrentMonth && (
        <ExpenseList expenses={todayExpenses} onChanged={fetchData} />
      )}

      <MonthStats expenses={monthExpenses} />
    </div>
  )
}

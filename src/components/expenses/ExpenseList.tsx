import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Pencil, Check, X } from "lucide-react"
import { toast } from "sonner"
import { EXPENSE_CATEGORIES } from "@/types"
import type { Expense } from "@/types"
import { expenseRepo } from "@/db/repositories/expense-repo"

interface ExpenseListProps {
  expenses: Expense[]
  onChanged: () => void
}

function getCategoryLabel(value: string) {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)?.label || value
}

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ"
}

export function ExpenseList({ expenses, onChanged }: ExpenseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState("")
  const [editDesc, setEditDesc] = useState("")

  async function handleDelete(id: string) {
    try {
      await expenseRepo.delete(id)
      toast.success("Đã xóa")
      onChanged()
    } catch {
      toast.error("Lỗi khi xóa")
    }
  }

  function startEdit(expense: Expense) {
    setEditingId(expense.id)
    setEditAmount(expense.amount.toString())
    setEditDesc(expense.description || "")
  }

  async function saveEdit(id: string) {
    try {
      await expenseRepo.update(id, {
        amount: parseFloat(editAmount),
        description: editDesc,
      })
      toast.success("Đã cập nhật")
      setEditingId(null)
      onChanged()
    } catch {
      toast.error("Lỗi khi cập nhật")
    }
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            Chi tiêu hôm nay ({expenses.length})
          </CardTitle>
          {expenses.length > 0 && (
            <span className="text-sm font-semibold text-gray-700">{formatVND(total)}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Chưa có khoản chi nào hôm nay</p>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center gap-2 p-2 rounded-md border text-sm">
                {editingId === expense.id ? (
                  <>
                    <Input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="h-7 w-28 text-xs"
                    />
                    <Input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="h-7 flex-1 text-xs"
                      placeholder="Mô tả"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveEdit(expense.id)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {getCategoryLabel(expense.category)}
                    </span>
                    <span className="flex-1 truncate text-gray-600">{expense.description || "—"}</span>
                    <span className="font-semibold whitespace-nowrap">{formatVND(expense.amount)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(expense)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDelete(expense.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

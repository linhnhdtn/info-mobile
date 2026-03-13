import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { EXPENSE_CATEGORIES } from "@/types"
import { expenseRepo } from "@/db/repositories/expense-repo"

interface ExpenseQuickAddProps {
  date: string
  onAdded: () => void
}

export function ExpenseQuickAdd({ date, onAdded }: ExpenseQuickAddProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("food")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Vui lòng nhập số tiền")
      return
    }

    setSaving(true)
    try {
      await expenseRepo.create({
        amount: parseFloat(amount),
        description,
        category,
        date,
      })
      toast.success("Đã thêm chi tiêu")
      setAmount("")
      setDescription("")
      setCategory("food")
      onAdded()
    } catch {
      toast.error("Lỗi khi thêm chi tiêu")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Thêm chi tiêu nhanh</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <Input
            type="number"
            placeholder="Số tiền"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="sm:w-36"
          />
          <Input
            placeholder="Mô tả (tùy chọn)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="sm:flex-1"
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={saving} className="shrink-0">
            <Plus className="h-4 w-4 mr-1" />
            Thêm
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

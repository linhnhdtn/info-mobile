import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoneyInput } from "@/components/ui/money-input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { budgetRepo } from "@/db/repositories/budget-repo"

interface BudgetSetupFormProps {
  month: number
  daysInMonth: number
  existingBudget?: {
    totalBudget: number
    dailyAllowances: number[]
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ"
}

export function BudgetSetupForm({ month, daysInMonth, existingBudget, open, onOpenChange, onSaved }: BudgetSetupFormProps) {
  const [totalBudget, setTotalBudget] = useState(existingBudget?.totalBudget?.toString() || "")
  const [mode, setMode] = useState<"even" | "custom">("even")
  const [dailyAllowances, setDailyAllowances] = useState<number[]>(
    existingBudget?.dailyAllowances || Array(daysInMonth).fill(0)
  )
  const [saving, setSaving] = useState(false)
  const [showCustom, setShowCustom] = useState(false)

  const total = parseFloat(totalBudget) || 0
  const evenDaily = total > 0 ? Math.floor(total / daysInMonth) : 0

  function distributeEvenly() {
    const daily = Math.floor(total / daysInMonth)
    const remainder = total - daily * daysInMonth
    const arr = Array(daysInMonth).fill(daily) as number[]
    arr[daysInMonth - 1] += remainder
    setDailyAllowances(arr)
  }

  function handleDayChange(index: number, value: string) {
    const arr = [...dailyAllowances]
    arr[index] = parseFloat(value) || 0
    setDailyAllowances(arr)
  }

  async function handleSave() {
    if (total <= 0) {
      toast.error("Vui lòng nhập tổng ngân sách")
      return
    }

    const allowances = mode === "even"
      ? (() => {
          const daily = Math.floor(total / daysInMonth)
          const remainder = total - daily * daysInMonth
          const arr = Array(daysInMonth).fill(daily) as number[]
          arr[daysInMonth - 1] += remainder
          return arr
        })()
      : dailyAllowances

    setSaving(true)
    try {
      await budgetRepo.upsert({ month, totalBudget: total, dailyAllowances: allowances })
      toast.success("Đã lưu ngân sách")
      onSaved()
    } catch {
      toast.error("Lỗi khi lưu ngân sách")
    } finally {
      setSaving(false)
    }
  }

  const year = Math.floor(month / 100)
  const m = month % 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            {existingBudget ? "Chỉnh sửa ngân sách" : "Thiết lập ngân sách"} tháng {m}/{year}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Tổng ngân sách (VNĐ)</label>
              <MoneyInput
                placeholder="VD: 10.000.000"
                value={totalBudget}
                onChange={setTotalBudget}
              />
            </div>
            {total > 0 && (
              <p className="text-xs text-muted-foreground pb-2 whitespace-nowrap">
                ≈ {formatVND(evenDaily)}/ngày
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant={mode === "even" ? "default" : "outline"}
              size="sm"
              onClick={() => { setMode("even"); setShowCustom(false) }}
            >
              Chia đều
            </Button>
            <Button
              variant={mode === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setMode("custom")
                if (dailyAllowances.every(v => v === 0)) distributeEvenly()
                setShowCustom(true)
              }}
            >
              Tùy chỉnh
            </Button>
          </div>

          {showCustom && mode === "custom" && (
            <div className="grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto">
              {dailyAllowances.map((val, i) => (
                <div key={i} className="text-center">
                  <label className="text-xs text-muted-foreground">{i + 1}</label>
                  <MoneyInput
                    className="h-8 text-xs px-1 text-center"
                    value={val ? val.toString() : ""}
                    onChange={(v) => handleDayChange(i, v)}
                  />
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Đang lưu..." : "Lưu ngân sách"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

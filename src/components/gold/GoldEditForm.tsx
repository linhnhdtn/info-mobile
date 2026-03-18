import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoneyInput } from "@/components/ui/money-input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { goldRepo } from "@/db/repositories/gold-repo"
import type { GoldHolding } from "@/types"
import { toast } from "sonner"

interface GoldEditFormProps {
  holding: GoldHolding
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function GoldEditForm({ holding, open, onOpenChange, onSaved }: GoldEditFormProps) {
  const [quantity, setQuantity] = useState(holding.quantity.toString())
  const [buyPrice, setBuyPrice] = useState(holding.buyPrice.toString())
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!quantity || parseFloat(quantity) <= 0) { toast.error("Vui lòng nhập số chỉ"); return }
    if (!buyPrice || parseFloat(buyPrice) <= 0) { toast.error("Vui lòng nhập giá mua"); return }

    setSaving(true)
    try {
      await goldRepo.update(holding.id, {
        quantity: parseFloat(quantity),
        buyPrice: parseFloat(buyPrice),
      })
      toast.success("Đã cập nhật")
      onOpenChange(false)
      onSaved()
    } catch {
      toast.error("Lỗi khi cập nhật")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sửa {holding.goldTypeName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Số chỉ</Label>
            <Input type="number" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Giá mua (VNĐ/chỉ)</Label>
            <MoneyInput value={buyPrice} onChange={setBuyPrice} />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Đang lưu..." : "Cập nhật"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

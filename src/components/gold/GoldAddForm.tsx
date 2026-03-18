import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoneyInput } from "@/components/ui/money-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { goldRepo } from "@/db/repositories/gold-repo"
import { POPULAR_GOLD_TYPES } from "@/lib/gold"
import { toast } from "sonner"

interface GoldAddFormProps {
  onAdded: () => void
}

export function GoldAddForm({ onAdded }: GoldAddFormProps) {
  const [open, setOpen] = useState(false)
  const [goldType, setGoldType] = useState("")
  const [quantity, setQuantity] = useState("")
  const [buyPrice, setBuyPrice] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!goldType) { toast.error("Vui lòng chọn loại vàng"); return }
    if (!quantity || parseFloat(quantity) <= 0) { toast.error("Vui lòng nhập số chỉ"); return }
    if (!buyPrice || parseFloat(buyPrice) <= 0) { toast.error("Vui lòng nhập giá mua"); return }

    const selected = POPULAR_GOLD_TYPES.find((g) => g.code === goldType)
    if (!selected) { toast.error("Loại vàng không hợp lệ"); return }

    setSaving(true)
    try {
      await goldRepo.create({
        goldType: selected.code,
        goldTypeName: selected.name,
        quantity: parseFloat(quantity),
        buyPrice: parseFloat(buyPrice),
      })
      toast.success("Đã thêm vàng")
      setGoldType("")
      setQuantity("")
      setBuyPrice("")
      setOpen(false)
      onAdded()
    } catch {
      toast.error("Lỗi khi thêm vàng")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Thêm
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm vàng đang giữ</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Loại vàng</Label>
            <Select value={goldType} onValueChange={setGoldType}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại vàng" />
              </SelectTrigger>
              <SelectContent>
                {POPULAR_GOLD_TYPES.map((g) => (
                  <SelectItem key={g.code} value={g.code}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Số chỉ</Label>
            <Input type="number" step="0.01" placeholder="VD: 1.5" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Giá mua (VNĐ/chỉ)</Label>
            <MoneyInput placeholder="VD: 8.500.000" value={buyPrice} onChange={setBuyPrice} />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Đang lưu..." : "Thêm"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

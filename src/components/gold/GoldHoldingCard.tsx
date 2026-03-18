import { useState } from "react"
import { Trash2, Pencil } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatVND, CHI_PER_LUONG, type GoldPrices } from "@/lib/gold"
import { GoldEditForm } from "./GoldEditForm"
import type { GoldHolding } from "@/types"
import { cn } from "@/lib/utils"

interface GoldHoldingCardProps {
  holding: GoldHolding
  prices: GoldPrices | null
  onDelete: (id: string) => void
  onEdited: () => void
}

export function GoldHoldingCard({ holding, prices, onDelete, onEdited }: GoldHoldingCardProps) {
  const [editOpen, setEditOpen] = useState(false)

  const sellPerLuong = prices?.[holding.goldType]?.sell ?? 0
  const currentPricePerChi = sellPerLuong / CHI_PER_LUONG
  const invested = holding.quantity * holding.buyPrice
  const currentValue = holding.quantity * currentPricePerChi
  const profitLoss = currentPricePerChi > 0 ? currentValue - invested : 0
  const profitPercent = invested > 0 && currentPricePerChi > 0 ? (profitLoss / invested) * 100 : 0
  const isProfit = profitLoss >= 0

  return (
    <>
      <Card>
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{holding.goldTypeName}</h3>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-blue-500" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500" onClick={() => onDelete(holding.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Đang giữ</p>
              <p className="font-medium">{holding.quantity} chỉ</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Vốn đầu tư</p>
              <p className="font-medium">{formatVND(invested)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Giá mua TB</p>
              <p className="font-medium">{formatVND(holding.buyPrice)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Giá hiện tại</p>
              <p className="font-medium">{currentPricePerChi > 0 ? formatVND(currentPricePerChi) : "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Giá trị hiện tại</p>
              <p className="font-medium">{currentPricePerChi > 0 ? formatVND(currentValue) : "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Lãi / Lỗ</p>
              <p className={cn("font-medium", currentPricePerChi > 0 ? (isProfit ? "text-emerald-600" : "text-red-600") : "")}>
                {currentPricePerChi > 0 ? `${isProfit ? "+" : ""}${profitPercent.toFixed(2)}%` : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <GoldEditForm holding={holding} open={editOpen} onOpenChange={setEditOpen} onSaved={onEdited} />
    </>
  )
}

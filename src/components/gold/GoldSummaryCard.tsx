import { Card, CardContent } from "@/components/ui/card"
import { formatVND } from "@/lib/gold"
import { cn } from "@/lib/utils"

interface GoldSummaryCardProps {
  totalInvested: number
  totalCurrentValue: number
}

export function GoldSummaryCard({ totalInvested, totalCurrentValue }: GoldSummaryCardProps) {
  const profitLoss = totalCurrentValue - totalInvested
  const profitPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0
  const isProfit = profitLoss >= 0

  return (
    <Card className="bg-gray-900 text-white border-0">
      <CardContent className="pt-6 space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-400">Lãi / Lỗ</p>
          <p className={cn("text-3xl font-bold mt-1", isProfit ? "text-emerald-400" : "text-red-400")}>
            {isProfit ? "+" : ""}{formatVND(profitLoss)}
          </p>
          <p className={cn("text-sm font-medium mt-0.5", isProfit ? "text-emerald-400" : "text-red-400")}>
            {isProfit ? "+" : ""}{profitPercent.toFixed(2)}%
          </p>
        </div>

        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-400">Vốn đầu tư</p>
            <p className="font-semibold text-white">{formatVND(totalInvested)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400">Giá trị hiện tại</p>
            <p className="font-semibold text-white">{formatVND(totalCurrentValue)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

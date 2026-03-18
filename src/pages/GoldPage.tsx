import { useState, useEffect, useCallback } from "react"
import { Coins, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { GoldSummaryCard } from "@/components/gold/GoldSummaryCard"
import { GoldHoldingCard } from "@/components/gold/GoldHoldingCard"
import { GoldAddForm } from "@/components/gold/GoldAddForm"
import { goldRepo } from "@/db/repositories/gold-repo"
import { fetchGoldPrices, CHI_PER_LUONG, type GoldPrices } from "@/lib/gold"
import type { GoldHolding } from "@/types"
import { useAppResume } from "@/lib/useAppResume"
import { toast } from "sonner"

export default function GoldPage() {
  const [holdings, setHoldings] = useState<GoldHolding[]>([])
  const [prices, setPrices] = useState<GoldPrices | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [h, p] = await Promise.all([goldRepo.getAll(), fetchGoldPrices()])
      setHoldings(h)
      setPrices(p)
    } catch {
      toast.error("Không thể tải dữ liệu")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])
  useAppResume(() => { loadData() })

  async function handleRefresh() {
    setRefreshing(true)
    localStorage.removeItem("gold-prices")
    await loadData()
  }

  async function handleDelete(id: string) {
    try {
      await goldRepo.delete(id)
      setHoldings((prev) => prev.filter((h) => h.id !== id))
      toast.success("Đã xóa")
    } catch {
      toast.error("Lỗi khi xóa")
    }
  }

  const totalInvested = holdings.reduce((s, h) => s + h.quantity * h.buyPrice, 0)
  const totalCurrentValue = prices
    ? holdings.reduce((s, h) => {
        const sellPerLuong = prices[h.goldType]?.sell ?? 0
        return s + h.quantity * (sellPerLuong / CHI_PER_LUONG)
      }, 0)
    : 0

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Coins className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">Sổ Vàng</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <GoldAddForm onAdded={loadData} />
        </div>
      </div>

      {holdings.length > 0 && prices && (
        <GoldSummaryCard totalInvested={totalInvested} totalCurrentValue={totalCurrentValue} />
      )}

      {holdings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Coins className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có vàng nào. Nhấn "Thêm" để bắt đầu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {holdings.map((h) => (
            <GoldHoldingCard key={h.id} holding={h} prices={prices} onDelete={handleDelete} onEdited={loadData} />
          ))}
        </div>
      )}
    </div>
  )
}

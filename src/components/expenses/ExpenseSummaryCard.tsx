import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ExpenseSummaryCardProps {
  title: string
  total: number
  spent: number
  icon?: React.ReactNode
}

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ"
}

function getColorClass(remaining: number, total: number) {
  if (total <= 0) return "bg-gray-200"
  const ratio = remaining / total
  if (ratio > 0.5) return "bg-emerald-500"
  if (ratio > 0.2) return "bg-amber-500"
  return "bg-red-500"
}

function getTextColor(remaining: number, total: number) {
  if (total <= 0) return "text-gray-500"
  const ratio = remaining / total
  if (ratio > 0.5) return "text-emerald-600"
  if (ratio > 0.2) return "text-amber-600"
  return "text-red-600"
}

export function ExpenseSummaryCard({ title, total, spent, icon }: ExpenseSummaryCardProps) {
  const remaining = total - spent
  const percent = total > 0 ? Math.min((spent / total) * 100, 100) : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hạn mức</span>
            <span className="font-medium">{formatVND(total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Đã tiêu</span>
            <span className="font-medium">{formatVND(spent)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Còn lại</span>
            <span className={`font-semibold ${getTextColor(remaining, total)}`}>
              {formatVND(remaining)}
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getColorClass(remaining, total)}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">{percent.toFixed(0)}% đã sử dụng</p>
        </div>
      </CardContent>
    </Card>
  )
}

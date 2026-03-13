import { YearlyTable } from "@/components/expenses/YearlyTable"

export default function ExpensesOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Tổng quan chi tiêu</h2>
        <p className="text-sm text-muted-foreground mt-1">Bảng tổng hợp chi tiêu theo từng tháng trong năm</p>
      </div>
      <YearlyTable />
    </div>
  )
}

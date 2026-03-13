import { CalendarView } from "@/components/schedule/CalendarView"

export default function SchedulePage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Lịch trình</h2>
      <CalendarView />
    </div>
  )
}

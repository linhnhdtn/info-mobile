import { DashboardWeather } from "@/components/dashboard/DashboardWeather"
import { DateTimeCard } from "@/components/dashboard/DateTimeCard"
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents"
import { RecentNotes } from "@/components/dashboard/RecentNotes"
import { ExpenseSummary } from "@/components/dashboard/ExpenseSummary"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardWeather />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DateTimeCard />
        <ExpenseSummary />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingEvents />
        <RecentNotes />
      </div>
    </div>
  )
}

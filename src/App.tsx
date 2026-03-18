import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import SchedulePage from './pages/SchedulePage'
import NotesPage from './pages/NotesPage'
import ProfilePage from './pages/ProfilePage'
import ExpensesPage from './pages/ExpensesPage'
import ExpensesOverviewPage from './pages/ExpensesOverviewPage'
import WeatherPage from './pages/WeatherPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/expenses/overview" element={<ExpensesOverviewPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

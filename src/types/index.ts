export interface UserProfile {
  id: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  country: string | null
  birthday: string | null
  avatarUrl: string | null
  bio: string | null
}

export interface WorkInfo {
  id: string
  company: string | null
  position: string | null
  department: string | null
  employeeId: string | null
  workEmail: string | null
  workPhone: string | null
  workAddress: string | null
  startDate: string | null
  endDate: string | null
  salary: string | null
  notes: string | null
}

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  start: string
  end: string | null
  allDay: boolean
  location: string | null
  color: string
  reminderAt: string | null
  isRepeating: boolean
  rrule?: string
}

export interface Note {
  id: string
  title: string | null
  content: string
  color: string
  isPinned: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

export const NOTE_COLORS = [
  { label: "White", value: "#FFFFFF" },
  { label: "Yellow", value: "#FEF9C3" },
  { label: "Green", value: "#DCFCE7" },
  { label: "Blue", value: "#DBEAFE" },
  { label: "Pink", value: "#FCE7F3" },
  { label: "Purple", value: "#EDE9FE" },
  { label: "Orange", value: "#FFEDD5" },
]

export const EVENT_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
]

export interface Budget {
  id: string
  month: number
  totalBudget: number
  dailyAllowances: number[]
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: string
  amount: number
  description: string | null
  category: string
  date: string
  createdAt: string
  updatedAt: string
}

export const EXPENSE_CATEGORIES = [
  { label: "Ăn uống", value: "food" },
  { label: "Di chuyển", value: "transport" },
  { label: "Mua sắm", value: "shopping" },
  { label: "Giải trí", value: "entertainment" },
  { label: "Hóa đơn", value: "bills" },
  { label: "Khác", value: "other" },
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["value"]

export interface GoldHolding {
  id: string
  goldType: string
  goldTypeName: string
  quantity: number
  buyPrice: number
  createdAt: string
}

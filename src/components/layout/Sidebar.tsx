import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import {
  LayoutDashboard,
  User,
  CalendarDays,
  StickyNote,
  Wallet,
  ChevronDown,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavChild {
  href: string
  label: string
}

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  children?: NavChild[]
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Hồ sơ", icon: User },
  { href: "/schedule", label: "Lịch trình", icon: CalendarDays },
  { href: "/notes", label: "Ghi chú", icon: StickyNote },
  {
    href: "/expenses",
    label: "Chi tiêu",
    icon: Wallet,
    children: [
      { href: "/expenses", label: "Hàng ngày" },
      { href: "/expenses/overview", label: "Tổng quan" },
    ],
  },
]

export function Sidebar() {
  const { pathname } = useLocation()
  const [expanded, setExpanded] = useState<string | null>(() => {
    const parent = navItems.find(
      (item) => item.children && (pathname === item.href || pathname.startsWith(item.href + "/"))
    )
    return parent?.href ?? null
  })

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-r bg-white">
      <div className="px-6 py-5 border-b">
        <h1 className="text-lg font-bold text-gray-900">Cá nhân</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Quản lý thông tin</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          if (item.children) {
            const isExpanded = expanded === item.href
            return (
              <div key={item.href}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : item.href)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="ml-7 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href
                      return (
                        <Link
                          key={child.href}
                          to={child.href}
                          className={cn(
                            "block px-3 py-1.5 rounded-md text-sm transition-colors",
                            childActive
                              ? "text-gray-900 font-medium bg-gray-50"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                          )}
                        >
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

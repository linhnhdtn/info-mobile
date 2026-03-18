import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import {
  Menu,
  LayoutDashboard,
  User,
  CalendarDays,
  StickyNote,
  CloudSun,
  Wallet,
  Coins,
  ChevronDown,
  type LucideIcon,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
  { href: "/weather", label: "Thời tiết", icon: CloudSun },
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
  { href: "/gold", label: "Sổ vàng", icon: Coins },
]

export function MobileNav() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(() => {
    const parent = navItems.find(
      (item) => item.children && (pathname === item.href || pathname.startsWith(item.href + "/"))
    )
    return parent?.href ?? null
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden h-14 w-14">
          <Menu className="h-10 w-10" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-56 p-0">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle>Cá nhân</SheetTitle>
        </SheetHeader>
        <nav className="p-3 space-y-1">
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
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium transition-colors w-full",
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-5 w-5" />
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
                            onClick={() => setOpen(false)}
                            className={cn(
                              "block px-3 py-2 rounded-md text-base transition-colors",
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
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium transition-colors",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

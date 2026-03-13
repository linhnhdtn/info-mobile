import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { MobileNav } from "./MobileNav"
import { profileRepo } from "@/db/repositories/profile-repo"
import type { UserProfile } from "@/types"

export function Topbar() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isHome = pathname === "/dashboard"

  useEffect(() => {
    profileRepo.get().then(setProfile).catch(() => {})
  }, [])

  const displayName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Admin"
    : "Admin"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <header className="border-b bg-white">
      <div className="h-[env(safe-area-inset-top)]" />
      <div className="h-12 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-1">
          <MobileNav />
          {!isHome && (
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium hidden sm:block">{displayName}</span>
          <Avatar className="h-8 w-8">
            {profile?.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={displayName} />}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileNav } from "./MobileNav"
import { profileRepo } from "@/db/repositories/profile-repo"
import type { UserProfile } from "@/types"

export function Topbar() {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    profileRepo.get().then(setProfile).catch(() => {})
  }, [])

  const displayName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Admin"
    : "Admin"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4 md:px-6">
      <MobileNav />
      <div className="hidden md:block" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium hidden sm:block">{displayName}</span>
        <Avatar className="h-8 w-8">
          {profile?.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={displayName} />}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

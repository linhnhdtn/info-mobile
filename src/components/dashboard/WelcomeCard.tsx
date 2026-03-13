import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { profileRepo } from "@/db/repositories/profile-repo"
import type { UserProfile } from "@/types"

interface AqiData {
  aqi: number
  level: string
  color: string
  pollutants: {
    pm25: number | null
    pm10: number | null
    o3: number | null
  }
}

function getAqiLevel(aqi: number): { level: string; color: string } {
  if (aqi <= 50) return { level: "Tốt", color: "#009966" }
  if (aqi <= 100) return { level: "Trung bình", color: "#FFDE33" }
  if (aqi <= 150) return { level: "Không lành mạnh cho nhóm nhạy cảm", color: "#FF9933" }
  if (aqi <= 200) return { level: "Không lành mạnh", color: "#CC0033" }
  if (aqi <= 300) return { level: "Rất không lành mạnh", color: "#660099" }
  return { level: "Nguy hiểm", color: "#7E0023" }
}

export function WelcomeCard() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [aqi, setAqi] = useState<AqiData | null>(null)
  const [aqiLoading, setAqiLoading] = useState(true)

  useEffect(() => {
    profileRepo.get()
      .then((data) => { setProfile(data); setLoading(false) })
      .catch(() => setLoading(false))

    // Fetch AQI when online
    if (navigator.onLine) {
      fetch("https://api.waqi.info/feed/hanoi/?token=demo")
        .then((r) => r.json())
        .then((data) => {
          if (data.status === "ok" && data.data) {
            const d = data.data
            const { level, color } = getAqiLevel(d.aqi)
            setAqi({
              aqi: d.aqi,
              level,
              color,
              pollutants: {
                pm25: d.iaqi?.pm25?.v ?? null,
                pm10: d.iaqi?.pm10?.v ?? null,
                o3: d.iaqi?.o3?.v ?? null,
              },
            })
          }
          setAqiLoading(false)
        })
        .catch(() => setAqiLoading(false))
    } else {
      setAqiLoading(false)
    }
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối"
  const displayName = profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") : null

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-4">
          {loading ? (
            <Skeleton className="h-16 w-16 rounded-full bg-white/30" />
          ) : (
            <Avatar className="h-16 w-16 border-2 border-white/50">
              {profile?.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="avatar" />}
              <AvatarFallback className="bg-white/20 text-white text-xl">
                {displayName ? displayName.slice(0, 2).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            {loading ? (
              <Skeleton className="h-7 w-48 bg-white/30 mb-1" />
            ) : (
              <h2 className="text-xl font-bold">
                {greeting}{displayName ? `, ${displayName}!` : "!"}
              </h2>
            )}
          </div>
        </div>

        {aqiLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full bg-white/30" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-white/30" />
              <Skeleton className="h-3 w-24 bg-white/30" />
            </div>
          </div>
        ) : aqi ? (
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
              style={{ backgroundColor: aqi.color }}
            >
              {aqi.aqi}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/80">Không khí Hà Nội</p>
              <p className="font-semibold">{aqi.level}</p>
              <div className="flex gap-3 mt-1 text-xs text-white/70">
                {aqi.pollutants.pm25 != null && <span>PM2.5: {aqi.pollutants.pm25}</span>}
                {aqi.pollutants.pm10 != null && <span>PM10: {aqi.pollutants.pm10}</span>}
                {aqi.pollutants.o3 != null && <span>O3: {aqi.pollutants.o3}</span>}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

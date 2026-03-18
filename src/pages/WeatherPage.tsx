import { useState, useEffect, useCallback } from "react"
import { CloudSun } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { CitySelector } from "@/components/weather/CitySelector"
import { CurrentWeather } from "@/components/weather/CurrentWeather"
import { WeatherForecast } from "@/components/weather/WeatherForecast"
import { fetchWeather, type WeatherData } from "@/lib/weather"
import { DEFAULT_CITY, vietnamCities, type City } from "@/data/vietnam-cities"
import { useAppResume } from "@/lib/useAppResume"

const STORAGE_KEY_CITY = "weather-city"
const STORAGE_KEY_DATA = "weather-data"
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

function loadCity(): City {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CITY)
    if (saved) {
      const parsed = JSON.parse(saved)
      const found = vietnamCities.find((c) => c.name === parsed.name)
      if (found) return found
    }
  } catch {}
  return DEFAULT_CITY
}

function loadCachedData(cityName: string): WeatherData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DATA)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.cityName === cityName && Date.now() - parsed.data.fetchedAt < CACHE_DURATION) {
        return parsed.data
      }
    }
  } catch {}
  return null
}

export default function WeatherPage() {
  const [city, setCity] = useState<City>(loadCity)
  const [weather, setWeather] = useState<WeatherData | null>(() => loadCachedData(city.name))
  const [loading, setLoading] = useState(!weather)
  const [error, setError] = useState<string | null>(null)

  const loadWeather = useCallback(async (targetCity: City, force = false) => {
    if (!force) {
      const cached = loadCachedData(targetCity.name)
      if (cached) {
        setWeather(cached)
        setLoading(false)
        return
      }
    }

    setLoading(true)
    setError(null)
    try {
      const data = await fetchWeather(targetCity.lat, targetCity.lon)
      setWeather(data)
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify({ cityName: targetCity.name, data }))
    } catch {
      setError("Không thể tải dữ liệu thời tiết. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWeather(city)
  }, [city, loadWeather])

  useAppResume(() => loadWeather(city, true))

  const handleCityChange = (newCity: City) => {
    setCity(newCity)
    localStorage.setItem(STORAGE_KEY_CITY, JSON.stringify(newCity))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CloudSun className="h-6 w-6 text-sky-500" />
          <h2 className="text-2xl font-bold text-gray-900">Thời tiết</h2>
        </div>
        <CitySelector value={city} onChange={handleCityChange} />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && !weather ? (
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : weather ? (
        <div className="space-y-4">
          <CurrentWeather data={weather.current} />
          <WeatherForecast data={weather.daily} />
        </div>
      ) : null}
    </div>
  )
}

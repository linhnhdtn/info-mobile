import { useEffect, useState, useCallback } from "react"
import { MapPin, Droplets, Wind, Haze } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchWeather, getWeatherDescription, getWeatherIcon, type WeatherData } from "@/lib/weather"
import { DEFAULT_CITY, vietnamCities, type City } from "@/data/vietnam-cities"
import { Link } from "react-router-dom"

const STORAGE_KEY_CITY = "weather-city"
const STORAGE_KEY_DATA = "weather-data"
const STORAGE_KEY_AQI = "weather-aqi"
const CACHE_DURATION = 10 * 60 * 1000

interface AirQualityData {
  aqi: number
  pm25: number
  pm10: number
  fetchedAt: number
}

async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: "european_aqi,pm2_5,pm10",
  })
  const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`)
  if (!res.ok) throw new Error("Không thể tải dữ liệu chất lượng không khí")
  const data = await res.json()
  return {
    aqi: data.current.european_aqi,
    pm25: data.current.pm2_5,
    pm10: data.current.pm10,
    fetchedAt: Date.now(),
  }
}

function getAqiLabel(aqi: number): string {
  if (aqi <= 20) return "Tốt"
  if (aqi <= 40) return "Khá"
  if (aqi <= 60) return "Trung bình"
  if (aqi <= 80) return "Kém"
  if (aqi <= 100) return "Xấu"
  return "Rất xấu"
}

function getAqiColor(aqi: number): string {
  if (aqi <= 20) return "text-green-300"
  if (aqi <= 40) return "text-lime-300"
  if (aqi <= 60) return "text-yellow-300"
  if (aqi <= 80) return "text-orange-300"
  if (aqi <= 100) return "text-red-300"
  return "text-rose-300"
}

function loadCachedAqi(cityName: string): AirQualityData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AQI)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.cityName === cityName && Date.now() - parsed.data.fetchedAt < CACHE_DURATION) {
        return parsed.data
      }
    }
  } catch {}
  return null
}

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

export function DashboardWeather() {
  const [city] = useState<City>(loadCity)
  const [weather, setWeather] = useState<WeatherData | null>(() => loadCachedData(city.name))
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(() => loadCachedAqi(city.name))
  const [loading, setLoading] = useState(!weather)

  const loadWeather = useCallback(async () => {
    const cached = loadCachedData(city.name)
    if (cached) {
      setWeather(cached)
      setLoading(false)
    } else {
      setLoading(true)
      try {
        const data = await fetchWeather(city.lat, city.lon)
        setWeather(data)
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify({ cityName: city.name, data }))
      } catch {}
      setLoading(false)
    }

    const cachedAqi = loadCachedAqi(city.name)
    if (cachedAqi) {
      setAirQuality(cachedAqi)
    } else {
      try {
        const aqi = await fetchAirQuality(city.lat, city.lon)
        setAirQuality(aqi)
        localStorage.setItem(STORAGE_KEY_AQI, JSON.stringify({ cityName: city.name, data: aqi }))
      } catch {}
    }
  }, [city])

  useEffect(() => {
    loadWeather()
  }, [loadWeather])

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full bg-white/30" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-24 bg-white/30" />
            <Skeleton className="h-4 w-32 bg-white/30" />
          </div>
        </div>
      </div>
    )
  }

  if (!weather) return null

  const Icon = getWeatherIcon(weather.current.weatherCode, weather.current.isDay)

  return (
    <Link to="/weather" className="block">
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl p-6 hover:from-sky-600 hover:to-blue-700 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Icon className="h-14 w-14 text-sky-100" />
            <div>
              <div className="text-4xl font-bold">{Math.round(weather.current.temperature)}°C</div>
              <div className="text-sm text-sky-100 mt-0.5">{getWeatherDescription(weather.current.weatherCode)}</div>
            </div>
          </div>
          <div className="text-right space-y-1.5">
            <div className="flex items-center gap-1.5 justify-end text-sm">
              <MapPin className="h-3.5 w-3.5 text-sky-200" />
              <span>{city.name}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end text-xs text-sky-200">
              <Droplets className="h-3 w-3" />
              <span>{weather.current.humidity}%</span>
              <Wind className="h-3 w-3 ml-1" />
              <span>{weather.current.windSpeed} km/h</span>
            </div>
            <div className="text-xs text-sky-200">
              Cảm giác {Math.round(weather.current.apparentTemperature)}°C
            </div>
            {airQuality && (
              <div className="flex items-center gap-1.5 justify-end text-xs">
                <Haze className="h-3 w-3 text-sky-200" />
                <span className={getAqiColor(airQuality.aqi)}>
                  AQI {airQuality.aqi} · {getAqiLabel(airQuality.aqi)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

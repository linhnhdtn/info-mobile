import {
  Sun,
  Moon,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  type LucideIcon,
} from "lucide-react"

export interface CurrentWeather {
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: number
  pressure: number
  weatherCode: number
  isDay: boolean
}

export interface DailyForecast {
  date: string
  weatherCode: number
  temperatureMax: number
  temperatureMin: number
  precipitationSum: number
}

export interface WeatherData {
  current: CurrentWeather
  daily: DailyForecast[]
  fetchedAt: number
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
    timezone: "Asia/Ho_Chi_Minh",
    forecast_days: "7",
  })

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error("Không thể tải dữ liệu thời tiết")

  const data = await res.json()

  return {
    current: {
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      pressure: data.current.surface_pressure,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day === 1,
    },
    daily: data.daily.time.map((date: string, i: number) => ({
      date,
      weatherCode: data.daily.weather_code[i],
      temperatureMax: data.daily.temperature_2m_max[i],
      temperatureMin: data.daily.temperature_2m_min[i],
      precipitationSum: data.daily.precipitation_sum[i],
    })),
    fetchedAt: Date.now(),
  }
}

const weatherDescriptions: Record<number, string> = {
  0: "Trời quang",
  1: "Gần như quang",
  2: "Có mây rải rác",
  3: "U ám",
  45: "Sương mù",
  48: "Sương mù đọng băng",
  51: "Mưa phùn nhẹ",
  53: "Mưa phùn",
  55: "Mưa phùn dày",
  56: "Mưa phùn đóng băng nhẹ",
  57: "Mưa phùn đóng băng",
  61: "Mưa nhẹ",
  63: "Mưa vừa",
  65: "Mưa to",
  66: "Mưa đóng băng nhẹ",
  67: "Mưa đóng băng nặng",
  71: "Tuyết nhẹ",
  73: "Tuyết vừa",
  75: "Tuyết dày",
  77: "Hạt tuyết",
  80: "Mưa rào nhẹ",
  81: "Mưa rào vừa",
  82: "Mưa rào mạnh",
  85: "Mưa tuyết nhẹ",
  86: "Mưa tuyết nặng",
  95: "Giông bão",
  96: "Giông bão kèm mưa đá nhẹ",
  99: "Giông bão kèm mưa đá nặng",
}

export function getWeatherDescription(code: number): string {
  return weatherDescriptions[code] ?? "Không xác định"
}

const weatherIcons: Record<number, LucideIcon> = {
  0: Sun,
  1: Sun,
  2: CloudSun,
  3: Cloud,
  45: CloudFog,
  48: CloudFog,
  51: CloudDrizzle,
  53: CloudDrizzle,
  55: CloudDrizzle,
  56: CloudDrizzle,
  57: CloudDrizzle,
  61: CloudRain,
  63: CloudRain,
  65: CloudRain,
  66: CloudRain,
  67: CloudRain,
  71: CloudSnow,
  73: CloudSnow,
  75: CloudSnow,
  77: CloudSnow,
  80: CloudRain,
  81: CloudRain,
  82: CloudRain,
  85: CloudSnow,
  86: CloudSnow,
  95: CloudLightning,
  96: CloudLightning,
  99: CloudLightning,
}

export function getWeatherIcon(code: number, isDay?: boolean): LucideIcon {
  if ((code === 0 || code === 1) && isDay === false) return Moon
  return weatherIcons[code] ?? Cloud
}

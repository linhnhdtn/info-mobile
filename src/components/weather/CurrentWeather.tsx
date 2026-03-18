import { Droplets, Wind, Gauge } from "lucide-react"
import { type CurrentWeather as CurrentWeatherType, getWeatherDescription, getWeatherIcon } from "@/lib/weather"

interface CurrentWeatherProps {
  data: CurrentWeatherType
}

export function CurrentWeather({ data }: CurrentWeatherProps) {
  const Icon = getWeatherIcon(data.weatherCode, data.isDay)

  return (
    <div className="bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl p-6">
      <div className="flex items-center gap-4">
        <Icon className="h-16 w-16 text-sky-100" />
        <div>
          <div className="text-5xl font-bold">{Math.round(data.temperature)}°C</div>
          <div className="text-sky-100 text-sm mt-1">{getWeatherDescription(data.weatherCode)}</div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white/15 p-2">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs text-sky-200">Cảm giác</div>
            <div className="text-sm font-medium">{Math.round(data.apparentTemperature)}°C</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white/15 p-2">
            <Droplets className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs text-sky-200">Độ ẩm</div>
            <div className="text-sm font-medium">{data.humidity}%</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white/15 p-2">
            <Wind className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs text-sky-200">Gió</div>
            <div className="text-sm font-medium">{data.windSpeed} km/h</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white/15 p-2">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs text-sky-200">Áp suất</div>
            <div className="text-sm font-medium">{Math.round(data.pressure)} hPa</div>
          </div>
        </div>
      </div>
    </div>
  )
}

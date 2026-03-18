import { format, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
import { Droplets } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type DailyForecast, getWeatherDescription, getWeatherIcon } from "@/lib/weather"

interface WeatherForecastProps {
  data: DailyForecast[]
}

export function WeatherForecast({ data }: WeatherForecastProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Dự báo 7 ngày</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {data.map((day) => {
          const Icon = getWeatherIcon(day.weatherCode, true)
          const date = parseISO(day.date)
          const dayName = format(date, "EEEE", { locale: vi })
          const dateStr = format(date, "dd/MM")

          return (
            <div
              key={day.date}
              className="flex items-center gap-3 py-2.5 border-b last:border-b-0"
            >
              <div className="w-24 shrink-0">
                <div className="text-sm font-medium capitalize">{dayName}</div>
                <div className="text-xs text-muted-foreground">{dateStr}</div>
              </div>
              <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{getWeatherDescription(day.weatherCode)}</div>
              </div>
              <div className="text-sm font-medium shrink-0">
                <span className="text-blue-600">{Math.round(day.temperatureMin)}°</span>
                <span className="text-muted-foreground mx-1">/</span>
                <span className="text-red-500">{Math.round(day.temperatureMax)}°</span>
              </div>
              {day.precipitationSum > 0 && (
                <div className="flex items-center gap-1 text-xs text-blue-500 shrink-0">
                  <Droplets className="h-3 w-3" />
                  {day.precipitationSum.toFixed(1)}mm
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

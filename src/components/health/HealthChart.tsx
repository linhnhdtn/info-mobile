import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { HealthLog } from "@/types"
import { format, parseISO } from "date-fns"

interface HealthChartProps {
  logs: HealthLog[]
}

export function HealthChart({ logs }: HealthChartProps) {
  const data = logs
    .filter((l) => l.weight != null)
    .map((l) => ({
      date: format(parseISO(l.date), "dd/MM"),
      weight: l.weight,
      bmi: l.weight && l.height ? +(l.weight / ((l.height / 100) ** 2)).toFixed(1) : null,
    }))

  if (data.length < 2) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Biểu đồ cân nặng</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Tooltip
              formatter={(value: any, name: any) => [
                `${value} ${name === 'weight' ? 'kg' : ''}`,
                name === 'weight' ? 'Cân nặng' : 'BMI'
              ]}
            />
            <Line type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            {data.some((d) => d.bmi != null) && (
              <Line type="monotone" dataKey="bmi" stroke="#10B981" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 4" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

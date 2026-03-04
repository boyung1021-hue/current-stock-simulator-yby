"use client"

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface PortfolioChartProps {
  data: { time: string; value: number }[]
  isUp: boolean
}

export function PortfolioChart({ data, isUp }: PortfolioChartProps) {
  const colorSolid = isUp
    ? "oklch(0.57 0.22 25)"
    : "oklch(0.5 0.18 255)"

  return (
    <div className="w-full h-28" aria-label="Portfolio performance chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorSolid} stopOpacity={0.18} />
              <stop offset="95%" stopColor={colorSolid} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis domain={["auto", "auto"]} hide />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.length) {
                return (
                  <div className="bg-card text-card-foreground text-xs px-2 py-1 rounded-lg card-shadow border-0">
                    ₩{payload[0].value?.toLocaleString()}
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={colorSolid}
            strokeWidth={2}
            fill="url(#portfolioGrad)"
            dot={false}
            activeDot={{ r: 4, fill: colorSolid, stroke: "white", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

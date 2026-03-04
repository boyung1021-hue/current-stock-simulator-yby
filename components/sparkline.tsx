"use client"

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  isUp?: boolean
  className?: string
}

export function Sparkline({ data, width = 80, height = 36, isUp, className = "" }: SparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  })

  const pathD = `M ${points.join(" L ")}`

  const areaD = `M 0,${height} L ${points.join(" L ")} L ${width},${height} Z`

  const color = isUp === undefined
    ? "oklch(0.52 0.22 260)"
    : isUp
    ? "oklch(0.57 0.22 25)"
    : "oklch(0.5 0.18 255)"

  const fillId = `fill-${isUp === undefined ? "n" : isUp ? "u" : "d"}-${data[0]}-${data[data.length - 1]}-${data.length}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${fillId})`} />
      <path
        d={pathD}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

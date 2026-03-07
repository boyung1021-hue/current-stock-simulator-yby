"use client"

import { useState, useEffect, useRef } from "react"
import { Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { StockDetailSheet } from "@/components/stock-detail-sheet"
import type { Holding } from "@/lib/stocks"

// ── useCountUp: eased integer animation ───────────────────
function useCountUp(target: number, duration = 260) {
  const [displayed, setDisplayed] = useState(target)
  const fromRef = useRef(target)
  const rafRef = useRef<number>(0)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    cancelAnimationFrame(rafRef.current)
    const from = fromRef.current
    const startTime = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = Math.round(from + (target - from) * eased)
      setDisplayed(next)
      if (t < 1) { rafRef.current = requestAnimationFrame(tick) }
      else { fromRef.current = target }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return displayed
}

// ── useSlide: slide-in direction on value change ──────────
function useSlide(value: number) {
  const prevRef = useRef(value)
  const mountedRef = useRef(false)
  const [animKey, setAnimKey] = useState(0)
  const [slideClass, setSlideClass] = useState("")

  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    if (prevRef.current === value) return
    setSlideClass(value > prevRef.current ? "anim-slide-up" : "anim-slide-down")
    setAnimKey(k => k + 1)
    prevRef.current = value
  }, [value])

  return { animKey, slideClass }
}

// ── SVG Sparkline ─────────────────────────────────────────
function Sparkline({ data, isUp }: { data: number[]; isUp: boolean }) {
  if (data.length < 2) return null

  const H = 48
  const W = 100
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 4

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - pad - ((v - min) / range) * (H - pad * 2)
    return [x, y] as [number, number]
  })

  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ")
  const fill = `${line} L ${W} ${H} L 0 ${H} Z`

  const stroke = isUp ? "var(--stock-up)" : "var(--stock-down)"
  const fillColor = isUp
    ? "oklch(0.57 0.22 25 / 0.12)"
    : "oklch(0.5 0.18 255 / 0.12)"

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      preserveAspectRatio="none"
      style={{ height: H }}
    >
      <path d={fill} fill={fillColor} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

// ── Types ──────────────────────────────────────────────────
interface PortfolioTabProps {
  holdings: Holding[]
  cash: number
  assetHistory?: number[]
  onBuy: (ticker: string, quantity: number, price: number) => void
  onSell: (ticker: string, quantity: number, price: number) => void
}

// ── Component ──────────────────────────────────────────────
export function PortfolioTab({ holdings, cash, assetHistory, onBuy, onSell }: PortfolioTabProps) {
  const [hideBalance, setHideBalance] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Holding | null>(null)

  const stockValue = holdings.reduce((sum, h) => sum + h.price * h.shares, 0)
  const totalValue = stockValue + cash
  const totalInvested = holdings.reduce((sum, h) => sum + h.avgPrice * h.shares, 0)
  const totalGain = stockValue - totalInvested
  const totalGainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
  const isTotalUp = totalGain >= 0

  const todayGain = holdings.reduce((sum, h) => sum + h.change * h.shares, 0)
  const todayIsUp = todayGain >= 0

  // Animated display values
  const animTotalValue = useCountUp(totalValue)
  const animStockValue = useCountUp(stockValue)
  const animTodayGain  = useCountUp(todayGain)
  const { animKey: pctKey, slideClass: pctSlide } = useSlide(totalGainPct)

  const mask = (val: string) => (hideBalance ? "•••••" : val)
  const hasHoldings = holdings.length > 0

  return (
    <>
      <div className="flex flex-col min-h-0">
        {/* ── Header ────────────────────────────────────── */}
        <header className="flex items-center justify-between px-5 pt-2 pb-4 bg-background">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-sm font-bold">J</span>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground leading-none">내 계좌</p>
              <p className="text-sm font-semibold text-foreground leading-tight mt-0.5">James Kim</p>
            </div>
          </div>
        </header>

        {/* ── Top Summary Card ──────────────────────────── */}
        <div className="mx-4 mb-4">
          <div className="bg-card rounded-2xl card-shadow overflow-hidden">
            <div className="px-5 pt-5 pb-4">
              {/* Row: label + eye toggle */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">내 포트폴리오</p>
                <button
                  onClick={() => setHideBalance(!hideBalance)}
                  className="text-muted-foreground active:scale-95 transition-transform"
                  aria-label={hideBalance ? "금액 표시" : "금액 숨기기"}
                >
                  {hideBalance
                    ? <EyeOff className="w-[15px] h-[15px]" />
                    : <Eye className="w-[15px] h-[15px]" />}
                </button>
              </div>

              {/* 수익률 — hero number (slide animation on change) */}
              <div className="overflow-hidden">
                <div
                  key={pctKey}
                  className={cn(
                    "text-[42px] font-extrabold leading-none tracking-tight",
                    pctSlide,
                    hasHoldings ? (isTotalUp ? "stock-up" : "stock-down") : "text-muted-foreground"
                  )}
                >
                  {hideBalance
                    ? "•••%"
                    : hasHoldings
                      ? `${isTotalUp ? "+" : ""}${totalGainPct.toFixed(2)}%`
                      : "0.00%"}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5 mb-5">수익률</p>

              {/* 총 평가금액 (count-up) */}
              <p className="text-[20px] font-bold text-foreground leading-none tracking-tight tabular-nums">
                {hideBalance ? "•••••••" : `₩${animTotalValue.toLocaleString()}`}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1.5 mb-4">총 평가금액</p>

              {/* Today's change pill (count-up) */}
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                hasHoldings
                  ? (todayIsUp ? "bg-stock-up-soft" : "bg-stock-down-soft")
                  : "bg-secondary"
              )}>
                {hasHoldings && (
                  todayIsUp
                    ? <TrendingUp className="w-3 h-3 stock-up" strokeWidth={2.5} />
                    : <TrendingDown className="w-3 h-3 stock-down" strokeWidth={2.5} />
                )}
                <span className={cn(
                  "text-[11px] font-bold tabular-nums",
                  hasHoldings ? (todayIsUp ? "stock-up" : "stock-down") : "text-muted-foreground"
                )}>
                  {hideBalance
                    ? "•••"
                    : hasHoldings
                      ? `${todayIsUp ? "+" : ""}₩${animTodayGain.toLocaleString()}`
                      : "₩0"}
                </span>
                <span className="text-[10px] text-muted-foreground">오늘</span>
              </div>

              {/* 3-stat row: 예수금 / 투자금 / 평가금액 */}
              <div className="flex mt-5 pt-4 border-t border-border">
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground mb-1.5">예수금</p>
                  <p className="text-[13px] font-bold text-foreground tabular-nums">
                    {mask(`₩${cash.toLocaleString()}`)}
                  </p>
                </div>
                <div className="w-px bg-border self-stretch mx-3" />
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground mb-1.5">투자금</p>
                  <p className="text-[13px] font-bold text-foreground tabular-nums">
                    {mask(`₩${totalInvested.toLocaleString()}`)}
                  </p>
                </div>
                <div className="w-px bg-border self-stretch mx-3" />
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground mb-1.5">평가금액</p>
                  <p className={cn(
                    "text-[13px] font-bold tabular-nums",
                    hasHoldings ? (isTotalUp ? "stock-up" : "stock-down") : "text-foreground"
                  )}>
                    {mask(`₩${animStockValue.toLocaleString()}`)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sparkline — full-width, flush to card bottom */}
            {assetHistory && assetHistory.length >= 2 && (
              <div className="px-0 pb-0">
                <Sparkline data={assetHistory} isUp={isTotalUp} />
              </div>
            )}
          </div>
        </div>

        {/* ── Holdings List ─────────────────────────────── */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-foreground">보유 종목</h2>
            <span className="text-xs text-muted-foreground">{holdings.length}개 종목</span>
          </div>

          {holdings.length === 0 ? (
            <div className="bg-card rounded-2xl card-shadow py-12 text-center">
              <p className="text-muted-foreground text-sm">보유 종목이 없습니다</p>
              <p className="text-muted-foreground text-xs mt-1">탐색 탭에서 주식을 매수해보세요</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {holdings.map((stock) => {
                const currentValue = stock.price * stock.shares
                const invested = stock.avgPrice * stock.shares
                const gain = currentValue - invested
                const gainPct = ((stock.price - stock.avgPrice) / stock.avgPrice) * 100
                const isProfit = gainPct >= 0

                return (
                  <button
                    key={stock.id}
                    onClick={() => setSelectedStock(stock)}
                    className="bg-card rounded-2xl card-shadow p-4 w-full text-left active:scale-[0.98] transition-transform"
                    aria-label={`${stock.nameKr} 상세 보기`}
                  >
                    {/* Row 1: name + current price */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[14px] font-bold text-foreground truncate">{stock.nameKr}</p>
                          <p className="text-[14px] font-bold text-foreground tabular-nums">
                            ₩{stock.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-muted-foreground">{stock.ticker}</p>
                          <span className={cn("text-xs font-semibold", stock.isUp ? "stock-up" : "stock-down")}>
                            {stock.isUp ? "+" : ""}{stock.changePct.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: detail fields + return % badge */}
                    <div className="flex items-end gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground">보유 수량</p>
                          <p className="text-xs font-semibold text-foreground mt-0.5">{stock.shares}주</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">평균 매수가</p>
                          <p className="text-xs font-semibold text-foreground mt-0.5 tabular-nums">₩{stock.avgPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">평가금액</p>
                          <p className="text-xs font-semibold text-foreground mt-0.5 tabular-nums">₩{currentValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">손익</p>
                          <p className={cn("text-xs font-bold mt-0.5 tabular-nums", isProfit ? "stock-up" : "stock-down")}>
                            {isProfit ? "+" : ""}₩{gain.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Return % badge */}
                      <div className="flex-shrink-0">
                        <span className={cn(
                          "text-xs font-bold px-2.5 py-1 rounded-xl tabular-nums",
                          isProfit ? "bg-stock-up-soft stock-up" : "bg-stock-down-soft stock-down"
                        )}>
                          {isProfit ? "+" : ""}{gainPct.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="h-6" />
      </div>

      {/* Detail Sheet */}
      {selectedStock && (
        <StockDetailSheet
          stock={selectedStock}
          holding={{ shares: selectedStock.shares, avgPrice: selectedStock.avgPrice }}
          cash={cash}
          onBuy={onBuy}
          onSell={onSell}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </>
  )
}
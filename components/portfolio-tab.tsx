"use client"

import { useState, useEffect, useRef } from "react"
import { Eye, EyeOff, TrendingUp, TrendingDown, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { StockDetailSheet } from "@/components/stock-detail-sheet"
import type { Holding } from "@/lib/stocks"

// ── useCountUp ─────────────────────────────────────────────
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

// ── useSlide ───────────────────────────────────────────────
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

// ── Sparkline ──────────────────────────────────────────────
function Sparkline({ data, isUp }: { data: number[]; isUp: boolean }) {
  if (data.length < 2) return null
  const H = 48, W = 100
  const min = Math.min(...data), max = Math.max(...data)
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
  const fillColor = isUp ? "oklch(0.57 0.22 25 / 0.10)" : "oklch(0.5 0.18 255 / 0.10)"
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: H }}>
      <path d={fill} fill={fillColor} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
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
  onGoToDiscover?: () => void
}

// ── Component ──────────────────────────────────────────────
export function PortfolioTab({ holdings, cash, assetHistory, onBuy, onSell, onGoToDiscover }: PortfolioTabProps) {
  const [hideBalance, setHideBalance] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Holding | null>(null)

  const stockValue    = holdings.reduce((sum, h) => sum + h.price * h.shares, 0)
  const totalValue    = stockValue + cash
  const totalInvested = holdings.reduce((sum, h) => sum + h.avgPrice * h.shares, 0)
  const totalGain     = stockValue - totalInvested
  const totalGainPct  = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
  const isTotalUp     = totalGain >= 0

  const todayGain  = holdings.reduce((sum, h) => sum + h.change * h.shares, 0)
  const todayIsUp  = todayGain >= 0

  const animTotalValue = useCountUp(totalValue)
  const animStockValue = useCountUp(stockValue)
  const animTodayGain  = useCountUp(todayGain)
  const { animKey: pctKey, slideClass: pctSlide } = useSlide(totalGainPct)

  const mask       = (val: string) => (hideBalance ? "•••••" : val)
  const hasHoldings = holdings.length > 0

  return (
    <>
      <div className="flex flex-col min-h-0">

        {/* ── Profile header ────────────────────────────────── */}
        <header className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-xs font-bold">J</span>
            </div>
            <div>
              <p className="text-[11px] leading-none" style={{ color: '#aaa' }}>내 계좌</p>
              <p className="text-[13px] font-semibold text-foreground leading-tight mt-0.5">James Kim</p>
            </div>
          </div>
        </header>

        {/* ── Portfolio Card ─────────────────────────────────── */}
        <div className="mx-5 mb-7">
          <div
            className="bg-card rounded-[20px] overflow-hidden"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
          >
            <div className="px-6 pt-6 pb-5">

              {/* label row + eye */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px] font-medium" style={{ color: '#888' }}>내 포트폴리오</p>
                <button
                  onClick={() => setHideBalance(!hideBalance)}
                  className="text-muted-foreground active:scale-95 transition-transform p-0.5"
                  aria-label={hideBalance ? "금액 표시" : "금액 숨기기"}
                >
                  {hideBalance
                    ? <EyeOff className="w-[15px] h-[15px]" />
                    : <Eye className="w-[15px] h-[15px]" />}
                </button>
              </div>

              {/* 수익률 hero */}
              <div className="overflow-hidden mb-1">
                <div
                  key={pctKey}
                  className={cn(
                    "leading-none tracking-tight",
                    pctSlide,
                    hasHoldings ? (isTotalUp ? "stock-up" : "stock-down") : "text-muted-foreground"
                  )}
                  style={{ fontSize: 48, fontWeight: 800 }}
                >
                  {hideBalance
                    ? "•••%"
                    : hasHoldings
                      ? `${isTotalUp ? "+" : ""}${totalGainPct.toFixed(2)}%`
                      : "0.00%"}
                </div>
              </div>
              <p className="text-[12px] mb-5" style={{ color: '#888' }}>수익률</p>

              {/* 총 평가금액 */}
              <p className="leading-none font-semibold text-foreground tabular-nums mb-1" style={{ fontSize: 28, fontWeight: 600 }}>
                {hideBalance ? "•••••••" : `₩${animTotalValue.toLocaleString()}`}
              </p>
              <p className="text-[12px] mb-5" style={{ color: '#888' }}>총 평가금액</p>

              {/* 오늘 손익 칩 */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-6"
                style={{ background: '#F5F5F5', borderRadius: 999 }}
              >
                {hasHoldings && (
                  todayIsUp
                    ? <TrendingUp className="w-3 h-3 stock-up" strokeWidth={2.5} />
                    : <TrendingDown className="w-3 h-3 stock-down" strokeWidth={2.5} />
                )}
                <span className={cn(
                  "text-[12px] font-bold tabular-nums",
                  hasHoldings ? (todayIsUp ? "stock-up" : "stock-down") : "text-muted-foreground"
                )}>
                  {hideBalance
                    ? "•••"
                    : hasHoldings
                      ? `${todayIsUp ? "+" : ""}₩${animTodayGain.toLocaleString()}`
                      : "₩0"}
                </span>
                <span className="text-[12px]" style={{ color: '#aaa' }}>오늘</span>
              </div>

              {/* 3-stat row: 여백으로만 구분, divider 없음 */}
              <div className="flex">
                <div className="flex-1">
                  <p className="text-[12px] mb-1.5" style={{ color: '#888' }}>예수금</p>
                  <p className="font-semibold text-foreground tabular-nums" style={{ fontSize: 16, fontWeight: 600 }}>
                    {mask(`₩${cash.toLocaleString()}`)}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] mb-1.5" style={{ color: '#888' }}>투자금</p>
                  <p className="font-semibold text-foreground tabular-nums" style={{ fontSize: 16, fontWeight: 600 }}>
                    {mask(`₩${totalInvested.toLocaleString()}`)}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] mb-1.5" style={{ color: '#888' }}>평가금액</p>
                  <p
                    className={cn("font-semibold tabular-nums", hasHoldings ? (isTotalUp ? "stock-up" : "stock-down") : "text-foreground")}
                    style={{ fontSize: 16, fontWeight: 600 }}
                  >
                    {mask(`₩${animStockValue.toLocaleString()}`)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sparkline flush to card bottom */}
            {assetHistory && assetHistory.length >= 2 && (
              <Sparkline data={assetHistory} isUp={isTotalUp} />
            )}
          </div>
        </div>

        {/* ── Holdings section ──────────────────────────────── */}
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-bold text-foreground">보유 종목</h2>
            <span className="text-[14px]" style={{ color: '#aaa' }}>{holdings.length}개 종목</span>
          </div>

          {holdings.length === 0 ? (
            /* ── Empty state ── */
            <div
              className="bg-card rounded-[20px] px-6 py-8 flex flex-col items-center text-center"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
            >
              <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center mb-3">
                <BarChart2 className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
              </div>
              <p className="text-[15px] font-semibold text-foreground mb-1">보유 종목이 없어요</p>
              <p className="text-[13px] text-muted-foreground mb-4 leading-snug">
                탐색 탭에서 마음에 드는 종목을<br />찾아보세요
              </p>
              {onGoToDiscover && (
                <button
                  onClick={onGoToDiscover}
                  className="text-[13px] font-semibold text-primary active:opacity-70 transition-opacity"
                >
                  종목 탐색하기 →
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {holdings.map((stock) => {
                const currentValue = stock.price * stock.shares
                const invested     = stock.avgPrice * stock.shares
                const gain         = currentValue - invested
                const gainPct      = ((stock.price - stock.avgPrice) / stock.avgPrice) * 100
                const isProfit     = gainPct >= 0

                return (
                  <button
                    key={stock.id}
                    onClick={() => setSelectedStock(stock)}
                    className="bg-card rounded-[20px] p-5 w-full text-left active:scale-[0.98] transition-transform"
                    style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
                    aria-label={`${stock.nameKr} 상세 보기`}
                  >
                    {/* Row 1: name + price */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-[15px] font-bold text-foreground">{stock.nameKr}</p>
                        <p className="text-[12px] mt-0.5" style={{ color: '#aaa' }}>{stock.ticker}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] font-bold text-foreground tabular-nums">
                          ₩{stock.price.toLocaleString()}
                        </p>
                        <p className={cn("text-[12px] font-semibold mt-0.5", stock.isUp ? "stock-up" : "stock-down")}>
                          {stock.isUp ? "+" : ""}{stock.changePct.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    {/* Row 2: 4 stats + return badge */}
                    <div className="flex items-end gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3">
                        <div>
                          <p className="text-[11px] mb-0.5" style={{ color: '#aaa' }}>보유 수량</p>
                          <p className="text-[13px] font-semibold text-foreground">{stock.shares}주</p>
                        </div>
                        <div>
                          <p className="text-[11px] mb-0.5" style={{ color: '#aaa' }}>평균 매수가</p>
                          <p className="text-[13px] font-semibold text-foreground tabular-nums">₩{stock.avgPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[11px] mb-0.5" style={{ color: '#aaa' }}>평가금액</p>
                          <p className="text-[13px] font-semibold text-foreground tabular-nums">₩{currentValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[11px] mb-0.5" style={{ color: '#aaa' }}>손익</p>
                          <p className={cn("text-[13px] font-bold tabular-nums", isProfit ? "stock-up" : "stock-down")}>
                            {isProfit ? "+" : ""}₩{gain.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Return % badge */}
                      <div className="flex-shrink-0">
                        <span className={cn(
                          "text-[12px] font-bold px-2.5 py-1.5 rounded-xl tabular-nums",
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
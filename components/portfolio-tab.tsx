"use client"

import { useState, useEffect, useRef } from "react"
import { Eye, EyeOff, TrendingUp, TrendingDown, BarChart2, ArrowRight } from "lucide-react"
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

// ── Types ──────────────────────────────────────────────────
interface PortfolioTabProps {
  holdings: Holding[]
  cash: number
  assetHistory?: number[]
  onBuy: (ticker: string, quantity: number, price: number) => void
  onSell: (ticker: string, quantity: number, price: number) => void
  onDiscoverClick?: () => void
}

// ── Component ──────────────────────────────────────────────
export function PortfolioTab({ holdings, cash, assetHistory, onBuy, onSell, onDiscoverClick }: PortfolioTabProps) {
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

  const animTotalValue = useCountUp(totalValue)
  const animStockValue = useCountUp(stockValue)
  const animTodayGain  = useCountUp(todayGain)
  const { animKey: pctKey, slideClass: pctSlide } = useSlide(totalGainPct)

  const mask = (val: string) => (hideBalance ? "•••••" : val)
  const hasHoldings = holdings.length > 0

  return (
    <>
      <div className="flex flex-col min-h-0">

        {/* ── Header ─────────────────────────────────────── */}
        <header className="flex items-center justify-between px-5 pt-3 pb-4">
          <h1 className="text-[24px] font-bold text-foreground leading-none">내 주식</h1>
          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-secondary transition-colors"
            aria-label={hideBalance ? "금액 표시" : "금액 숨기기"}
          >
            {hideBalance
              ? <EyeOff className="w-[18px] h-[18px] text-muted-foreground" />
              : <Eye    className="w-[18px] h-[18px] text-muted-foreground" />}
          </button>
        </header>

        {/* ── Summary Card ───────────────────────────────── */}
        <div className="mx-5 mb-7">
          <div
            className="bg-card overflow-hidden"
            style={{ borderRadius: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
          >
            <div className="px-6 pt-6 pb-6">

              {/* 수익률 */}
              <p style={{ color: "#888", fontSize: 12, fontWeight: 500, marginBottom: 6 }}>수익률</p>
              <div className="overflow-hidden">
                <div
                  key={pctKey}
                  className={cn(
                    "font-extrabold leading-none tracking-tight",
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

              {/* 총 평가금액 */}
              <div style={{ marginTop: 20 }}>
                <p style={{ color: "#888", fontSize: 12, fontWeight: 500, marginBottom: 6 }}>총 평가금액</p>
                <p
                  className="text-foreground leading-none tracking-tight tabular-nums"
                  style={{ fontSize: 28, fontWeight: 600 }}
                >
                  {hideBalance ? "•••••••" : `₩${animTotalValue.toLocaleString()}`}
                </p>
              </div>

              {/* 오늘 손익 칩 */}
              <div style={{ marginTop: 16 }}>
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5",
                    hasHoldings
                      ? (todayIsUp ? "bg-stock-up-soft" : "bg-stock-down-soft")
                      : ""
                  )}
                  style={{
                    borderRadius: 999,
                    backgroundColor: hasHoldings ? undefined : "#F5F5F5",
                  }}
                >
                  {hasHoldings && (
                    todayIsUp
                      ? <TrendingUp  className="w-3 h-3 stock-up"   strokeWidth={2.5} />
                      : <TrendingDown className="w-3 h-3 stock-down" strokeWidth={2.5} />
                  )}
                  <span
                    className={cn(
                      "tabular-nums",
                      hasHoldings ? (todayIsUp ? "stock-up" : "stock-down") : "text-muted-foreground"
                    )}
                    style={{ fontSize: 12, fontWeight: 700 }}
                  >
                    {hideBalance
                      ? "•••"
                      : hasHoldings
                        ? `${todayIsUp ? "+" : ""}₩${animTodayGain.toLocaleString()}`
                        : "₩0"}
                  </span>
                  <span style={{ fontSize: 12, color: "#888" }}>오늘</span>
                </div>
              </div>

              {/* 3-stat row: 예수금 / 투자금 / 평가금액 */}
              <div className="flex" style={{ marginTop: 24 }}>
                <div className="flex-1">
                  <p style={{ color: "#888", fontSize: 12, fontWeight: 500, marginBottom: 6 }}>예수금</p>
                  <p className="text-foreground tabular-nums" style={{ fontSize: 16, fontWeight: 600 }}>
                    {mask(`₩${cash.toLocaleString()}`)}
                  </p>
                </div>
                <div className="flex-1">
                  <p style={{ color: "#888", fontSize: 12, fontWeight: 500, marginBottom: 6 }}>투자금</p>
                  <p className="text-foreground tabular-nums" style={{ fontSize: 16, fontWeight: 600 }}>
                    {mask(`₩${totalInvested.toLocaleString()}`)}
                  </p>
                </div>
                <div className="flex-1">
                  <p style={{ color: "#888", fontSize: 12, fontWeight: 500, marginBottom: 6 }}>평가금액</p>
                  <p
                    className={cn(
                      "tabular-nums",
                      hasHoldings ? (isTotalUp ? "stock-up" : "stock-down") : "text-foreground"
                    )}
                    style={{ fontSize: 16, fontWeight: 600 }}
                  >
                    {mask(`₩${animStockValue.toLocaleString()}`)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Holdings Section ───────────────────────────── */}
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize: 18, fontWeight: 700 }} className="text-foreground">보유 종목</h2>
            <span style={{ fontSize: 14, color: "#aaaaaa" }}>{holdings.length}개 종목</span>
          </div>

          {holdings.length === 0 ? (
            /* ── Empty State ── */
            <div
              className="bg-card flex flex-col items-center justify-center text-center py-9 px-6"
              style={{ borderRadius: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
            >
              <div
                className="flex items-center justify-center mb-4"
                style={{
                  width: 52, height: 52, borderRadius: 16,
                  backgroundColor: "#F5F5F5",
                }}
              >
                <BarChart2 className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
              </div>
              <p className="text-foreground font-semibold" style={{ fontSize: 15 }}>
                보유 종목이 없어요
              </p>
              <p style={{ fontSize: 13, color: "#aaa", marginTop: 6, lineHeight: 1.5 }}>
                탐색 탭에서 마음에 드는<br />종목을 찾아보세요
              </p>
              {onDiscoverClick && (
                <button
                  onClick={onDiscoverClick}
                  className="flex items-center gap-1 active:opacity-60 transition-opacity"
                  style={{ marginTop: 20, fontSize: 13, fontWeight: 600, color: "var(--primary)" }}
                >
                  종목 탐색하기
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
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
                    className="bg-card w-full text-left active:scale-[0.98] transition-transform"
                    style={{ borderRadius: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", padding: 20 }}
                    aria-label={`${stock.nameKr} 상세 보기`}
                  >
                    {/* Row 1: name + price */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground font-bold truncate" style={{ fontSize: 15 }}>
                          {stock.nameKr}
                        </p>
                        <p style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>{stock.ticker}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-foreground font-bold tabular-nums" style={{ fontSize: 15 }}>
                          ₩{stock.price.toLocaleString()}
                        </p>
                        <p
                          className={cn("tabular-nums font-semibold", stock.isUp ? "stock-up" : "stock-down")}
                          style={{ fontSize: 12, marginTop: 3 }}
                        >
                          {stock.isUp ? "+" : ""}{stock.changePct.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    {/* Row 2: detail grid + return badge */}
                    <div className="flex items-end gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3">
                        <div>
                          <p style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>보유 수량</p>
                          <p className="text-foreground font-semibold" style={{ fontSize: 13 }}>
                            {stock.shares}주
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>평균 매수가</p>
                          <p className="text-foreground font-semibold tabular-nums" style={{ fontSize: 13 }}>
                            ₩{stock.avgPrice.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>평가금액</p>
                          <p className="text-foreground font-semibold tabular-nums" style={{ fontSize: 13 }}>
                            ₩{currentValue.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>손익</p>
                          <p
                            className={cn("font-bold tabular-nums", isProfit ? "stock-up" : "stock-down")}
                            style={{ fontSize: 13 }}
                          >
                            {isProfit ? "+" : ""}₩{gain.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Return % badge */}
                      <span
                        className={cn(
                          "flex-shrink-0 font-bold tabular-nums px-3 py-1.5",
                          isProfit ? "bg-stock-up-soft stock-up" : "bg-stock-down-soft stock-down"
                        )}
                        style={{ borderRadius: 12, fontSize: 13 }}
                      >
                        {isProfit ? "+" : ""}{gainPct.toFixed(2)}%
                      </span>
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
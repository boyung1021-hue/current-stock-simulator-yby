"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, TrendingUp, TrendingDown, Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { PortfolioChart } from "@/components/portfolio-chart"
import type { Stock } from "@/lib/stocks"
import { YAHOO_TICKERS } from "@/lib/stocks"

interface StockDetailSheetProps {
  stock: Stock
  holding?: { shares: number; avgPrice: number }
  cash?: number
  yahooTicker?: string  // override for extra stocks not in YAHOO_TICKERS
  onBuy?: (ticker: string, quantity: number, price: number) => void
  onSell?: (ticker: string, quantity: number, price: number) => void
  onClose: () => void
}

const PERIODS = ["1W", "1M", "3M", "1Y"] as const
type Period = typeof PERIODS[number]

const PERIOD_API: Record<Period, string> = { "1W": "1W", "1M": "1M", "3M": "3M", "1Y": "1Y" }

export function StockDetailSheet({ stock, holding, cash = 0, yahooTicker: yahooTickerProp, onBuy, onSell, onClose }: StockDetailSheetProps) {
  const [period, setPeriod] = useState<Period>("1M")
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy")
  const [quantity, setQuantity] = useState(1)
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([])
  const [chartLoading, setChartLoading] = useState(false)

  // Resolve yahoo ticker: prop > YAHOO_TICKERS > ticker itself
  const yahooTicker = yahooTickerProp ?? YAHOO_TICKERS[stock.ticker] ?? stock.ticker

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  useEffect(() => {
    setChartLoading(true)
    fetch(`/api/stock-history?ticker=${yahooTicker}&period=${PERIOD_API[period]}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: { date: string; close: number }[]) => {
        setChartData(data.map((d) => ({ time: d.date, value: Math.round(d.close) })))
      })
      .catch(() => setChartData([]))
      .finally(() => setChartLoading(false))
  }, [yahooTicker, period])

  const isHeld = holding != null && holding.shares > 0

  const currentValue = isHeld ? stock.price * holding.shares : 0
  const invested = isHeld ? holding.avgPrice * holding.shares : 0
  const gain = currentValue - invested
  const gainPct = isHeld ? ((stock.price - holding.avgPrice) / holding.avgPrice) * 100 : 0

  const orderTotal = stock.price * quantity

  const maxBuyQty = Math.max(1, Math.floor(cash / stock.price))
  const maxSellQty = isHeld ? holding.shares : 0

  const canBuy = orderTotal <= cash && quantity >= 1
  const canSell = isHeld && quantity <= maxSellQty && quantity >= 1

  function adjustQty(delta: number) {
    setQuantity((q) => {
      const max = tradeMode === "buy" ? maxBuyQty : maxSellQty
      return Math.min(max, Math.max(1, q + delta))
    })
  }

  function handleTrade() {
    if (tradeMode === "buy" && canBuy) {
      onBuy?.(stock.ticker, quantity, stock.price)
      onClose()
    } else if (tradeMode === "sell" && canSell) {
      onSell?.(stock.ticker, quantity, stock.price)
      onClose()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${stock.nameKr} 상세`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative w-full max-w-sm bg-background rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[92vh] flex flex-col">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: "none" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0", stock.logoColor)}>
                {stock.initial}
              </div>
              <div>
                <p className="text-base font-bold text-foreground leading-tight">{stock.nameKr}</p>
                <p className="text-xs text-muted-foreground">{stock.ticker}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
              aria-label="닫기"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Price */}
          <div className="px-5 pb-4">
            <p className="text-3xl font-bold text-foreground tracking-tight leading-none">
              ₩{stock.price.toLocaleString()}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={cn("flex items-center gap-0.5 text-sm font-semibold", stock.isUp ? "stock-up" : "stock-down")}>
                {stock.isUp ? <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} /> : <TrendingDown className="w-3.5 h-3.5" strokeWidth={2} />}
                {stock.isUp ? "+" : ""}₩{stock.change.toLocaleString()}
              </span>
              <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded-md", stock.isUp ? "bg-stock-up-soft stock-up" : "bg-stock-down-soft stock-down")}>
                {stock.isUp ? "+" : ""}{stock.changePct.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Period selector + chart */}
          <div className="px-5 pb-2">
            <div className="flex gap-1 mb-3">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-lg transition-all active:scale-95",
                    period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            {chartLoading ? (
              <div className="h-[120px] flex items-center justify-center">
                <span className="text-xs text-muted-foreground">차트 로딩 중...</span>
              </div>
            ) : (
              <PortfolioChart data={chartData} isUp={stock.isUp} />
            )}
          </div>

          {/* My Position - only shown when holding */}
          {/*{isHeld && (*/}
          {/*  <div className="mx-5 mb-4">*/}
          {/*    <div className="bg-secondary rounded-2xl p-4">*/}
          {/*      <p className="text-xs font-semibold text-muted-foreground mb-3">내 보유 현황</p>*/}
          {/*      <div className="grid grid-cols-2 gap-x-4 gap-y-3">*/}
          {/*        <div>*/}
          {/*          <p className="text-xs text-muted-foreground">보유 수량</p>*/}
          {/*          <p className="text-sm font-semibold text-foreground mt-0.5">{holding.shares}주</p>*/}
          {/*        </div>*/}
          {/*        <div>*/}
          {/*          <p className="text-xs text-muted-foreground">평균 매수가</p>*/}
          {/*          <p className="text-sm font-semibold text-foreground mt-0.5">₩{holding.avgPrice.toLocaleString()}</p>*/}
          {/*        </div>*/}
          {/*        <div>*/}
          {/*          <p className="text-xs text-muted-foreground">현재가</p>*/}
          {/*          <p className="text-sm font-semibold text-foreground mt-0.5">₩{stock.price.toLocaleString()}</p>*/}
          {/*        </div>*/}
          {/*        <div>*/}
          {/*          <p className="text-xs text-muted-foreground">평가금액</p>*/}
          {/*          <p className="text-sm font-semibold text-foreground mt-0.5">₩{currentValue.toLocaleString()}</p>*/}
          {/*        </div>*/}
          {/*        <div>*/}
          {/*          <p className="text-xs text-muted-foreground">투자금액</p>*/}
          {/*          <p className="text-sm font-semibold text-foreground mt-0.5">₩{invested.toLocaleString()}</p>*/}
          {/*        </div>*/}
          {/*        <div>*/}
          {/*          <p className="text-xs text-muted-foreground">평가 손익</p>*/}
          {/*          <p className={cn("text-sm font-semibold mt-0.5", gainPct >= 0 ? "stock-up" : "stock-down")}>*/}
          {/*            {gainPct >= 0 ? "+" : ""}₩{gain.toLocaleString()}*/}
          {/*          </p>*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">*/}
          {/*        <p className="text-xs text-muted-foreground">수익률</p>*/}
          {/*        <span className={cn("text-base font-bold", gainPct >= 0 ? "stock-up" : "stock-down")}>*/}
          {/*          {gainPct >= 0 ? "+" : ""}{gainPct.toFixed(2)}%*/}
          {/*        </span>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*)}*/}

          {/* Trade Panel */}
          <div className="mx-5 mb-6">
            <div className="bg-card rounded-2xl card-shadow p-4">
              {/* Buy / Sell toggle */}
              <div className="flex bg-secondary rounded-xl p-1 mb-4">
                <button
                  onClick={() => { setTradeMode("buy"); setQuantity(1) }}
                  className={cn(
                    "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                    tradeMode === "buy" ? "bg-stock-up text-white shadow-sm" : "text-muted-foreground"
                  )}
                >
                  매수
                </button>
                <button
                  onClick={() => { setTradeMode("sell"); setQuantity(1) }}
                  disabled={!isHeld}
                  className={cn(
                    "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                    tradeMode === "sell" ? "bg-stock-down text-white shadow-sm" : "text-muted-foreground",
                    !isHeld && "opacity-40 cursor-not-allowed"
                  )}
                >
                  매도
                </button>
              </div>

              {/* Available cash / shares */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">
                  {tradeMode === "buy" ? "주문 가능 금액" : "매도 가능 수량"}
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {tradeMode === "buy"
                    ? `₩${cash.toLocaleString()}`
                    : `${maxSellQty}주`}
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">수량</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => adjustQty(-1)}
                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
                    aria-label="수량 감소"
                  >
                    <Minus className="w-3.5 h-3.5 text-foreground" />
                  </button>
                  <span className="text-lg font-bold text-foreground w-8 text-center tabular-nums">{quantity}</span>
                  <button
                    onClick={() => adjustQty(1)}
                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
                    aria-label="수량 증가"
                  >
                    <Plus className="w-3.5 h-3.5 text-foreground" />
                  </button>
                </div>
              </div>

              {/* Order summary */}
              <div className="flex items-center justify-between mb-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">주문 금액</p>
                <p className="text-base font-bold text-foreground tabular-nums">₩{orderTotal.toLocaleString()}</p>
              </div>

              {/* CTA */}
              <button
                onClick={handleTrade}
                disabled={tradeMode === "buy" ? !canBuy : !canSell}
                className={cn(
                  "w-full py-3.5 rounded-xl text-white font-bold text-base active:scale-[0.98] transition-transform",
                  tradeMode === "buy" ? "bg-stock-up" : "bg-stock-down",
                  (tradeMode === "buy" ? !canBuy : !canSell) && "opacity-50 cursor-not-allowed"
                )}
              >
                {quantity}주 {tradeMode === "buy" ? "매수하기" : "매도하기"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
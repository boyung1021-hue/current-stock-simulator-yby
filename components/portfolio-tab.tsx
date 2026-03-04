"use client"

import { useState } from "react"
import { Bell, Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { PortfolioChart } from "@/components/portfolio-chart"
import { StockDetailSheet } from "@/components/stock-detail-sheet"
import type { Holding } from "@/lib/stocks"

const PORTFOLIO_CHART_DATA = [
  { time: "09:00", value: 12400000 },
  { time: "09:30", value: 12550000 },
  { time: "10:00", value: 12480000 },
  { time: "10:30", value: 12620000 },
  { time: "11:00", value: 12710000 },
  { time: "11:30", value: 12690000 },
  { time: "12:00", value: 12750000 },
  { time: "12:30", value: 12800000 },
  { time: "13:00", value: 12880000 },
  { time: "13:30", value: 12920000 },
  { time: "14:00", value: 12860000 },
  { time: "14:30", value: 12990000 },
  { time: "15:00", value: 13100000 },
  { time: "15:30", value: 13080000 },
]

const PERIOD_TABS = ["1D", "1W", "1M", "3M", "1Y"]

interface PortfolioTabProps {
  holdings: Holding[]
  cash: number
  onBuy: (ticker: string, quantity: number, price: number) => void
  onSell: (ticker: string, quantity: number, price: number) => void
}

export function PortfolioTab({ holdings, cash, onBuy, onSell }: PortfolioTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("1D")
  const [hideBalance, setHideBalance] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Holding | null>(null)

  const stockValue = holdings.reduce((sum, h) => sum + h.price * h.shares, 0)
  const totalValue = stockValue + cash
  const totalInvested = holdings.reduce((sum, h) => sum + h.avgPrice * h.shares, 0)
  const totalGain = stockValue - totalInvested
  const totalGainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
  const isTotalUp = totalGain >= 0

  const todayGain = holdings.reduce((sum, h) => sum + h.change * h.shares, 0)
  const todayGainPct = stockValue > 0 ? (todayGain / (stockValue - todayGain)) * 100 : 0
  const todayIsUp = todayGain >= 0

  const mask = (val: string) => (hideBalance ? "•••••" : val)

  return (
    <>
      <div className="flex flex-col min-h-0">
        {/* Header */}
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
          {/*<button*/}
          {/*  className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"*/}
          {/*  aria-label="알림"*/}
          {/*>*/}
          {/*  <Bell className="w-[18px] h-[18px] text-foreground" strokeWidth={1.8} />*/}
          {/*</button>*/}
        </header>

        {/* ── Top Summary Card ─────────────────────────── */}
        <div className="mx-4 mb-4">
          <div className="bg-card rounded-2xl card-shadow p-5">
            {/* Total value */}
            <div className="flex items-start justify-between mb-1">
              <p className="text-[11px] text-muted-foreground">총 평가금액</p>
              <button
                onClick={() => setHideBalance(!hideBalance)}
                className="text-muted-foreground active:scale-95 transition-transform -mt-0.5"
                aria-label={hideBalance ? "금액 표시" : "금액 숨기기"}
              >
                {hideBalance
                  ? <EyeOff className="w-[15px] h-[15px]" />
                  : <Eye className="w-[15px] h-[15px]" />}
              </button>
            </div>

            <p className="text-[32px] font-bold text-foreground leading-none tracking-tight mb-2">
              {hideBalance ? "•••••••" : `₩${totalValue.toLocaleString()}`}
            </p>

            {/* Today's change */}
            <div className={cn("flex items-center gap-2 mb-4", holdings.length === 0 && "invisible")}>
              <span className={cn("flex items-center gap-0.5 text-sm font-semibold", todayIsUp ? "stock-up" : "stock-down")}>
                {todayIsUp
                  ? <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.2} />
                  : <TrendingDown className="w-3.5 h-3.5" strokeWidth={2.2} />}
                {hideBalance ? "•••" : `${todayIsUp ? "+" : ""}₩${todayGain.toLocaleString()}`}
              </span>
              <span className={cn("text-[11px] font-semibold px-1.5 py-0.5 rounded-md",
                todayIsUp ? "bg-stock-up-soft stock-up" : "bg-stock-down-soft stock-down")}>
                {todayIsUp ? "+" : ""}{todayGainPct.toFixed(2)}%
              </span>
              <span className="text-[11px] text-muted-foreground">오늘</span>
            </div>

            {/* Period selector */}
            {/*<div className="flex gap-1 mb-3">*/}
            {/*  {PERIOD_TABS.map((p) => (*/}
            {/*    <button*/}
            {/*      key={p}*/}
            {/*      onClick={() => setSelectedPeriod(p)}*/}
            {/*      className={cn(*/}
            {/*        "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all active:scale-95",*/}
            {/*        selectedPeriod === p*/}
            {/*          ? "bg-primary text-primary-foreground"*/}
            {/*          : "text-muted-foreground"*/}
            {/*      )}*/}
            {/*    >*/}
            {/*      {p}*/}
            {/*    </button>*/}
            {/*  ))}*/}
            {/*</div>*/}

            {/* Chart */}
            {/*<PortfolioChart data={PORTFOLIO_CHART_DATA} isUp={todayIsUp} />*/}

            {/* 3-stat row */}
            <div className="flex gap-0 mt-4 pt-4 border-t border-border">
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground mb-1">예수금</p>
                <p className="text-sm font-bold text-foreground tabular-nums">{mask(`₩${cash.toLocaleString()}`)}</p>
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground mb-1">총 손익</p>
                <p className={cn("text-sm font-bold tabular-nums", isTotalUp ? "stock-up" : "stock-down")}>
                  {mask(`${isTotalUp ? "+" : ""}₩${totalGain.toLocaleString()}`)}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground mb-1">수익률</p>
                <p className={cn("text-sm font-bold", isTotalUp ? "stock-up" : "stock-down")}>
                  {hideBalance ? "•••" : `${isTotalUp ? "+" : ""}${totalGainPct.toFixed(2)}%`}
                </p>
              </div>
            </div>
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
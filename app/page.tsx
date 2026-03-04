"use client"

import { useState, useMemo } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { PortfolioTab } from "@/components/portfolio-tab"
import { DiscoverTab } from "@/components/discover-tab"
import { DateNavigator } from "@/components/date-navigator"
import { cn } from "@/lib/utils"
import { ALL_STOCKS, INITIAL_HOLDINGS, INITIAL_CASH, type Holding } from "@/lib/stocks"
import { GAME_START, clamp, nextTradingDay, advanceWeek, advanceMonth, advanceYear, toTradingDay } from "@/lib/game-date"
import { useHistoricalData } from "@/hooks/use-historical-data"

type AdvanceType = 'day' | 'week' | 'month' | 'year'

const advanceFns = {
  day:   nextTradingDay,
  week:  advanceWeek,
  month: advanceMonth,
  year:  advanceYear,
}

export default function StockApp() {
  const [activeTab, setActiveTab] = useState<"portfolio" | "discover">("portfolio")
  const [holdings, setHoldings] = useState<Holding[]>(INITIAL_HOLDINGS)
  const [cash, setCash] = useState(INITIAL_CASH)
  const [gameDate, setGameDate] = useState<Date>(new Date(GAME_START))

  const { loading, priceMap, getPriceInfo, getIndexInfo, addExtraTicker } = useHistoricalData()
  const [extraStocks, setExtraStocks] = useState<import("@/lib/stocks").Stock[]>([])

  function handleAddExtraStock(stock: import("@/lib/stocks").Stock, yahooTicker: string) {
    setExtraStocks((prev) => prev.some((s) => s.ticker === stock.ticker) ? prev : [...prev, stock])
    addExtraTicker(stock.ticker, yahooTicker)
  }

  const allStocksWithExtra = useMemo(() => [...ALL_STOCKS, ...extraStocks], [extraStocks])

  // Stocks with real historical prices for the current gameDate
  const currentStocks = useMemo(() => {
    return allStocksWithExtra.map((s) => {
      const info = getPriceInfo(s.ticker, gameDate)
      return info ? { ...s, ...info } : s
    })
  }, [gameDate, priceMap, getPriceInfo, allStocksWithExtra])

  // Holdings with updated market prices
  const currentHoldings = useMemo(() => {
    return holdings.map((h) => {
      const stock = currentStocks.find((s) => s.ticker === h.ticker)
      return stock
        ? { ...h, price: stock.price, change: stock.change, changePct: stock.changePct, isUp: stock.isUp }
        : h
    })
  }, [holdings, currentStocks])

  function handleAdvance(type: AdvanceType) {
    setGameDate((prev) => clamp(advanceFns[type](prev)))
  }

  function handleJump(date: Date) {
    setGameDate(clamp(toTradingDay(date)))
  }

  function handleBuy(ticker: string, quantity: number, price: number) {
    const total = quantity * price
    setCash((prev) => prev - total)
    setHoldings((prev) => {
      const existing = prev.find((h) => h.ticker === ticker)
      if (existing) {
        const newShares = existing.shares + quantity
        const newAvgPrice = Math.round(
          (existing.avgPrice * existing.shares + price * quantity) / newShares
        )
        return prev.map((h) =>
          h.ticker === ticker ? { ...h, shares: newShares, avgPrice: newAvgPrice } : h
        )
      }
      const stock = currentStocks.find((s) => s.ticker === ticker)!
      return [...prev, { ...stock, shares: quantity, avgPrice: price }]
    })
  }

  function handleSell(ticker: string, quantity: number, price: number) {
    const total = quantity * price
    setCash((prev) => prev + total)
    setHoldings((prev) =>
      prev
        .map((h) => {
          if (h.ticker !== ticker) return h
          const newShares = h.shares - quantity
          return newShares <= 0 ? null : { ...h, shares: newShares }
        })
        .filter(Boolean) as Holding[]
    )
  }

  return (
    <main className="min-h-screen bg-background flex justify-center">
      {/* Phone frame wrapper */}
      <div className="relative w-full max-w-sm min-h-screen flex flex-col">
        {/* Fixed date navigator */}
        <DateNavigator gameDate={gameDate} onAdvance={handleAdvance} onJump={handleJump} loading={loading} />

        {/* Scrollable content area */}
        <div
          className={cn("flex-1 overflow-y-auto pb-24 pt-36", "scrollbar-hide")}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Animated tab panels */}
          <div
            className={cn(
              "transition-all duration-300",
              activeTab === "portfolio"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 pointer-events-none absolute inset-0"
            )}
            aria-hidden={activeTab !== "portfolio"}
          >
            {activeTab === "portfolio" && (
              <PortfolioTab
                holdings={currentHoldings}
                cash={cash}
                onBuy={handleBuy}
                onSell={handleSell}
              />
            )}
          </div>

          <div
            className={cn(
              "transition-all duration-300",
              activeTab === "discover"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 pointer-events-none absolute inset-0"
            )}
            aria-hidden={activeTab !== "discover"}
          >
            {activeTab === "discover" && (
              <DiscoverTab
                allStocks={currentStocks}
                holdings={currentHoldings}
                cash={cash}
                onBuy={handleBuy}
                onSell={handleSell}
                gameDate={gameDate}
                getIndexInfo={getIndexInfo}
                onAddExtraStock={handleAddExtraStock}
              />
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </main>
  )
}

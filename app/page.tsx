"use client"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { PortfolioTab } from "@/components/portfolio-tab"
import { DiscoverTab } from "@/components/discover-tab"
import { cn } from "@/lib/utils"
import { ALL_STOCKS, INITIAL_HOLDINGS, INITIAL_CASH, type Holding } from "@/lib/stocks"

export default function StockApp() {
  const [activeTab, setActiveTab] = useState<"portfolio" | "discover">("portfolio")
  const [holdings, setHoldings] = useState<Holding[]>(INITIAL_HOLDINGS)
  const [cash, setCash] = useState(INITIAL_CASH)

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
      const stock = ALL_STOCKS.find((s) => s.ticker === ticker)!
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
        {/* Scrollable content area */}
        <div
          className={cn("flex-1 overflow-y-auto pb-24", "scrollbar-hide")}
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
                holdings={holdings}
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
                allStocks={ALL_STOCKS}
                holdings={holdings}
                cash={cash}
                onBuy={handleBuy}
                onSell={handleSell}
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
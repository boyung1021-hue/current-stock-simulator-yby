"use client"

import { useState, useMemo, useEffect } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { PortfolioTab } from "@/components/portfolio-tab"
import { DiscoverTab } from "@/components/discover-tab"
import { RankingTab } from "@/components/ranking-tab"
import { AppHeader } from "@/components/app-header"
import { cn } from "@/lib/utils"
import { ALL_STOCKS, INITIAL_CASH, type Holding, type Stock } from "@/lib/stocks"
import { useRealPrices } from "@/hooks/use-real-prices"

const STORAGE_KEY = "stock-tracker-portfolio"

function loadPortfolio(): { holdings: Holding[]; cash: number } {
  if (typeof window === "undefined") return { holdings: [], cash: INITIAL_CASH }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        holdings: parsed.holdings ?? [],
        cash: typeof parsed.cash === "number" ? parsed.cash : INITIAL_CASH,
      }
    }
  } catch {}
  return { holdings: [], cash: INITIAL_CASH }
}

function savePortfolio(holdings: Holding[], cash: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ holdings, cash }))
  } catch {}
}

export default function StockApp() {
  const [activeTab, setActiveTab] = useState<"portfolio" | "discover" | "ranking">("portfolio")
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [cash, setCash] = useState(INITIAL_CASH)
  const [extraStocks, setExtraStocks] = useState<Stock[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const { holdings, cash } = loadPortfolio()
    setHoldings(holdings)
    setCash(cash)
    setHydrated(true)
  }, [])

  const { priceMap, loading, lastUpdated, refresh, getPriceInfo, getIndexInfo, addExtraTicker } =
    useRealPrices()

  const allStocksWithExtra = useMemo(
    () => [...ALL_STOCKS, ...extraStocks],
    [extraStocks]
  )

  // Stocks with real-time prices
  const currentStocks = useMemo(() => {
    return allStocksWithExtra.map((s) => {
      const info = getPriceInfo(s.ticker)
      return info
        ? { ...s, price: info.price, change: info.change, changePct: info.changePct, isUp: info.isUp, sparkData: info.sparkData }
        : s
    })
  }, [allStocksWithExtra, priceMap, getPriceInfo])

  // Holdings with updated market prices
  const currentHoldings = useMemo(() => {
    return holdings.map((h) => {
      const stock = currentStocks.find((s) => s.ticker === h.ticker)
      return stock
        ? { ...h, price: stock.price, change: stock.change, changePct: stock.changePct, isUp: stock.isUp, sparkData: stock.sparkData }
        : h
    })
  }, [holdings, currentStocks])

  function handleAddExtraStock(stock: Stock, yahooTicker: string) {
    setExtraStocks((prev) =>
      prev.some((s) => s.ticker === stock.ticker) ? prev : [...prev, { ...stock, yahooTicker }]
    )
    addExtraTicker(stock.ticker, yahooTicker)
  }

  function handleBuy(ticker: string, quantity: number, price: number) {
    const total = quantity * price
    const newCash = cash - total

    const existing = holdings.find((h) => h.ticker === ticker)
    let newHoldings: Holding[]

    if (existing) {
      const newShares = existing.shares + quantity
      const newAvgPrice = Math.round(
        (existing.avgPrice * existing.shares + price * quantity) / newShares
      )
      newHoldings = holdings.map((h) =>
        h.ticker === ticker ? { ...h, shares: newShares, avgPrice: newAvgPrice } : h
      )
    } else {
      const stock = currentStocks.find((s) => s.ticker === ticker)!
      newHoldings = [...holdings, { ...stock, shares: quantity, avgPrice: price }]
    }

    setCash(newCash)
    setHoldings(newHoldings)
    savePortfolio(newHoldings, newCash)
  }

  function handleSell(ticker: string, quantity: number, price: number) {
    const total = quantity * price
    const newCash = cash + total
    const newHoldings = holdings
      .map((h) => {
        if (h.ticker !== ticker) return h
        const newShares = h.shares - quantity
        return newShares <= 0 ? null : { ...h, shares: newShares }
      })
      .filter(Boolean) as Holding[]

    setCash(newCash)
    setHoldings(newHoldings)
    savePortfolio(newHoldings, newCash)
  }

  if (!hydrated) return null

  return (
    <main className="min-h-screen bg-background flex justify-center">
      {/* Phone frame wrapper */}
      <div className="relative w-full max-w-sm min-h-screen flex flex-col">
        {/* Fixed header */}
        <AppHeader loading={loading} lastUpdated={lastUpdated} onRefresh={refresh} />

        {/* Scrollable content area */}
        <div
          className={cn("flex-1 overflow-y-auto pb-24 pt-[130px]", "scrollbar-hide")}
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
                getIndexInfo={getIndexInfo}
                onAddExtraStock={handleAddExtraStock}
              />
            )}
          </div>

          <div
            className={cn(
              "transition-all duration-300",
              activeTab === "ranking"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 pointer-events-none absolute inset-0"
            )}
            aria-hidden={activeTab !== "ranking"}
          >
            {activeTab === "ranking" && <RankingTab />}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </main>
  )
}
"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { BottomNav } from "@/components/bottom-nav"

type TabId = "portfolio" | "discover" | "ranking"
import { PortfolioTab } from "@/components/portfolio-tab"
import { DiscoverTab } from "@/components/discover-tab"
import { RankingTab } from "@/components/ranking-tab"
import { LastUpdatedBar } from "@/components/last-updated-bar"
import { cn } from "@/lib/utils"
import { ALL_STOCKS, type Holding, type Stock } from "@/lib/stocks"
import { useHistoricalData } from "@/hooks/use-historical-data"
import {
  loadHoldings, loadCash, loadAssetHistory,
  saveHoldings, saveCash, saveAssetHistory,
  INITIAL_CASH, type StoredHolding,
} from "@/lib/local-storage"

export default function StockApp() {
  const [activeTab, setActiveTab] = useState<TabId>("portfolio")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // ── Persistent state from localStorage ─────────────────────────────
  const [storedHoldings, setStoredHoldings] = useState<StoredHolding[]>([])
  const [cash, setCash] = useState(INITIAL_CASH)
  const [assetHistory, setAssetHistory] = useState<number[]>([])

  // Load from localStorage on mount (client only)
  useEffect(() => {
    setStoredHoldings(loadHoldings())
    setCash(loadCash())
    setAssetHistory(loadAssetHistory())
  }, [])

  // ── Real-time price data ────────────────────────────────────────────
  const today = useMemo(() => new Date(), [])

  const { loading, priceMap, getPriceInfo, getIndexInfo, addExtraTicker } = useHistoricalData()

  const [extraStocks, setExtraStocks] = useState<Stock[]>([])

  function handleAddExtraStock(stock: Stock, yahooTicker: string) {
    setExtraStocks((prev) => prev.some((s) => s.ticker === stock.ticker) ? prev : [...prev, stock])
    addExtraTicker(stock.ticker, yahooTicker)
  }

  const allStocksWithExtra = useMemo(() => [...ALL_STOCKS, ...extraStocks], [extraStocks])

  // Stocks with real historical prices for today
  const currentStocks = useMemo(() => {
    return allStocksWithExtra.map((s) => {
      const info = getPriceInfo(s.ticker, today)
      return info ? { ...s, ...info } : s
    })
  }, [today, priceMap, getPriceInfo, allStocksWithExtra])

  // Convert StoredHoldings → Holding[] with live prices
  const currentHoldings = useMemo<Holding[]>(() => {
    return storedHoldings.map((h) => {
      const stock = currentStocks.find((s) => s.ticker === h.ticker)
      const base: Holding = {
        id: h.ticker.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0),
        ticker: h.ticker,
        name: h.name,
        nameKr: h.nameKr,
        logoColor: h.logoColor,
        initial: h.initial,
        shares: h.shares,
        avgPrice: h.avgPrice,
        price: 0,
        change: 0,
        changePct: 0,
        isUp: true,
        sparkData: [],
        chartData: [],
        high52w: 0,
        low52w: 0,
        marketCap: "---",
        per: "---",
        pbr: "---",
      }
      if (stock) {
        return { ...base, price: stock.price, change: stock.change, changePct: stock.changePct, isUp: stock.isUp, sparkData: stock.sparkData }
      }
      return base
    })
  }, [storedHoldings, currentStocks])

  // Mark lastUpdated when loading completes
  useEffect(() => {
    if (!loading) setLastUpdated(new Date())
  }, [loading])

  // Track total asset value history whenever prices update
  useEffect(() => {
    if (loading) return
    const stockVal = currentHoldings.reduce((sum, h) => sum + h.price * h.shares, 0)
    const total = stockVal + cash
    setAssetHistory((prev) => {
      const next = [...prev, total]
      saveAssetHistory(next)
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  // Refresh: re-fetch by remounting the hook is tricky, so we just update timestamp
  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  // ── Trade handlers ──────────────────────────────────────────────────
  function handleBuy(ticker: string, quantity: number, price: number) {
    const total = quantity * price
    const newCash = cash - total
    setCash(newCash)
    saveCash(newCash)

    setStoredHoldings((prev) => {
      const existing = prev.find((h) => h.ticker === ticker)
      let next: StoredHolding[]
      if (existing) {
        const newShares = existing.shares + quantity
        const newAvgPrice = Math.round(
          (existing.avgPrice * existing.shares + price * quantity) / newShares
        )
        next = prev.map((h) =>
          h.ticker === ticker ? { ...h, shares: newShares, avgPrice: newAvgPrice } : h
        )
      } else {
        const stock = currentStocks.find((s) => s.ticker === ticker)!
        const yahooTicker = extraStocks.find((s) => s.ticker === ticker)
          ? ticker  // fallback
          : ticker
        next = [...prev, {
          ticker,
          yahooTicker: yahooTicker,
          nameKr: stock.nameKr,
          name: stock.name,
          shares: quantity,
          avgPrice: price,
          logoColor: stock.logoColor,
          initial: stock.initial,
        }]
      }
      saveHoldings(next)
      return next
    })
  }

  function handleSell(ticker: string, quantity: number, price: number) {
    const total = quantity * price
    const newCash = cash + total
    setCash(newCash)
    saveCash(newCash)

    setStoredHoldings((prev) => {
      const next = prev
        .map((h) => {
          if (h.ticker !== ticker) return h
          const newShares = h.shares - quantity
          return newShares <= 0 ? null : { ...h, shares: newShares }
        })
        .filter(Boolean) as StoredHolding[]
      saveHoldings(next)
      return next
    })
  }

  return (
    <main className="min-h-screen bg-background flex justify-center">
      <div className="relative w-full max-w-sm min-h-screen flex flex-col">
        {/* Fixed header */}
        <LastUpdatedBar
          lastUpdated={lastUpdated}
          loading={loading}
          onRefresh={handleRefresh}
        />

        {/* Scrollable content area */}
        <div
          className={cn("flex-1 overflow-y-auto pb-24 pt-[120px]", "scrollbar-hide")}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Portfolio tab */}
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
                assetHistory={assetHistory}
                onBuy={handleBuy}
                onSell={handleSell}
              />
            )}
          </div>

          {/* Discover tab */}
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
                today={today}
                onAddExtraStock={handleAddExtraStock}
              />
            )}
          </div>

          {/* Ranking tab */}
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
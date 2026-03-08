"use client"

import { useMemo, useState, useEffect } from "react"
import { Search, TrendingUp, Loader2, Zap } from "lucide-react"
import { Sparkline } from "@/components/sparkline"
import { StockDetailSheet } from "@/components/stock-detail-sheet"
import { cn } from "@/lib/utils"
import type { Stock, Holding } from "@/lib/stocks"
import { searchStocks, type KoreanStock } from "@/lib/korean-stock-db"
import type { PriceInfo } from "@/hooks/use-real-prices"

function fmtValue(n: number, decimals: number): string {
  return n.toLocaleString("ko-KR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtChange(n: number, decimals: number): string {
  const sign = n >= 0 ? "+" : ""
  return `${sign}${n.toLocaleString("ko-KR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

function fmtPct(n: number): string {
  const sign = n >= 0 ? "+" : ""
  return `${sign}${n.toFixed(2)}%`
}

const STOCK_RANKS: Record<string, { rank: number; volume: string }> = {
  "005930": { rank: 1, volume: "15.2M" },
  "373220": { rank: 2, volume: "8.7M" },
  "000660": { rank: 3, volume: "6.3M" },
  "035420": { rank: 4, volume: "4.1M" },
  "035720": { rank: 5, volume: "3.8M" },
  "NVDA":   { rank: 6, volume: "42.1M" },
  "051910": { rank: 7, volume: "2.1M" },
}

const LEVERAGE_STOCKS = [
  { ticker: 'TQQQ', name: 'ProShares UltraPro QQQ' },
  { ticker: 'SOXL', name: 'Direxion Daily Semi Bull 3X' },
  { ticker: 'SQQQ', name: 'ProShares UltraPro Short QQQ' },
]

type ExtraPrice = { price: number; change: number; changePct: number; isUp: boolean } | null

const MARKET_TABS = ["전체", "상승", "하락"]

const EXTRA_LOGO_COLORS = [
  "bg-blue-400", "bg-purple-500", "bg-teal-500", "bg-orange-400",
  "bg-pink-500", "bg-indigo-500", "bg-cyan-500", "bg-amber-500",
]

function tickerColor(ticker: string): string {
  const hash = ticker.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return EXTRA_LOGO_COLORS[hash % EXTRA_LOGO_COLORS.length]
}

interface DiscoverTabProps {
  allStocks: Stock[]
  holdings: Holding[]
  cash: number
  onBuy: (ticker: string, quantity: number, price: number) => void
  onSell: (ticker: string, quantity: number, price: number) => void
  getIndexInfo: (yahooTicker: string) => PriceInfo | null
  onAddExtraStock: (stock: Stock, yahooTicker: string) => void
}

export function DiscoverTab({ allStocks, holdings, cash, onBuy, onSell, getIndexInfo, onAddExtraStock }: DiscoverTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [marketTab, setMarketTab] = useState("전체")
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)

  const marketIndices = useMemo(() => {
    const kospi = getIndexInfo('^KS11')
    const kosdaq = getIndexInfo('^KQ11')
    const usdkrw = getIndexInfo('KRW=X')

    return [
      {
        name: "KOSPI",
        value: kospi ? fmtValue(kospi.price, 2) : "---",
        change: kospi ? fmtChange(kospi.change, 2) : "---",
        changePct: kospi ? fmtPct(kospi.changePct) : "---",
        isUp: kospi?.isUp ?? true,
      },
      {
        name: "KOSDAQ",
        value: kosdaq ? fmtValue(kosdaq.price, 2) : "---",
        change: kosdaq ? fmtChange(kosdaq.change, 2) : "---",
        changePct: kosdaq ? fmtPct(kosdaq.changePct) : "---",
        isUp: kosdaq?.isUp ?? true,
      },
      {
        name: "USD/KRW",
        value: usdkrw ? fmtValue(usdkrw.price, 1) : "---",
        change: usdkrw ? fmtChange(usdkrw.change, 1) : "---",
        changePct: usdkrw ? fmtPct(usdkrw.changePct) : "---",
        isUp: usdkrw?.isUp ?? true,
      },
    ]
  }, [getIndexInfo])

  const rankedStocks = allStocks.filter((s) => STOCK_RANKS[s.ticker])

  const filteredStocks = (searchQuery ? allStocks : rankedStocks)
    .filter((s) =>
      s.nameKr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ticker.includes(searchQuery)
    )
    .filter((s) => {
      if (marketTab === "상승") return s.isUp
      if (marketTab === "하락") return !s.isUp
      return true
    })
    .sort((a, b) => {
      const rankA = STOCK_RANKS[a.ticker]?.rank ?? 99
      const rankB = STOCK_RANKS[b.ticker]?.rank ?? 99
      return rankA - rankB
    })

  const gameTickers = new Set(allStocks.map((s) => s.ticker))
  const extraResults = searchQuery.trim().length >= 1
    ? searchStocks(searchQuery.trim(), 10).filter((r) => !gameTickers.has(r.ticker))
    : []

  const [extraPrices, setExtraPrices] = useState<Map<string, ExtraPrice>>(new Map())
  const [priceLoading, setPriceLoading] = useState(false)
  const [leveragePrices, setLeveragePrices] = useState<Map<string, ExtraPrice>>(new Map())
  const [leverageLoading, setLeverageLoading] = useState(true)

  // Fetch leverage ETF prices on mount
  useEffect(() => {
    setLeverageLoading(true)
    Promise.all(
      LEVERAGE_STOCKS.map(async (s) => {
        try {
          const res = await fetch(`/api/price?symbol=${s.ticker}`)
          if (!res.ok) return [s.ticker, null] as const
          const data = await res.json()
          return [s.ticker, data as ExtraPrice] as const
        } catch {
          return [s.ticker, null] as const
        }
      })
    ).then((entries) => {
      setLeveragePrices(new Map(entries))
      setLeverageLoading(false)
    })
  }, [])

  // Fetch prices for extra search results
  useEffect(() => {
    if (extraResults.length === 0) { setExtraPrices(new Map()); return }
    setPriceLoading(true)
    Promise.all(
      extraResults.map(async (r) => {
        const yahooTicker =
          r.exchange === 'KOSPI' ? `${r.ticker}.KS`
          : r.exchange === 'KOSDAQ' ? `${r.ticker}.KQ`
          : r.ticker
        try {
          const res = await fetch(`/api/price?symbol=${yahooTicker}`)
          if (!res.ok) return [r.ticker, null] as const
          const data = await res.json()
          return [r.ticker, data as ExtraPrice] as const
        } catch {
          return [r.ticker, null] as const
        }
      })
    ).then((entries) => {
      setExtraPrices(new Map(entries))
      setPriceLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  function handleLeverageClick(s: typeof LEVERAGE_STOCKS[number]) {
    if (leverageLoading) return
    const priceInfo = leveragePrices.get(s.ticker)
    const stock: Stock = {
      id: s.ticker.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0),
      ticker: s.ticker,
      yahooTicker: s.ticker,
      name: s.name,
      nameKr: s.name,
      price: priceInfo?.price ?? 0,
      change: priceInfo?.change ?? 0,
      changePct: priceInfo?.changePct ?? 0,
      isUp: priceInfo?.isUp ?? true,
      sparkData: [],
      logoColor: tickerColor(s.ticker),
      initial: s.ticker.charAt(0),
      marketCap: "---",
      per: "---",
      pbr: "---",
    }
    onAddExtraStock(stock, s.ticker)
    setSelectedStock(stock)
  }

  function handleExtraResultClick(result: KoreanStock) {
    if (priceLoading) return
    const priceInfo = extraPrices.get(result.ticker)
    const yahooTicker =
      result.exchange === "KOSPI" ? `${result.ticker}.KS`
      : result.exchange === "KOSDAQ" ? `${result.ticker}.KQ`
      : result.ticker
    const stock: Stock = {
      id: result.ticker.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0),
      ticker: result.ticker,
      yahooTicker,
      name: result.name,
      nameKr: result.name,
      price: priceInfo?.price ?? 0,
      change: priceInfo?.change ?? 0,
      changePct: priceInfo?.changePct ?? 0,
      isUp: priceInfo?.isUp ?? true,
      sparkData: [],
      logoColor: tickerColor(result.ticker),
      initial: result.name.charAt(0),
      marketCap: "---",
      per: "---",
      pbr: "---",
    }
    onAddExtraStock(stock, yahooTicker)
    setSelectedStock(stock)
  }

  const selectedHolding = selectedStock
    ? holdings.find((h) => h.ticker === selectedStock.ticker)
    : undefined

  return (
    <>
      <div className="flex flex-col min-h-0">
        {/* Header */}
        <header className="px-5 pt-2 pb-4 bg-background">
          <h1 className="text-xl font-bold text-foreground mb-4">탐색</h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2} />
            <input
              type="text"
              placeholder="종목명 또는 코드 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              aria-label="Search stocks"
            />
          </div>
        </header>

        {/* Market Indices */}
        {!searchQuery && (
          <div className="px-4 mb-5">
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {marketIndices.map((idx) => (
                <div
                  key={idx.name}
                  className="bg-card rounded-2xl card-shadow p-3.5 flex-shrink-0 min-w-[120px]"
                >
                  <p className="text-xs text-muted-foreground mb-1">{idx.name}</p>
                  <p className="text-base font-bold text-foreground leading-none">{idx.value}</p>
                  <p className={cn("text-xs font-semibold mt-1", idx.isUp ? "stock-up" : "stock-down")}>
                    {idx.change} ({idx.changePct})
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hot Stocks */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-orange-500" strokeWidth={2.5} />
              </div>
              <h2 className="text-base font-bold text-foreground">
                {searchQuery ? "검색 결과" : "인기 종목"}
              </h2>
            </div>
            {!searchQuery && (
              <div className="flex gap-0.5 bg-secondary rounded-xl p-0.5">
                {MARKET_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMarketTab(tab)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-lg transition-all",
                      marketTab === tab
                        ? "bg-card text-foreground card-shadow"
                        : "text-muted-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl card-shadow overflow-hidden">
            {filteredStocks.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground text-sm">검색 결과가 없습니다</p>
              </div>
            ) : (
              filteredStocks.map((stock, index) => {
                const rank = STOCK_RANKS[stock.ticker]?.rank
                const isHeld = holdings.some((h) => h.ticker === stock.ticker)

                return (
                  <button
                    key={stock.id}
                    onClick={() => setSelectedStock(stock)}
                    className={cn(
                      "w-full px-4 py-3.5 flex items-center gap-3 active:bg-secondary transition-colors",
                      index < filteredStocks.length - 1 && "border-b border-border"
                    )}
                    aria-label={`${stock.nameKr} 매수/매도`}
                  >
                    <span className="text-xs font-bold text-muted-foreground w-4 text-center flex-shrink-0">
                      {rank ?? "-"}
                    </span>
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0", stock.logoColor)}>
                      {stock.initial}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground truncate">{stock.nameKr}</p>
                        {isHeld && (
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md flex-shrink-0">보유중</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{stock.ticker}</p>
                    </div>
                    <Sparkline data={stock.sparkData} width={56} height={28} isUp={stock.isUp} />
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-foreground">
                        {stock.price > 0 ? `₩${stock.price.toLocaleString()}` : '---'}
                      </p>
                      <p className={cn("text-xs font-semibold", stock.isUp ? "stock-up" : "stock-down")}>
                        {stock.price > 0 ? `${stock.isUp ? "+" : ""}${stock.changePct.toFixed(2)}%` : '---'}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Leverage ETFs */}
        {!searchQuery && (
          <div className="px-4 mb-4">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-5 h-5 rounded-md bg-purple-100 flex items-center justify-center">
                <Zap className="w-3 h-3 text-purple-500" strokeWidth={2.5} />
              </div>
              <h2 className="text-base font-bold text-foreground">레버리지</h2>
            </div>
            <div className="bg-card rounded-2xl card-shadow overflow-hidden">
              {LEVERAGE_STOCKS.map((s, index) => {
                const priceInfo = leveragePrices.get(s.ticker)
                const isHeld = holdings.some((h) => h.ticker === s.ticker)
                return (
                  <button
                    key={s.ticker}
                    onClick={() => handleLeverageClick(s)}
                    disabled={leverageLoading}
                    className={cn(
                      "w-full px-4 py-3.5 flex items-center gap-3 active:bg-secondary transition-colors",
                      index < LEVERAGE_STOCKS.length - 1 && "border-b border-border",
                      leverageLoading && "opacity-60 cursor-not-allowed"
                    )}
                    aria-label={`${s.name} 매수/매도`}
                  >
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0", tickerColor(s.ticker))}>
                      {s.ticker.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                        {isHeld && (
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md flex-shrink-0">보유중</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-xs text-muted-foreground">{s.ticker}</p>
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-purple-50 text-purple-600">NASDAQ</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 min-w-[64px]">
                      {leverageLoading ? (
                        <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin ml-auto" />
                      ) : priceInfo ? (
                        <>
                          <p className="text-sm font-bold text-foreground">${priceInfo.price.toFixed(2)}</p>
                          <p className={cn("text-xs font-semibold", priceInfo.isUp ? "stock-up" : "stock-down")}>
                            {priceInfo.isUp ? "+" : ""}{priceInfo.changePct.toFixed(2)}%
                          </p>
                        </>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">가격 없음</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Extra search results (global stocks) */}
        {searchQuery.trim().length >= 1 && extraResults.length > 0 && (
          <div className="px-4 mb-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Search className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-base font-bold text-foreground">전체 종목</h2>
            </div>
            <div className="bg-card rounded-2xl card-shadow overflow-hidden">
              {extraResults.map((result, index) => (
                <button
                  key={result.ticker}
                  onClick={() => handleExtraResultClick(result)}
                  disabled={priceLoading}
                  className={cn(
                    "w-full px-4 py-3.5 flex items-center gap-3 active:bg-secondary transition-colors",
                    index < extraResults.length - 1 && "border-b border-border",
                    priceLoading && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs", tickerColor(result.ticker))}>
                    {result.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{result.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-xs text-muted-foreground">{result.ticker}</p>
                      <span className={cn(
                        "text-[9px] font-bold px-1 py-0.5 rounded",
                        result.exchange === "KOSPI" ? "bg-blue-50 text-blue-600"
                        : result.exchange === "KOSDAQ" ? "bg-green-50 text-green-600"
                        : "bg-purple-50 text-purple-600"
                      )}>
                        {result.exchange}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 min-w-[64px]">
                    {priceLoading ? (
                      <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin ml-auto" />
                    ) : extraPrices.get(result.ticker) ? (
                      <>
                        <p className="text-sm font-bold text-foreground">
                          ₩{extraPrices.get(result.ticker)!.price.toLocaleString()}
                        </p>
                        <p className={cn("text-xs font-semibold", extraPrices.get(result.ticker)!.isUp ? "stock-up" : "stock-down")}>
                          {extraPrices.get(result.ticker)!.isUp ? "+" : ""}{extraPrices.get(result.ticker)!.changePct.toFixed(2)}%
                        </p>
                      </>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">가격 없음</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="h-6" />
      </div>

      {/* Stock Detail Sheet */}
      {selectedStock && (
        <StockDetailSheet
          stock={selectedStock}
          holding={selectedHolding ? { shares: selectedHolding.shares, avgPrice: selectedHolding.avgPrice } : undefined}
          cash={cash}
          onBuy={onBuy}
          onSell={onSell}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </>
  )
}
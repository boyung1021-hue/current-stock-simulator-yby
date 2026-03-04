"use client"

import { useMemo, useState, useEffect } from "react"
import { Search, TrendingUp, Loader2 } from "lucide-react"
import { Sparkline } from "@/components/sparkline"
import { StockDetailSheet } from "@/components/stock-detail-sheet"
import { cn } from "@/lib/utils"
import type { Stock, Holding } from "@/lib/stocks"
import { searchKoreanStocks } from "@/lib/korean-stock-db"

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


const MARKET_TABS = ["전체", "상승", "하락", "거래량"]

interface IndexInfo {
  value: number
  change: number
  changePct: number
  isUp: boolean
}

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
  gameDate: Date
  getIndexInfo: (yahooTicker: string, date: Date) => IndexInfo | null
  onAddExtraStock: (stock: Stock, yahooTicker: string) => void
}

export function DiscoverTab({ allStocks, holdings, cash, onBuy, onSell, gameDate, getIndexInfo, onAddExtraStock }: DiscoverTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [marketTab, setMarketTab] = useState("전체")
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)

  const marketIndices = useMemo(() => {
    const kospi = getIndexInfo('^KS11', gameDate)
    const kosdaq = getIndexInfo('^KQ11', gameDate)
    const usdkrw = getIndexInfo('KRW=X', gameDate)

    return [
      {
        name: "KOSPI",
        value: kospi ? fmtValue(kospi.value, 2) : "---",
        change: kospi ? fmtChange(kospi.change, 2) : "---",
        changePct: kospi ? fmtPct(kospi.changePct) : "---",
        isUp: kospi?.isUp ?? true,
      },
      {
        name: "KOSDAQ",
        value: kosdaq ? fmtValue(kosdaq.value, 2) : "---",
        change: kosdaq ? fmtChange(kosdaq.change, 2) : "---",
        changePct: kosdaq ? fmtPct(kosdaq.changePct) : "---",
        isUp: kosdaq?.isUp ?? true,
      },
      {
        name: "USD/KRW",
        value: usdkrw ? fmtValue(usdkrw.value, 1) : "---",
        change: usdkrw ? fmtChange(usdkrw.change, 1) : "---",
        changePct: usdkrw ? fmtPct(usdkrw.changePct) : "---",
        isUp: usdkrw?.isUp ?? true,
      },
    ]
  }, [gameDate, getIndexInfo])

  // Only show ranked stocks (those with a rank) in the hot list, unless searching
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

  // 게임에 없는 한국 주식 (로컬 DB 검색, 즉각 반응)
  const gameTickers = new Set(allStocks.map((s) => s.ticker))
  const extraResults = searchQuery.trim().length >= 1
    ? searchKoreanStocks(searchQuery.trim(), 10).filter((r) => !gameTickers.has(r.ticker))
    : []

  type ExtraPrice = { price: number; change: number; changePct: number; isUp: boolean } | null
  const [extraPrices, setExtraPrices] = useState<Map<string, ExtraPrice>>(new Map())
  const [priceLoading, setPriceLoading] = useState(false)

  const dateStr = useMemo(() => {
    const y = gameDate.getFullYear()
    const m = String(gameDate.getMonth() + 1).padStart(2, '0')
    const d = String(gameDate.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }, [gameDate])

  useEffect(() => {
    if (extraResults.length === 0) { setExtraPrices(new Map()); return }
    setPriceLoading(true)
    Promise.all(
      extraResults.map(async (r) => {
        const yahooTicker = r.exchange === 'KOSPI' ? `${r.ticker}.KS` : `${r.ticker}.KQ`
        try {
          const res = await fetch(`/api/stock-price?ticker=${yahooTicker}&date=${dateStr}`)
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
  }, [searchQuery, dateStr])

  function handleExtraResultClick(result: import("@/lib/korean-stock-db").KoreanStock) {
    const priceInfo = extraPrices.get(result.ticker)
    if (!priceInfo) return
    const yahooTicker = result.exchange === "KOSPI" ? `${result.ticker}.KS` : `${result.ticker}.KQ`
    const stock: Stock = {
      id: result.ticker.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0),
      ticker: result.ticker,
      name: result.name,
      nameKr: result.name,
      price: priceInfo.price,
      change: priceInfo.change,
      changePct: priceInfo.changePct,
      isUp: priceInfo.isUp,
      sparkData: Array(10).fill(priceInfo.price),
      chartData: [],
      logoColor: tickerColor(result.ticker),
      initial: result.name.charAt(0),
      high52w: priceInfo.price,
      low52w: priceInfo.price,
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

        {/* Theme Sectors */}
        {/*{!searchQuery && (*/}
        {/*  <div className="px-4 mb-5">*/}
        {/*    <div className="flex items-center justify-between mb-3">*/}
        {/*      <h2 className="text-base font-bold text-foreground">테마 섹터</h2>*/}
        {/*      <button className="flex items-center gap-0.5 text-xs text-muted-foreground active:scale-95 transition-transform">*/}
        {/*        전체보기 <ChevronRight className="w-3.5 h-3.5" />*/}
        {/*      </button>*/}
        {/*    </div>*/}
        {/*    <div className="grid grid-cols-3 gap-2.5">*/}
        {/*      {THEME_SECTORS.map((sector) => (*/}
        {/*        <button*/}
        {/*          key={sector.name}*/}
        {/*          className="bg-card rounded-2xl card-shadow p-3.5 text-left active:scale-[0.97] transition-transform"*/}
        {/*          aria-label={`${sector.name} sector`}*/}
        {/*        >*/}
        {/*          <div className={cn("inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold mb-2", sector.color)}>*/}
        {/*            {sector.name}*/}
        {/*          </div>*/}
        {/*          <p className="text-xs text-muted-foreground">{sector.count}개 종목</p>*/}
        {/*          <p className={cn("text-sm font-bold mt-0.5", sector.isUp ? "stock-up" : "stock-down")}>*/}
        {/*            {sector.change}*/}
        {/*          </p>*/}
        {/*        </button>*/}
        {/*      ))}*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*)}*/}

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
            {/* Tabs */}
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
                    {/* Rank */}
                    <span className="text-xs font-bold text-muted-foreground w-4 text-center flex-shrink-0">
                      {rank ?? "-"}
                    </span>

                    {/* Logo */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0",
                        stock.logoColor
                      )}
                    >
                      {stock.initial}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground truncate">{stock.nameKr}</p>
                        {isHeld && (
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md flex-shrink-0">
                            보유중
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{stock.ticker}</p>
                    </div>

                    {/* Sparkline */}
                    <Sparkline data={stock.sparkData} width={56} height={28} isUp={stock.isUp} />

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-foreground">
                        ₩{stock.price.toLocaleString()}
                      </p>
                      <p className={cn("text-xs font-semibold", stock.isUp ? "stock-up" : "stock-down")}>
                        {stock.isUp ? "+" : ""}{stock.changePct.toFixed(2)}%
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── 전체 종목 검색 결과 (게임 미지원 종목) ── */}
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
                  disabled={priceLoading || !extraPrices.get(result.ticker)}
                  className={cn(
                    "w-full px-4 py-3.5 flex items-center gap-3 active:bg-secondary transition-colors",
                    index < extraResults.length - 1 && "border-b border-border",
                    (priceLoading || !extraPrices.get(result.ticker)) && "opacity-60 cursor-not-allowed"
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
                        result.exchange === "KOSPI"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-green-50 text-green-600"
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
                      <span className="text-[10px] text-muted-foreground">조회 불가</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* News / Market Digest */}
        {/*{!searchQuery && (*/}
        {/*  <div className="px-4 mb-4">*/}
        {/*    <div className="flex items-center justify-between mb-3">*/}
        {/*      <h2 className="text-base font-bold text-foreground">오늘의 시장</h2>*/}
        {/*    </div>*/}
        {/*    <div className="flex flex-col gap-2.5">*/}
        {/*      {[*/}
        {/*        { headline: "반도체 수출 전월 대비 18% 급증", time: "14분 전", tag: "반도체" },*/}
        {/*        { headline: "미 연준, 금리 동결 시사 발언에 코스피 상승", time: "32분 전", tag: "거시경제" },*/}
        {/*        { headline: "LG에너지솔루션, 북미 배터리 공장 증설 발표", time: "1시간 전", tag: "2차전지" },*/}
        {/*      ].map((news, i) => (*/}
        {/*        <button*/}
        {/*          key={i}*/}
        {/*          className="bg-card rounded-2xl card-shadow p-4 text-left active:scale-[0.98] transition-transform"*/}
        {/*        >*/}
        {/*          <div className="flex items-start justify-between gap-3">*/}
        {/*            <div className="flex-1">*/}
        {/*              <span className="text-xs text-primary font-semibold bg-primary/8 px-2 py-0.5 rounded-md">*/}
        {/*                {news.tag}*/}
        {/*              </span>*/}
        {/*              <p className="text-sm font-semibold text-foreground mt-1.5 leading-snug text-balance">*/}
        {/*                {news.headline}*/}
        {/*              </p>*/}
        {/*              <p className="text-xs text-muted-foreground mt-1">{news.time}</p>*/}
        {/*            </div>*/}
        {/*            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />*/}
        {/*          </div>*/}
        {/*        </button>*/}
        {/*      ))}*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*)}*/}

        {/* Bottom padding for tab bar */}
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
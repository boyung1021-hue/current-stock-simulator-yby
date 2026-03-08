'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { YAHOO_TICKERS, USD_STOCKS } from '@/lib/stocks'

export interface PriceInfo {
  price: number
  prevClose: number
  change: number
  changePct: number
  isUp: boolean
  sparkData: number[]
}

type PriceMap = Map<string, PriceInfo>

const INDEX_YAHOO: Record<string, string> = {
  '^KS11': '^KS11',
  '^KQ11': '^KQ11',
  'KRW=X': 'KRW=X',
}

async function fetchPrice(symbol: string): Promise<PriceInfo | null> {
  try {
    const res = await fetch(`/api/price?symbol=${encodeURIComponent(symbol)}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export function useRealPrices() {
  const [priceMap, setPriceMap] = useState<PriceMap>(new Map())
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const dynamicRef = useRef<Record<string, string>>({})

  const doFetch = useCallback(async (extraTickers?: Record<string, string>) => {
    const all = { ...YAHOO_TICKERS, ...INDEX_YAHOO, ...(extraTickers ?? dynamicRef.current) }
    const entries = await Promise.all(
      Object.entries(all).map(async ([ticker, yahooTicker]) => {
        const info = await fetchPrice(yahooTicker)
        return [ticker, info] as const
      })
    )

    // Get KRW/USD rate for conversion
    const usdToKrw =
      entries.find(([t]) => t === 'KRW=X')?.[1]?.price ?? 1350

    const map = new Map<string, PriceInfo>()
    for (const [ticker, info] of entries) {
      if (!info) continue
      if (USD_STOCKS.has(ticker)) {
        const krwPrice = Math.round(info.price * usdToKrw)
        const krwPrev = Math.round(info.prevClose * usdToKrw)
        const krwChange = krwPrice - krwPrev
        const krwChangePct = krwPrev > 0 ? (krwChange / krwPrev) * 100 : 0
        map.set(ticker, {
          price: krwPrice,
          prevClose: krwPrev,
          change: krwChange,
          changePct: krwChangePct,
          isUp: krwChange >= 0,
          sparkData: info.sparkData.map((p) => Math.round(p * usdToKrw)),
        })
      } else {
        map.set(ticker, info)
      }
    }
    setPriceMap(map)
    setLastUpdated(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    doFetch()
  }, [doFetch])

  const refresh = useCallback(() => doFetch(), [doFetch])

  function addExtraTicker(ticker: string, yahooTicker: string) {
    if (YAHOO_TICKERS[ticker] || dynamicRef.current[ticker]) return
    dynamicRef.current = { ...dynamicRef.current, [ticker]: yahooTicker }
    fetchPrice(yahooTicker).then((info) => {
      if (info) {
        setPriceMap((prev) => new Map(prev).set(ticker, info))
      }
    })
  }

  function getPriceInfo(ticker: string): PriceInfo | null {
    return priceMap.get(ticker) ?? null
  }

  function getIndexInfo(yahooTicker: string): PriceInfo | null {
    return priceMap.get(yahooTicker) ?? null
  }

  return { priceMap, loading, lastUpdated, refresh, getPriceInfo, getIndexInfo, addExtraTicker }
}
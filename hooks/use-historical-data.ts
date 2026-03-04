'use client'

import { useState, useEffect, useCallback } from 'react'
import { YAHOO_TICKERS } from '@/lib/stocks'

export type DayPrice = { date: string; close: number }
type PriceMap = Map<string, DayPrice[]>

const INDEX_TICKERS = ['^KS11', '^KQ11', 'KRW=X']

function dateToStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function binarySearch(arr: DayPrice[], target: string): number {
  let lo = 0, hi = arr.length - 1, result = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid].date <= target) {
      result = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return result
}

export function useHistoricalData() {
  const [priceMap, setPriceMap] = useState<PriceMap>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tickers = [...Object.values(YAHOO_TICKERS), ...INDEX_TICKERS]

    Promise.all(
      tickers.map(async (ticker) => {
        try {
          const res = await fetch(`/api/stock-history?ticker=${ticker}`)
          if (!res.ok) return [ticker, []] as const
          const data: DayPrice[] = await res.json()
          return [ticker, data] as const
        } catch {
          return [ticker, []] as const
        }
      })
    ).then((entries) => {
      const map = new Map<string, DayPrice[]>()
      for (const [ticker, data] of entries) {
        if (Array.isArray(data) && data.length > 0) {
          map.set(ticker, data)
        }
      }
      setPriceMap(map)
      setLoading(false)
    })
  }, [])

  const getPriceInfo = useCallback(
    (ticker: string, date: Date): {
      price: number
      change: number
      changePct: number
      isUp: boolean
      sparkData: number[]
    } | null => {
      // Look up by yahoo ticker (e.g. "005930.KS")
      const yahooTicker = YAHOO_TICKERS[ticker]
      if (!yahooTicker) return null

      const arr = priceMap.get(yahooTicker)
      if (!arr || arr.length === 0) return null

      const targetStr = dateToStr(date)
      const idx = binarySearch(arr, targetStr)
      if (idx < 0) return null

      const current = arr[idx]
      const prev = idx > 0 ? arr[idx - 1] : null

      const price = current.close
      const change = prev ? price - prev.close : 0
      const changePct = prev && prev.close > 0 ? (change / prev.close) * 100 : 0
      const isUp = change >= 0

      // sparkData: last 10 trading days up to and including current
      const sparkData = arr
        .slice(Math.max(0, idx - 9), idx + 1)
        .map((d) => d.close)

      return { price, change, changePct, isUp, sparkData }
    },
    [priceMap]
  )

  const getIndexInfo = useCallback(
    (yahooTicker: string, date: Date): {
      value: number
      change: number
      changePct: number
      isUp: boolean
    } | null => {
      const arr = priceMap.get(yahooTicker)
      if (!arr || arr.length === 0) return null

      const targetStr = dateToStr(date)
      const idx = binarySearch(arr, targetStr)
      if (idx < 0) return null

      const current = arr[idx]
      const prev = idx > 0 ? arr[idx - 1] : null

      const value = current.close
      const change = prev ? value - prev.close : 0
      const changePct = prev && prev.close > 0 ? (change / prev.close) * 100 : 0
      const isUp = change >= 0

      return { value, change, changePct, isUp }
    },
    [priceMap]
  )

  return { loading, priceMap, getPriceInfo, getIndexInfo }
}

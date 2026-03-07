export interface StoredHolding {
  ticker: string
  yahooTicker: string // e.g. "005930.KS" or "NVDA"
  nameKr: string
  name: string
  shares: number
  avgPrice: number
  logoColor: string
  initial: string
}

const HOLDINGS_KEY = 'realstock_holdings'
const CASH_KEY     = 'realstock_cash'
const HISTORY_KEY  = 'realstock_history'

export const INITIAL_CASH = 1_000_000

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}

export const loadHoldings  = (): StoredHolding[] => safeGet(HOLDINGS_KEY, [])
export const loadCash      = (): number           => safeGet(CASH_KEY, INITIAL_CASH)
export const loadAssetHistory = (): number[]      => safeGet(HISTORY_KEY, [])

export function saveHoldings(h: StoredHolding[])  { localStorage.setItem(HOLDINGS_KEY, JSON.stringify(h)) }
export function saveCash(n: number)               { localStorage.setItem(CASH_KEY, JSON.stringify(n)) }
export function saveAssetHistory(h: number[])     { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-365))) }
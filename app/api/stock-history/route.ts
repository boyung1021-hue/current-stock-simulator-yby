import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

const yf = new YahooFinance()

function subDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() - n)
  return r
}

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')
  const period = req.nextUrl.searchParams.get('period') ?? '1M' // 1W | 1M | 3M | 1Y

  if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 })

  const now = new Date()
  const daysMap: Record<string, number> = { '1W': 7, '1M': 30, '3M': 90, '1Y': 365 }
  const days = daysMap[period] ?? 30

  try {
    const result = await yf.historical(ticker, {
      period1: subDays(now, days),
      period2: now,
      interval: '1d',
    })

    const data = result
      .filter((row) => row.close != null)
      .map((row) => {
        const d = row.date
        const y = d.getUTCFullYear()
        const m = String(d.getUTCMonth() + 1).padStart(2, '0')
        const day = String(d.getUTCDate()).padStart(2, '0')
        return { date: `${y}-${m}-${day}`, close: row.close! }
      })
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    })
  } catch (e) {
    console.error(`[stock-history] ${ticker}:`, e)
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}
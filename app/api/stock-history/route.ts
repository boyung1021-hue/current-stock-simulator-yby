import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

const yf = new YahooFinance()

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')
  if (!ticker) {
    return NextResponse.json({ error: 'ticker required' }, { status: 400 })
  }

  try {
    const result = await yf.historical(ticker, {
      period1: '2015-01-01',
      period2: '2025-12-31',
      interval: '1d',
    })

    const data = result
      .filter((row) => row.close != null)
      .map((row) => {
        const d = row.date
        const y = d.getUTCFullYear()
        const m = String(d.getUTCMonth() + 1).padStart(2, '0')
        const day = String(d.getUTCDate()).padStart(2, '0')
        return { date: `${y}-${m}-${day}`, close: Math.round(row.close!) }
      })
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=86400' },
    })
  } catch (e) {
    console.error(`Failed to fetch ${ticker}:`, e)
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}

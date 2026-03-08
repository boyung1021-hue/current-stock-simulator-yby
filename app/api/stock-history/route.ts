import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

const yf = new YahooFinance()

function periodToDates(period: string): { period1: string; period2: string } {
  const now = new Date()
  const period2 = now.toISOString().slice(0, 10)
  const start = new Date(now)

  switch (period) {
    case '1w':
      start.setDate(start.getDate() - 10)
      break
    case '3mo':
      start.setMonth(start.getMonth() - 3)
      break
    case '1y':
      start.setFullYear(start.getFullYear() - 1)
      break
    case '1mo':
    default:
      start.setMonth(start.getMonth() - 1)
      break
  }

  return { period1: start.toISOString().slice(0, 10), period2 }
}

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')
  const period = req.nextUrl.searchParams.get('period') ?? '1mo'

  if (!ticker) {
    return NextResponse.json({ error: 'ticker required' }, { status: 400 })
  }

  try {
    const { period1, period2 } = periodToDates(period)

    const result = await yf.historical(ticker, {
      period1,
      period2,
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
      headers: { 'Cache-Control': 'public, max-age=300' },
    })
  } catch (e) {
    console.error(`Failed to fetch ${ticker}:`, e)
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}
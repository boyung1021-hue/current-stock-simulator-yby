import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

const yf = new YahooFinance()

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')
  const date = req.nextUrl.searchParams.get('date') // YYYY-MM-DD

  if (!ticker || !date) {
    return NextResponse.json({ error: 'ticker and date required' }, { status: 400 })
  }

  try {
    const target = new Date(date + 'T00:00:00Z')
    const period1 = new Date(target)
    period1.setDate(period1.getDate() - 14) // 2주 전부터 (주말·공휴일 대비)
    const period2 = new Date(target)
    period2.setDate(period2.getDate() + 2)

    const result = await yf.historical(ticker, {
      period1: period1.toISOString().slice(0, 10),
      period2: period2.toISOString().slice(0, 10),
      interval: '1d',
    })

    const data = result
      .filter((r) => r.close != null)
      .map((row) => {
        const d = row.date
        const y = d.getUTCFullYear()
        const m = String(d.getUTCMonth() + 1).padStart(2, '0')
        const day = String(d.getUTCDate()).padStart(2, '0')
        return { date: `${y}-${m}-${day}`, close: Math.round(row.close!) }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      // date 이하의 가장 가까운 거래일
      .filter((r) => r.date <= date)

    if (data.length === 0) {
      return NextResponse.json({ error: 'no data' }, { status: 404 })
    }

    const latest = data[data.length - 1]
    const prev = data.length > 1 ? data[data.length - 2] : null
    const change = prev ? latest.close - prev.close : 0
    const changePct = prev && prev.close > 0 ? (change / prev.close) * 100 : 0

    return NextResponse.json(
      { price: latest.close, change, changePct, isUp: change >= 0 },
      { headers: { 'Cache-Control': 'public, max-age=86400' } }
    )
  } catch (e) {
    console.error(`Failed to fetch price for ${ticker}:`, e)
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}

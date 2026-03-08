import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

const yf = new YahooFinance()

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')

  if (!symbol) {
    return NextResponse.json({ error: 'symbol required' }, { status: 400 })
  }

  try {
    const now = new Date()
    const period1 = new Date(now)
    period1.setDate(period1.getDate() - 20) // 20일 전 (휴장일 대비)

    const result = await yf.historical(symbol, {
      period1: period1.toISOString().slice(0, 10),
      period2: now.toISOString().slice(0, 10),
      interval: '1d',
    })

    const data = result
      .filter((r) => r.close != null)
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    if (data.length === 0) {
      return NextResponse.json({ error: 'no data' }, { status: 404 })
    }

    const latest = data[data.length - 1]
    const prev = data.length > 1 ? data[data.length - 2] : null

    const price = latest.close!
    const prevClose = prev?.close ?? price
    const change = price - prevClose
    const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0
    const sparkData = data.slice(-10).map((d) => d.close!)

    return NextResponse.json(
      { price, prevClose, change, changePct, isUp: change >= 0, sparkData },
      { headers: { 'Cache-Control': 'public, max-age=300' } }
    )
  } catch (e) {
    console.error(`Failed to fetch price for ${symbol}:`, e)
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

const yf = new YahooFinance()

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')

  if (!symbol) {
    return NextResponse.json({ error: 'symbol required' }, { status: 400 })
  }

  try {
    const result = await yf.search(symbol, { newsCount: 8, quotesCount: 0 })
    const news = (result.news ?? []).map((n) => ({
      title: n.title,
      link: n.link,
      publisher: n.publisher,
      providerPublishTime: n.providerPublishTime,
    }))
    return NextResponse.json(news, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    })
  } catch (e) {
    console.error(`Failed to fetch news for ${symbol}:`, e)
    return NextResponse.json([], { status: 200 })
  }
}
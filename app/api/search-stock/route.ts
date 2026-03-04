import { NextRequest, NextResponse } from 'next/server'
import { searchKoreanStocks } from '@/lib/korean-stock-db'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  const results = searchKoreanStocks(q, 10)
  return NextResponse.json(results)
}

'use client'

import { useState, useEffect } from 'react'
import { mockRankings, mockMyRanking, type RankingEntry } from '@/lib/mock-ranking-data'

export type SortKey = 'totalValue' | 'profitRate'

interface UseRankingsReturn {
  rankings: RankingEntry[]
  myRanking: RankingEntry
  loading: boolean
  sortKey: SortKey
  setSortKey: (key: SortKey) => void
}

export function useRankings(): UseRankingsReturn {
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('totalValue')

  // 로딩 시뮬레이션 (Supabase 교체 시 실제 fetch로 대체)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const rankings = [...mockRankings].sort((a, b) => {
    if (sortKey === 'totalValue') return b.totalValue - a.totalValue
    return b.profitRate - a.profitRate
  }).map((entry, i) => ({ ...entry, rank: i + 1 }))

  return { rankings, myRanking: mockMyRanking, loading, sortKey, setSortKey }
}
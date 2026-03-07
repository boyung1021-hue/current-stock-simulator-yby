import { useMemo } from 'react'
import { mockRankings, mockMyRanking, type RankingEntry } from '@/lib/mock-ranking-data'

export type SortKey = 'totalValue' | 'profitRate'

export interface UseRankingsResult {
  rankings: RankingEntry[]
  myRanking: RankingEntry
  loading: boolean
}

// TODO: Supabase 연동 시 이 훅만 교체하면 됩니다.
// 예시:
// const { data } = await supabase.from('rankings').select('*').order('total_value', { ascending: false })
export function useRankings(sortKey: SortKey = 'totalValue'): UseRankingsResult {
  const rankings = useMemo(() => {
    const sorted = [...mockRankings].sort((a, b) =>
      sortKey === 'totalValue'
        ? b.totalValue - a.totalValue
        : b.profitRate - a.profitRate
    )
    return sorted.map((entry, i) => ({ ...entry, rank: i + 1 }))
  }, [sortKey])

  return { rankings, myRanking: mockMyRanking, loading: false }
}
export interface RankingEntry {
  rank: number
  userId: string
  displayName: string
  totalValue: number
  profitAmount: number
  profitRate: number
}

export const mockRankings: RankingEntry[] = [
  { rank:  1, userId: "user_01", displayName: "김삼성",   totalValue: 2340000, profitAmount:  1340000, profitRate:  134.0 },
  { rank:  2, userId: "user_02", displayName: "박애플",   totalValue: 1980000, profitAmount:   980000, profitRate:   98.0 },
  { rank:  3, userId: "user_03", displayName: "이테슬라", totalValue: 1750000, profitAmount:   750000, profitRate:   75.0 },
  { rank:  4, userId: "user_04", displayName: "최엔비",   totalValue: 1620000, profitAmount:   620000, profitRate:   62.0 },
  { rank:  5, userId: "user_05", displayName: "정카카오",  totalValue: 1530000, profitAmount:   530000, profitRate:   53.0 },
  { rank:  6, userId: "user_06", displayName: "강하이닉",  totalValue: 1450000, profitAmount:   450000, profitRate:   45.0 },
  { rank:  7, userId: "me",      displayName: "나",       totalValue: 1320000, profitAmount:   320000, profitRate:   32.0 },
  { rank:  8, userId: "user_08", displayName: "윤네이버",  totalValue: 1210000, profitAmount:   210000, profitRate:   21.0 },
  { rank:  9, userId: "user_09", displayName: "조배터리",  totalValue: 1180000, profitAmount:   180000, profitRate:   18.0 },
  { rank: 10, userId: "user_10", displayName: "임LG",     totalValue: 1140000, profitAmount:   140000, profitRate:   14.0 },
  { rank: 11, userId: "user_11", displayName: "신반도체",  totalValue: 1090000, profitAmount:    90000, profitRate:    9.0 },
  { rank: 12, userId: "user_12", displayName: "오코스피",  totalValue: 1060000, profitAmount:    60000, profitRate:    6.0 },
  { rank: 13, userId: "user_13", displayName: "한현대",   totalValue: 1020000, profitAmount:    20000, profitRate:    2.0 },
  { rank: 14, userId: "user_14", displayName: "권SK",     totalValue:  980000, profitAmount:   -20000, profitRate:   -2.0 },
  { rank: 15, userId: "user_15", displayName: "문카드",   totalValue:  940000, profitAmount:   -60000, profitRate:   -6.0 },
  { rank: 16, userId: "user_16", displayName: "류헬스",   totalValue:  890000, profitAmount:  -110000, profitRate:  -11.0 },
  { rank: 17, userId: "user_17", displayName: "백리츠",   totalValue:  820000, profitAmount:  -180000, profitRate:  -18.0 },
  { rank: 18, userId: "user_18", displayName: "심코스닥",  totalValue:  760000, profitAmount:  -240000, profitRate:  -24.0 },
  { rank: 19, userId: "user_19", displayName: "안ETF",    totalValue:  710000, profitAmount:  -290000, profitRate:  -29.0 },
  { rank: 20, userId: "user_20", displayName: "노주식",   totalValue:  640000, profitAmount:  -360000, profitRate:  -36.0 },
]

export const mockMyRanking: RankingEntry = {
  rank: 7, userId: "me", displayName: "나", totalValue: 1320000, profitAmount: 320000, profitRate: 32.0,
}
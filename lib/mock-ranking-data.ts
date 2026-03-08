export interface RankingEntry {
  rank: number
  userId: string
  displayName: string
  totalValue: number
  profitAmount: number
  profitRate: number
}

export const mockRankings: RankingEntry[] = [
  { rank:  1, userId: "user_01", displayName: "김삼성",    totalValue: 2_340_000, profitAmount:  1_340_000, profitRate: 134.0 },
  { rank:  2, userId: "user_02", displayName: "박애플",    totalValue: 1_980_000, profitAmount:    980_000, profitRate:  98.0 },
  { rank:  3, userId: "user_03", displayName: "이테슬라",  totalValue: 1_750_000, profitAmount:    750_000, profitRate:  75.0 },
  { rank:  4, userId: "user_04", displayName: "최엔비디아", totalValue: 1_620_000, profitAmount:    620_000, profitRate:  62.0 },
  { rank:  5, userId: "user_05", displayName: "정카카오",  totalValue: 1_510_000, profitAmount:    510_000, profitRate:  51.0 },
  { rank:  6, userId: "user_06", displayName: "강네이버",  totalValue: 1_440_000, profitAmount:    440_000, profitRate:  44.0 },
  { rank:  7, userId: "me",      displayName: "나",        totalValue: 1_320_000, profitAmount:    320_000, profitRate:  32.0 },
  { rank:  8, userId: "user_08", displayName: "윤하이닉스", totalValue: 1_210_000, profitAmount:    210_000, profitRate:  21.0 },
  { rank:  9, userId: "user_09", displayName: "조LG화학",  totalValue: 1_170_000, profitAmount:    170_000, profitRate:  17.0 },
  { rank: 10, userId: "user_10", displayName: "임현대차",  totalValue: 1_130_000, profitAmount:    130_000, profitRate:  13.0 },
  { rank: 11, userId: "user_11", displayName: "신삼성SDI", totalValue: 1_095_000, profitAmount:     95_000, profitRate:   9.5 },
  { rank: 12, userId: "user_12", displayName: "오포스코",  totalValue: 1_058_000, profitAmount:     58_000, profitRate:   5.8 },
  { rank: 13, userId: "user_13", displayName: "장SK이노",  totalValue: 1_024_000, profitAmount:     24_000, profitRate:   2.4 },
  { rank: 14, userId: "user_14", displayName: "권셀트리온", totalValue: 1_007_000, profitAmount:      7_000, profitRate:   0.7 },
  { rank: 15, userId: "user_15", displayName: "노기아",    totalValue:   974_000, profitAmount:    -26_000, profitRate:  -2.6 },
  { rank: 16, userId: "user_16", displayName: "류한전",    totalValue:   942_000, profitAmount:    -58_000, profitRate:  -5.8 },
  { rank: 17, userId: "user_17", displayName: "허두산",    totalValue:   890_000, profitAmount:   -110_000, profitRate: -11.0 },
  { rank: 18, userId: "user_18", displayName: "남고려",    totalValue:   831_000, profitAmount:   -169_000, profitRate: -16.9 },
  { rank: 19, userId: "user_19", displayName: "탁대우",    totalValue:   763_000, profitAmount:   -237_000, profitRate: -23.7 },
  { rank: 20, userId: "user_20", displayName: "민코오롱",  totalValue:   685_000, profitAmount:   -315_000, profitRate: -31.5 },
]

export const mockMyRanking: RankingEntry = {
  rank: 7,
  userId: "me",
  displayName: "나",
  totalValue: 1_320_000,
  profitAmount: 320_000,
  profitRate: 32.0,
}
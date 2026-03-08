export interface Stock {
  id: number
  ticker: string
  yahooTicker: string
  name: string
  nameKr: string
  price: number
  change: number
  changePct: number
  isUp: boolean
  sparkData: number[]
  logoColor: string
  initial: string
  marketCap: string
  per: string
  pbr: string
}

export interface Holding extends Stock {
  shares: number
  avgPrice: number
}

export const ALL_STOCKS: Stock[] = [
  {
    id: 1,
    ticker: '005930',
    yahooTicker: '005930.KS',
    name: 'Samsung Electronics',
    nameKr: '삼성전자',
    price: 0,
    change: 0,
    changePct: 0,
    isUp: true,
    sparkData: [],
    logoColor: 'bg-blue-500',
    initial: 'S',
    marketCap: '---',
    per: '---',
    pbr: '---',
  },
  {
    id: 2,
    ticker: '373220',
    yahooTicker: '373220.KS',
    name: 'LG Energy Solution',
    nameKr: 'LG에너지솔루션',
    price: 0,
    change: 0,
    changePct: 0,
    isUp: true,
    sparkData: [],
    logoColor: 'bg-red-500',
    initial: 'L',
    marketCap: '---',
    per: '---',
    pbr: '---',
  },
  {
    id: 3,
    ticker: '000660',
    yahooTicker: '000660.KS',
    name: 'SK Hynix',
    nameKr: 'SK하이닉스',
    price: 0,
    change: 0,
    changePct: 0,
    isUp: false,
    sparkData: [],
    logoColor: 'bg-orange-500',
    initial: 'K',
    marketCap: '---',
    per: '---',
    pbr: '---',
  },
  {
    id: 4,
    ticker: '035420',
    yahooTicker: '035420.KS',
    name: 'NAVER',
    nameKr: '네이버',
    price: 0,
    change: 0,
    changePct: 0,
    isUp: true,
    sparkData: [],
    logoColor: 'bg-green-500',
    initial: 'N',
    marketCap: '---',
    per: '---',
    pbr: '---',
  },
  {
    id: 5,
    ticker: '035720',
    yahooTicker: '035720.KS',
    name: 'Kakao',
    nameKr: '카카오',
    price: 0,
    change: 0,
    changePct: 0,
    isUp: false,
    sparkData: [],
    logoColor: 'bg-yellow-500',
    initial: 'K',
    marketCap: '---',
    per: '---',
    pbr: '---',
  },
  {
    id: 7,
    ticker: 'NVDA',
    yahooTicker: 'NVDA',
    name: 'NVIDIA',
    nameKr: '엔비디아',
    price: 0,
    change: 0,
    changePct: 0,
    isUp: true,
    sparkData: [],
    logoColor: 'bg-green-600',
    initial: 'N',
    marketCap: '---',
    per: '---',
    pbr: '---',
  },
  {
    id: 6,
    ticker: '051910',
    yahooTicker: '051910.KS',
    name: 'LG Chem',
    nameKr: 'LG화학',
    price: 0,
    change: 0,
    changePct: 0,
    isUp: false,
    sparkData: [],
    logoColor: 'bg-rose-500',
    initial: 'L',
    marketCap: '---',
    per: '---',
    pbr: '---',
  },
]

export const YAHOO_TICKERS: Record<string, string> = {
  '005930': '005930.KS',
  '373220': '373220.KS',
  '000660': '000660.KS',
  '035420': '035420.KS',
  '035720': '035720.KS',
  '051910': '051910.KS',
  'NVDA': 'NVDA',
}

/** USD 가격을 KRW로 환산이 필요한 종목 */
export const USD_STOCKS = new Set(['NVDA'])

export const INITIAL_HOLDINGS: Holding[] = []

export const INITIAL_CASH = 1_000_000
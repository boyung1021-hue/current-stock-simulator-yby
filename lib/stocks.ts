export interface Stock {
  id: number
  ticker: string
  name: string
  nameKr: string
  price: number
  change: number
  changePct: number
  isUp: boolean
  sparkData: number[]
  chartData: { time: string; value: number }[]
  logoColor: string
  initial: string
  high52w: number
  low52w: number
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
    ticker: "005930",
    name: "Samsung Electronics",
    nameKr: "삼성전자",
    price: 74800,
    change: 1200,
    changePct: 1.63,
    isUp: true,
    sparkData: [68000, 69200, 68800, 70100, 71500, 72000, 71800, 73200, 74000, 74800],
    chartData: [
      { time: "09:00", value: 68000 }, { time: "09:30", value: 69200 },
      { time: "10:00", value: 68800 }, { time: "10:30", value: 70100 },
      { time: "11:00", value: 71500 }, { time: "11:30", value: 72000 },
      { time: "12:00", value: 71800 }, { time: "12:30", value: 73200 },
      { time: "13:00", value: 74000 }, { time: "15:30", value: 74800 },
    ],
    logoColor: "bg-blue-500",
    initial: "S",
    high52w: 85600,
    low52w: 60400,
    marketCap: "446조",
    per: "18.2x",
    pbr: "1.4x",
  },
  {
    id: 2,
    ticker: "373220",
    name: "LG Energy Solution",
    nameKr: "LG에너지솔루션",
    price: 412000,
    change: 14000,
    changePct: 3.52,
    isUp: true,
    sparkData: [390000, 395000, 398000, 396000, 400000, 405000, 402000, 408000, 410000, 412000],
    chartData: [
      { time: "09:00", value: 390000 }, { time: "09:30", value: 395000 },
      { time: "10:00", value: 398000 }, { time: "10:30", value: 396000 },
      { time: "11:00", value: 400000 }, { time: "11:30", value: 405000 },
      { time: "12:00", value: 402000 }, { time: "12:30", value: 408000 },
      { time: "13:00", value: 410000 }, { time: "15:30", value: 412000 },
    ],
    logoColor: "bg-red-500",
    initial: "L",
    high52w: 530000,
    low52w: 318000,
    marketCap: "97조",
    per: "25.4x",
    pbr: "2.8x",
  },
  {
    id: 3,
    ticker: "000660",
    name: "SK Hynix",
    nameKr: "SK하이닉스",
    price: 188500,
    change: -2500,
    changePct: -1.31,
    isUp: false,
    sparkData: [192000, 191500, 193000, 190000, 189500, 191000, 188000, 189500, 187000, 188500],
    chartData: [
      { time: "09:00", value: 192000 }, { time: "09:30", value: 191500 },
      { time: "10:00", value: 193000 }, { time: "10:30", value: 190000 },
      { time: "11:00", value: 189500 }, { time: "11:30", value: 191000 },
      { time: "12:00", value: 188000 }, { time: "12:30", value: 189500 },
      { time: "13:00", value: 187000 }, { time: "15:30", value: 188500 },
    ],
    logoColor: "bg-orange-500",
    initial: "K",
    high52w: 210000,
    low52w: 152000,
    marketCap: "137조",
    per: "12.1x",
    pbr: "1.8x",
  },
  {
    id: 4,
    ticker: "035420",
    name: "NAVER",
    nameKr: "네이버",
    price: 215000,
    change: 4500,
    changePct: 2.14,
    isUp: true,
    sparkData: [198000, 201000, 205000, 202000, 207000, 210000, 208000, 212000, 214000, 215000],
    chartData: [
      { time: "09:00", value: 198000 }, { time: "09:30", value: 201000 },
      { time: "10:00", value: 205000 }, { time: "10:30", value: 202000 },
      { time: "11:00", value: 207000 }, { time: "11:30", value: 210000 },
      { time: "12:00", value: 208000 }, { time: "12:30", value: 212000 },
      { time: "13:00", value: 214000 }, { time: "15:30", value: 215000 },
    ],
    logoColor: "bg-green-500",
    initial: "N",
    high52w: 248000,
    low52w: 168000,
    marketCap: "35조",
    per: "31.4x",
    pbr: "2.1x",
  },
  {
    id: 5,
    ticker: "035720",
    name: "Kakao",
    nameKr: "카카오",
    price: 54300,
    change: -500,
    changePct: -0.92,
    isUp: false,
    sparkData: [56000, 55500, 55800, 54900, 55200, 54800, 54500, 54600, 54200, 54300],
    chartData: [
      { time: "09:00", value: 56000 }, { time: "09:30", value: 55500 },
      { time: "10:00", value: 55800 }, { time: "10:30", value: 54900 },
      { time: "11:00", value: 55200 }, { time: "11:30", value: 54800 },
      { time: "12:00", value: 54500 }, { time: "12:30", value: 54600 },
      { time: "13:00", value: 54200 }, { time: "15:30", value: 54300 },
    ],
    logoColor: "bg-yellow-500",
    initial: "K",
    high52w: 68000,
    low52w: 38200,
    marketCap: "23조",
    per: "44.6x",
    pbr: "1.6x",
  },
  {
    id: 6,
    ticker: "051910",
    name: "LG Chem",
    nameKr: "LG화학",
    price: 342000,
    change: -8000,
    changePct: -2.28,
    isUp: false,
    sparkData: [358000, 355000, 350000, 352000, 348000, 345000, 347000, 344000, 342000, 342000],
    chartData: [
      { time: "09:00", value: 358000 }, { time: "09:30", value: 355000 },
      { time: "10:00", value: 350000 }, { time: "10:30", value: 352000 },
      { time: "11:00", value: 348000 }, { time: "11:30", value: 345000 },
      { time: "12:00", value: 347000 }, { time: "12:30", value: 344000 },
      { time: "13:00", value: 342000 }, { time: "15:30", value: 342000 },
    ],
    logoColor: "bg-rose-500",
    initial: "L",
    high52w: 420000,
    low52w: 298000,
    marketCap: "24조",
    per: "22.8x",
    pbr: "0.9x",
  },
]

export const INITIAL_HOLDINGS: Holding[] = [
  { ...ALL_STOCKS[0], shares: 15, avgPrice: 68200 },
  { ...ALL_STOCKS[2], shares: 4, avgPrice: 175000 },
  { ...ALL_STOCKS[3], shares: 3, avgPrice: 198000 },
  { ...ALL_STOCKS[5], shares: 2, avgPrice: 358000 },
  { ...ALL_STOCKS[4], shares: 10, avgPrice: 48500 },
]

export const INITIAL_CASH = 5_000_000
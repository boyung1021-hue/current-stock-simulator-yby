/** 주요 상장 종목 검색용 데이터베이스 */
export type KoreanStock = {
  ticker: string    // 종목코드
  name: string      // 종목명
  exchange: 'KOSPI' | 'KOSDAQ' | 'NYSE' | 'NASDAQ'
}

export const GLOBAL_STOCK_DB: KoreanStock[] = [
  // ── KOSPI 시가총액 상위 ──────────────────────────────
  { ticker: '005930', name: '삼성전자', exchange: 'KOSPI' },
  { ticker: '000660', name: 'SK하이닉스', exchange: 'KOSPI' },
  { ticker: '373220', name: 'LG에너지솔루션', exchange: 'KOSPI' },
  { ticker: '207940', name: '삼성바이오로직스', exchange: 'KOSPI' },
  { ticker: '005380', name: '현대자동차', exchange: 'KOSPI' },
  { ticker: '000270', name: '기아', exchange: 'KOSPI' },
  { ticker: '051910', name: 'LG화학', exchange: 'KOSPI' },
  { ticker: '035420', name: 'NAVER', exchange: 'KOSPI' },
  { ticker: '035720', name: '카카오', exchange: 'KOSPI' },
  { ticker: '068270', name: '셀트리온', exchange: 'KOSPI' },
  { ticker: '005490', name: 'POSCO홀딩스', exchange: 'KOSPI' },
  { ticker: '105560', name: 'KB금융', exchange: 'KOSPI' },
  { ticker: '055550', name: '신한지주', exchange: 'KOSPI' },
  { ticker: '086790', name: '하나금융지주', exchange: 'KOSPI' },
  { ticker: '316140', name: '우리금융지주', exchange: 'KOSPI' },
  { ticker: '032830', name: '삼성생명', exchange: 'KOSPI' },
  { ticker: '003550', name: 'LG', exchange: 'KOSPI' },
  { ticker: '012330', name: '현대모비스', exchange: 'KOSPI' },
  { ticker: '028260', name: '삼성물산', exchange: 'KOSPI' },
  { ticker: '015760', name: '한국전력', exchange: 'KOSPI' },
  { ticker: '017670', name: 'SK텔레콤', exchange: 'KOSPI' },
  { ticker: '030200', name: 'KT', exchange: 'KOSPI' },
  { ticker: '096770', name: 'SK이노베이션', exchange: 'KOSPI' },
  { ticker: '034730', name: 'SK', exchange: 'KOSPI' },
  { ticker: '003670', name: '포스코퓨처엠', exchange: 'KOSPI' },
  { ticker: '009150', name: '삼성전기', exchange: 'KOSPI' },
  { ticker: '066570', name: 'LG전자', exchange: 'KOSPI' },
  { ticker: '018260', name: '삼성에스디에스', exchange: 'KOSPI' },
  { ticker: '010950', name: 'S-Oil', exchange: 'KOSPI' },
  { ticker: '011200', name: 'HMM', exchange: 'KOSPI' },
  { ticker: '000810', name: '삼성화재', exchange: 'KOSPI' },
  { ticker: '024110', name: '기업은행', exchange: 'KOSPI' },
  { ticker: '139480', name: '이마트', exchange: 'KOSPI' },
  { ticker: '004020', name: '현대제철', exchange: 'KOSPI' },
  { ticker: '010140', name: '삼성중공업', exchange: 'KOSPI' },
  { ticker: '009830', name: '한화솔루션', exchange: 'KOSPI' },
  { ticker: '042660', name: '한화오션', exchange: 'KOSPI' },
  { ticker: '267250', name: 'HD현대', exchange: 'KOSPI' },
  { ticker: '329180', name: 'HD현대중공업', exchange: 'KOSPI' },
  { ticker: '006400', name: '삼성SDI', exchange: 'KOSPI' },
  { ticker: '047050', name: '포스코인터내셔널', exchange: 'KOSPI' },
  { ticker: '000720', name: '현대건설', exchange: 'KOSPI' },
  { ticker: '011790', name: 'SKC', exchange: 'KOSPI' },
  { ticker: '028050', name: '삼성엔지니어링', exchange: 'KOSPI' },
  { ticker: '003490', name: '대한항공', exchange: 'KOSPI' },
  { ticker: '180640', name: '한진칼', exchange: 'KOSPI' },
  { ticker: '352820', name: '하이브', exchange: 'KOSPI' },
  { ticker: '041510', name: 'SM엔터테인먼트', exchange: 'KOSPI' },
  { ticker: '035900', name: 'JYP Ent.', exchange: 'KOSPI' },
  { ticker: '122630', name: 'KODEX 레버리지', exchange: 'KOSPI' },

  // ── 미국 주요 종목 ───────────────────────────────────
  { ticker: 'AAPL',  name: 'Apple',     exchange: 'NASDAQ' },
  { ticker: 'MSFT',  name: 'Microsoft', exchange: 'NASDAQ' },
  { ticker: 'NVDA',  name: 'NVIDIA',    exchange: 'NASDAQ' },
  { ticker: 'AMZN',  name: 'Amazon',    exchange: 'NASDAQ' },
  { ticker: 'GOOGL', name: 'Alphabet',  exchange: 'NASDAQ' },
  { ticker: 'META',  name: 'Meta',      exchange: 'NASDAQ' },
  { ticker: 'TSLA',  name: 'Tesla',     exchange: 'NASDAQ' },
  { ticker: 'GME',   name: 'GameStop',  exchange: 'NYSE'   },
  { ticker: 'NFLX',  name: 'Netflix',   exchange: 'NASDAQ' },
  { ticker: 'ZM',    name: 'Zoom',      exchange: 'NASDAQ' },
  { ticker: 'PTON',  name: 'Peloton',   exchange: 'NASDAQ' },
  { ticker: 'SPY',   name: 'SPDR S&P 500 ETF', exchange: 'NYSE' },
  { ticker: 'QQQ',   name: 'Invesco QQQ ETF',       exchange: 'NASDAQ' },
  { ticker: 'TQQQ',  name: 'ProShares UltraPro QQQ', exchange: 'NASDAQ' },
  { ticker: 'SOXL',  name: 'Direxion Daily Semi Bull 3X', exchange: 'NYSE' },
  { ticker: 'SQQQ',  name: 'ProShares UltraPro Short QQQ', exchange: 'NASDAQ' },

  // ── KOSDAQ 시가총액 상위 ─────────────────────────────
  { ticker: '247540', name: '에코프로비엠', exchange: 'KOSDAQ' },
  { ticker: '086520', name: '에코프로', exchange: 'KOSDAQ' },
  { ticker: '323410', name: '카카오뱅크', exchange: 'KOSDAQ' },
  { ticker: '035760', name: 'CJ ENM', exchange: 'KOSDAQ' },
  { ticker: '196170', name: '알테오젠', exchange: 'KOSDAQ' },
  { ticker: '091990', name: '셀트리온헬스케어', exchange: 'KOSDAQ' },
  { ticker: '263750', name: '펄어비스', exchange: 'KOSDAQ' },
  { ticker: '293490', name: '카카오게임즈', exchange: 'KOSDAQ' },
  { ticker: '112040', name: '위메이드', exchange: 'KOSDAQ' },
  { ticker: '041960', name: '코미팜', exchange: 'KOSDAQ' },
  { ticker: '357780', name: '솔브레인', exchange: 'KOSDAQ' },
  { ticker: '095340', name: 'ISC', exchange: 'KOSDAQ' },
  { ticker: '145020', name: '휴젤', exchange: 'KOSDAQ' },
  { ticker: '039030', name: '이오테크닉스', exchange: 'KOSDAQ' },
  { ticker: '214150', name: '클래시스', exchange: 'KOSDAQ' },
  { ticker: '058470', name: '리노공업', exchange: 'KOSDAQ' },
  { ticker: '237690', name: '에스티팜', exchange: 'KOSDAQ' },
  { ticker: '031980', name: '피에스케이', exchange: 'KOSDAQ' },
  { ticker: '096530', name: '씨젠', exchange: 'KOSDAQ' },
  { ticker: '403870', name: 'HPSP', exchange: 'KOSDAQ' },
]

/** 쿼리로 종목 검색 (한글명·티커코드 모두 지원) */
export function searchStocks(query: string, limit = 10): KoreanStock[] {
  const q = query.trim().toLowerCase()
  if (q.length < 1) return []

  return GLOBAL_STOCK_DB
    .filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.ticker.includes(q)
    )
    .slice(0, limit)
}

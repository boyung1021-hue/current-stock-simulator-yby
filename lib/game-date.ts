export const GAME_START = new Date('2015-01-05')
export const GAME_END   = new Date('2025-12-31')

function isWeekend(d: Date): boolean {
  const day = d.getDay()
  return day === 0 || day === 6
}

function nextWeekday(d: Date): Date {
  const result = new Date(d)
  while (isWeekend(result)) {
    result.setDate(result.getDate() + 1)
  }
  return result
}

export function nextTradingDay(date: Date): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + 1)
  return nextWeekday(result)
}

export function advanceWeek(date: Date): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + 7)
  return nextWeekday(result)
}

export function advanceMonth(date: Date): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + 1)
  return nextWeekday(result)
}

export function advanceYear(date: Date): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + 1)
  return nextWeekday(result)
}

export function clamp(date: Date): Date {
  if (date < GAME_START) return new Date(GAME_START)
  if (date > GAME_END)   return new Date(GAME_END)
  return date
}

/** 주말이면 다음 월요일로 이동, 아니면 그대로 */
export function toTradingDay(date: Date): Date {
  const result = new Date(date)
  while (isWeekend(result)) {
    result.setDate(result.getDate() + 1)
  }
  return result
}

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

export function formatGameDate(date: Date): {
  year: number
  month: number
  day: number
  weekday: string
} {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    weekday: WEEKDAY_NAMES[date.getDay()],
  }
}

export function gameProgress(date: Date): number {
  const total = GAME_END.getTime() - GAME_START.getTime()
  const elapsed = date.getTime() - GAME_START.getTime()
  return Math.min(100, Math.max(0, (elapsed / total) * 100))
}

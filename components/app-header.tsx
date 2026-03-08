'use client'

import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  loading: boolean
  lastUpdated: Date | null
  onRefresh: () => void
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(date: Date): { year: number; month: number; day: number; weekday: string } {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    weekday: days[date.getDay()],
  }
}

export function AppHeader({ loading, lastUpdated, onRefresh }: AppHeaderProps) {
  const today = new Date()
  const { year, month, day, weekday } = formatDate(today)

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-sm bg-background/95 backdrop-blur-sm border-b border-border pointer-events-auto">
        <div className="px-5 pt-12 pb-4">
          {/* Date row */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold text-foreground">
                {year}년 {month}월 {day}일
              </p>
              <span className="text-sm font-medium text-muted-foreground">({weekday})</span>
            </div>

            {/* Refresh button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-muted-foreground text-xs font-medium active:scale-95 transition-all disabled:opacity-50"
              aria-label="가격 새로고침"
            >
              <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} strokeWidth={2.5} />
              새로고침
            </button>
          </div>

          {/* Last updated */}
          <p className="text-xs text-muted-foreground mt-1.5">
            {loading
              ? '가격 불러오는 중...'
              : lastUpdated
              ? `마지막 업데이트: ${formatTime(lastUpdated)}`
              : '업데이트 대기 중'}
          </p>
        </div>
      </div>
    </div>
  )
}
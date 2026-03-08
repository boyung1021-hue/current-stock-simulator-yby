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
        <div className="px-5 pt-12 pb-3">
          <div className="flex items-center justify-between">
            {/* Date */}
            <div>
              <div className="flex items-baseline gap-1.5">
                <p className="text-[17px] font-bold text-foreground">
                  {year}년 {month}월 {day}일
                </p>
                <span className="text-[13px] font-medium text-muted-foreground">({weekday})</span>
              </div>
              {/* Last updated */}
              <p style={{ fontSize: 12, color: '#aaaaaa', marginTop: 3 }}>
                {loading
                  ? '가격 불러오는 중...'
                  : lastUpdated
                  ? `마지막 업데이트: ${formatTime(lastUpdated)}`
                  : '업데이트 대기 중'}
              </p>
            </div>

            {/* Refresh icon button — icon only, generous touch area */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center justify-center w-11 h-11 rounded-full active:bg-secondary transition-colors disabled:opacity-40"
              aria-label="가격 새로고침"
            >
              <RefreshCw
                className={cn('text-muted-foreground', loading && 'animate-spin')}
                style={{ width: 20, height: 20 }}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
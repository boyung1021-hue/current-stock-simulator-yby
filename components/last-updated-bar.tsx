'use client'

import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LastUpdatedBarProps {
  lastUpdated: Date | null
  loading: boolean
  onRefresh: () => void
}

function fmt(d: Date): string {
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export function LastUpdatedBar({ lastUpdated, loading, onRefresh }: LastUpdatedBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-sm bg-background/95 backdrop-blur-sm border-b border-border pointer-events-auto">
        <div className="px-5 pt-12 pb-3 flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-foreground">내 주식</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lastUpdated ? `마지막 업데이트: ${fmt(lastUpdated)}` : '업데이트 중...'}
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
            aria-label="새로고침"
          >
            <RefreshCw className={cn('w-4 h-4 text-foreground', loading && 'animate-spin')} />
          </button>
        </div>
      </div>
    </div>
  )
}
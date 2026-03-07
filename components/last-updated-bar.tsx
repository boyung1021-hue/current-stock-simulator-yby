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
        <div className="px-5 pt-12 pb-3.5 flex items-center justify-between">
          <div>
            <p className="text-[24px] font-bold leading-tight text-foreground">내 주식</p>
            <p className="text-[12px] mt-0.5" style={{ color: '#aaa' }}>
              {lastUpdated ? `마지막 업데이트: ${fmt(lastUpdated)}` : '업데이트 중...'}
            </p>
          </div>
          {/* 터치 영역 확보 + 아이콘은 작게 */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
            aria-label="새로고침"
          >
            <RefreshCw className={cn('w-[18px] h-[18px] text-muted-foreground', loading && 'animate-spin')} />
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useRef } from 'react'
import { GAME_END, GAME_START, formatGameDate, gameProgress } from '@/lib/game-date'
import { cn } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'

type AdvanceType = 'day' | 'week' | 'month' | 'year'

interface DateNavigatorProps {
  gameDate: Date
  onAdvance: (type: AdvanceType) => void
  onJump: (date: Date) => void
  loading: boolean
}

const BUTTONS: { label: string; type: AdvanceType }[] = [
  { label: '+1일', type: 'day' },
  { label: '+1주', type: 'week' },
  { label: '+1달', type: 'month' },
  { label: '+1년', type: 'year' },
]

function toInputValue(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function DateNavigator({ gameDate, onAdvance, onJump, loading }: DateNavigatorProps) {
  const { year, month, day, weekday } = formatGameDate(gameDate)
  const progress = gameProgress(gameDate)
  const isAtEnd = gameDate >= GAME_END
  const disabled = loading || isAtEnd
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.value) return
    // ISO 날짜 문자열로 파싱 → UTC midnight, 타임존 안전
    const picked = new Date(e.target.value + 'T00:00:00')
    onJump(picked)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-sm bg-background/95 backdrop-blur-sm border-b border-border pointer-events-auto">
        <div className="px-5 pt-12 pb-3">
          {/* Year label */}
          <p className="text-xs text-muted-foreground mb-0.5">{year}년</p>

          {/* Main date (클릭 → date picker) + progress chip */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => inputRef.current?.showPicker?.() ?? inputRef.current?.click()}
              className="flex items-center gap-1.5 group active:scale-95 transition-transform"
              aria-label="날짜 선택"
            >
              <p className="text-xl font-bold text-foreground">
                {month}월 {day}일{' '}
                <span className="text-base font-medium text-muted-foreground">({weekday})</span>
              </p>
              <CalendarDays className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
            </button>

            <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Hidden date input */}
          <input
            ref={inputRef}
            type="date"
            min={toInputValue(GAME_START)}
            max={toInputValue(GAME_END)}
            value={toInputValue(gameDate)}
            onChange={handleDateChange}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          />

          {/* Advance buttons */}
          {/*<div className="flex gap-1.5 mb-2.5">*/}
          {/*  {BUTTONS.map(({ label, type }) => (*/}
          {/*    <button*/}
          {/*      key={type}*/}
          {/*      onClick={() => onAdvance(type)}*/}
          {/*      disabled={disabled}*/}
          {/*      className={cn(*/}
          {/*        'flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all active:scale-95',*/}
          {/*        disabled*/}
          {/*          ? 'bg-secondary text-muted-foreground opacity-50 cursor-not-allowed'*/}
          {/*          : 'bg-primary text-primary-foreground'*/}
          {/*      )}*/}
          {/*    >*/}
          {/*      {label}*/}
          {/*    </button>*/}
          {/*  ))}*/}
          {/*</div>*/}

          {/* Progress bar */}
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[9px] text-muted-foreground">2015</span>
            <span className="text-[9px] text-muted-foreground">2025</span>
          </div>
        </div>
      </div>
    </div>
  )
}

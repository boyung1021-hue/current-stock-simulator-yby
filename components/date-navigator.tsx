'use client'

import { useRef } from 'react'
import { GAME_END, GAME_START, formatGameDate, gameProgress } from '@/lib/game-date'
import { cn } from '@/lib/utils'
import { Zap, Pause, Play } from 'lucide-react'

type AdvanceType = 'day' | 'week' | 'month' | 'year'

interface DateNavigatorProps {
  gameDate: Date
  onAdvance: (type: AdvanceType) => void
  onJump: (date: Date) => void
  loading: boolean
  countdown: number
  autoAdvancing: boolean
  onToggleAutoAdvance: () => void
}

const YEAR_TICKS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
const TOTAL_YEARS = 10 // 2015 ~ 2025

function toInputValue(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function DateNavigator({
  gameDate, onAdvance, onJump, loading, countdown, autoAdvancing, onToggleAutoAdvance,
}: DateNavigatorProps) {
  const { year, month, day, weekday } = formatGameDate(gameDate)
  const progress = gameProgress(gameDate)
  const isAtEnd = gameDate >= GAME_END
  const disabled = loading || isAtEnd
  const inputRef = useRef<HTMLInputElement>(null)

  // Bubble position: clamp so label stays within bounds
  const bubblePct = Math.max(4, Math.min(progress, 94))

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.value) return
    const picked = new Date(e.target.value + 'T00:00:00')
    onJump(picked)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-sm bg-background/95 backdrop-blur-sm border-b border-border pointer-events-auto">
        <div className="px-5 pt-12 pb-3">

          {/* Date row */}
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-xl font-bold text-foreground">
              {year}년 {month}월 {day}일
            </p>
            <span className="text-sm font-medium text-muted-foreground">({weekday})</span>
            <span className="ml-auto text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Time Slip button — above timeline bar */}
          {!isAtEnd && (
            <div className="flex justify-end mb-2">
              <button
                onClick={() => inputRef.current?.showPicker?.() ?? inputRef.current?.click()}
                disabled={disabled}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500 text-white text-[11px] font-bold active:scale-95 transition-all shadow-sm shadow-violet-300/60 disabled:opacity-50"
                aria-label="타임 슬립 — 날짜 선택"
              >
                <Zap className="w-3 h-3" strokeWidth={2.5} />
                타임 슬립
              </button>
            </div>
          )}

          {/* ── Timeline bar (full width) ────────────── */}
          <div className="relative mb-1" style={{ paddingTop: 20 }}>

            {/* Bubble label above dot */}
            <div
              className="absolute top-0 flex flex-col items-center pointer-events-none"
              style={{ left: `${bubblePct}%`, transform: 'translateX(-50%)' }}
            >
              <div className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-[3px] rounded-md whitespace-nowrap leading-none shadow-sm">
                {year}.{String(month).padStart(2, '0')}
              </div>
              <div className="w-px h-[5px] bg-primary/60" />
            </div>

            {/* Track */}
            <div className="relative h-[6px] bg-secondary rounded-full">
              {/* Gradient fill */}
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, oklch(0.45 0.22 260), oklch(0.62 0.24 285))',
                  boxShadow: '0 0 8px 1px oklch(0.52 0.22 260 / 0.45)',
                }}
              />
              {/* Year tick marks */}
              {YEAR_TICKS.map((yr) => (
                <div
                  key={yr}
                  className="absolute inset-y-0 w-px bg-background/75"
                  style={{ left: `${((yr - 2015) / TOTAL_YEARS) * 100}%` }}
                />
              ))}
              {/* Dot marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[14px] h-[14px] rounded-full bg-white ring-2 ring-primary"
                style={{ left: `${progress}%`, boxShadow: '0 0 6px oklch(0.52 0.22 260 / 0.5)' }}
              />
            </div>
          </div>

          {/* Year labels */}
          <div className="flex items-center mb-2.5">
            <span className="text-[9px] text-muted-foreground">2015</span>
            {YEAR_TICKS.map((yr) => (
              <span key={yr} className="flex-1 text-center text-[9px] text-muted-foreground/50">
                {String(yr).slice(2)}
              </span>
            ))}
            <span className="text-[9px] text-muted-foreground">2025</span>
          </div>

          {/* Hidden date input */}
          <input
            ref={inputRef}
            type="date"
            min={toInputValue(gameDate)}
            max={toInputValue(GAME_END)}
            value={toInputValue(gameDate)}
            onChange={handleDateChange}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          />

          {/* Auto-advance timer */}
          {isAtEnd ? (
            <div className="flex items-center justify-center py-1.5 rounded-xl bg-primary/10">
              <span className="text-xs font-bold text-primary">🎉 게임 종료</span>
            </div>
          ) : (
            <button
              onClick={onToggleAutoAdvance}
              disabled={loading}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all active:scale-[0.98]",
                autoAdvancing ? "bg-orange-50 border border-orange-200" : "bg-secondary border border-transparent"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                autoAdvancing ? "bg-orange-400 text-white" : "bg-muted-foreground/20 text-muted-foreground"
              )}>
                {autoAdvancing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-[11px] font-semibold", autoAdvancing ? "text-orange-600" : "text-muted-foreground")}>
                    {autoAdvancing ? "자동 진행 중" : "일시정지"}
                  </span>
                  <span className={cn("text-[11px] font-bold tabular-nums", autoAdvancing ? "text-orange-500" : "text-muted-foreground")}>
                    {autoAdvancing ? `${countdown}s → +1년` : "—"}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-linear",
                      autoAdvancing ? "bg-orange-400" : "bg-muted-foreground/30"
                    )}
                    style={{ width: autoAdvancing ? `${(countdown / 30) * 100}%` : "100%" }}
                  />
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
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

export function DateNavigator({ gameDate, onAdvance, onJump, loading, countdown, autoAdvancing, onToggleAutoAdvance }: DateNavigatorProps) {
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

          {/* Date + Time Slip button */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xl font-bold text-foreground">
              {month}월 {day}일{' '}
              <span className="text-base font-medium text-muted-foreground">({weekday})</span>
            </p>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {Math.round(progress)}%
              </span>

              {/* 타임 슬립 버튼 */}
              {!isAtEnd && (
                <button
                  onClick={() => inputRef.current?.showPicker?.() ?? inputRef.current?.click()}
                  disabled={disabled}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500 text-white text-[11px] font-bold active:scale-95 transition-all shadow-sm shadow-violet-300 disabled:opacity-50"
                  aria-label="타임 슬립 — 날짜 선택"
                >
                  <Zap className="w-3 h-3" strokeWidth={2.5} />
                  타임 슬립
                </button>
              )}
            </div>
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

          {/* Game progress bar */}
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-0.5 mb-2.5">
            <span className="text-[9px] text-muted-foreground">2015</span>
            <span className="text-[9px] text-muted-foreground">2025</span>
          </div>

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
              {/* Play/Pause icon */}
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                autoAdvancing ? "bg-orange-400 text-white" : "bg-muted-foreground/20 text-muted-foreground"
              )}>
                {autoAdvancing
                  ? <Pause className="w-3.5 h-3.5" />
                  : <Play className="w-3.5 h-3.5" />
                }
              </div>

              {/* Countdown bar + label */}
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

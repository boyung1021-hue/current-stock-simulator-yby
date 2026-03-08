"use client"

import { cn } from "@/lib/utils"
import { useRankings, type SortKey } from "@/hooks/use-rankings"
import { Trophy, TrendingUp, TrendingDown } from "lucide-react"

const MEDAL: Record<number, { emoji: string; bg: string; text: string }> = {
  1: { emoji: "🥇", bg: "bg-amber-50",  text: "text-amber-600" },
  2: { emoji: "🥈", bg: "bg-slate-100", text: "text-slate-500" },
  3: { emoji: "🥉", bg: "bg-orange-50", text: "text-orange-500" },
}

const SORT_TABS: { key: SortKey; label: string }[] = [
  { key: "totalValue", label: "총 평가금액" },
  { key: "profitRate",  label: "수익률" },
]

function ProfitBadge({ rate, amount }: { rate: number; amount: number }) {
  const isUp = rate >= 0
  return (
    <div className={cn(
      "flex items-center gap-1 px-2 py-0.5 rounded-lg",
      isUp ? "bg-stock-up-soft" : "bg-stock-down-soft"
    )}>
      {isUp
        ? <TrendingUp  className="w-3 h-3 stock-up"   strokeWidth={2.5} />
        : <TrendingDown className="w-3 h-3 stock-down" strokeWidth={2.5} />}
      <span className={cn("text-xs font-bold tabular-nums", isUp ? "stock-up" : "stock-down")}>
        {isUp ? "+" : ""}{rate.toFixed(1)}%
      </span>
    </div>
  )
}

export function RankingTab() {
  const { rankings, myRanking, loading, sortKey, setSortKey } = useRankings()
  const isUp = myRanking.profitRate >= 0

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <header className="px-5 pt-2 pb-4 bg-background">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" strokeWidth={2} />
          <h1 className="text-xl font-bold text-foreground">랭킹</h1>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          {SORT_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSortKey(tab.key)}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
                sortKey === tab.key
                  ? "bg-card text-foreground card-shadow"
                  : "text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* My rank card — sticky below header */}
      <div className="px-4 mb-4">
        <div className={cn(
          "rounded-2xl p-4 border-2",
          isUp ? "bg-stock-up-soft border-stock-up/30" : "bg-stock-down-soft border-stock-down/30"
        )}>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">내 순위</p>
          <div className="flex items-center gap-3">
            {/* Rank badge */}
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-lg",
              isUp ? "bg-stock-up text-white" : "bg-stock-down text-white"
            )}>
              {myRanking.rank}
            </div>

            {/* Name + value */}
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-foreground">{myRanking.displayName}</p>
              <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                ₩{myRanking.totalValue.toLocaleString()}
              </p>
            </div>

            {/* Profit */}
            <div className="text-right flex-shrink-0">
              <ProfitBadge rate={myRanking.profitRate} amount={myRanking.profitAmount} />
              <p className={cn(
                "text-xs font-semibold tabular-nums mt-1",
                isUp ? "stock-up" : "stock-down"
              )}>
                {isUp ? "+" : ""}₩{myRanking.profitAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking list */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-foreground">TOP 20</h2>
          <span className="text-xs text-muted-foreground">전체 {rankings.length}명</span>
        </div>

        {loading ? (
          <div className="bg-card rounded-2xl card-shadow overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn(
                "px-4 py-3.5 flex items-center gap-3",
                i < 4 && "border-b border-border"
              )}>
                <div className="w-6 h-6 rounded-lg bg-secondary animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 bg-secondary rounded animate-pulse" />
                  <div className="h-2.5 w-16 bg-secondary rounded animate-pulse" />
                </div>
                <div className="h-6 w-16 bg-secondary rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-2xl card-shadow overflow-hidden">
            {rankings.map((entry, index) => {
              const isMe = entry.userId === "me"
              const medal = MEDAL[entry.rank]
              const entryIsUp = entry.profitRate >= 0

              return (
                <div
                  key={entry.userId}
                  className={cn(
                    "px-4 py-3.5 flex items-center gap-3 transition-colors",
                    index < rankings.length - 1 && "border-b border-border",
                    isMe && "bg-primary/5"
                  )}
                >
                  {/* Rank */}
                  {medal ? (
                    <span className="text-lg w-7 text-center flex-shrink-0">{medal.emoji}</span>
                  ) : (
                    <span className={cn(
                      "text-xs font-bold w-7 text-center flex-shrink-0 tabular-nums",
                      isMe ? "text-primary" : "text-muted-foreground"
                    )}>
                      {entry.rank}
                    </span>
                  )}

                  {/* Avatar */}
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    isMe
                      ? "bg-primary text-primary-foreground"
                      : medal
                      ? cn(medal.bg, medal.text)
                      : "bg-secondary text-muted-foreground"
                  )}>
                    {entry.displayName.charAt(0)}
                  </div>

                  {/* Name + total value */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={cn(
                        "text-sm font-semibold text-foreground truncate",
                        isMe && "text-primary"
                      )}>
                        {entry.displayName}
                      </p>
                      {isMe && (
                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md flex-shrink-0">
                          나
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                      ₩{entry.totalValue.toLocaleString()}
                    </p>
                  </div>

                  {/* Profit rate */}
                  <div className="text-right flex-shrink-0">
                    <p className={cn(
                      "text-sm font-bold tabular-nums",
                      entryIsUp ? "stock-up" : "stock-down"
                    )}>
                      {entryIsUp ? "+" : ""}{entry.profitRate.toFixed(1)}%
                    </p>
                    <p className={cn(
                      "text-[10px] font-medium tabular-nums mt-0.5",
                      entryIsUp ? "stock-up" : "stock-down"
                    )}>
                      {entryIsUp ? "+" : ""}₩{Math.abs(entry.profitAmount).toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="h-6" />
    </div>
  )
}
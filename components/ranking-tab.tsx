"use client"

import { useState } from "react"
import { Trophy, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRankings, type SortKey } from "@/hooks/use-rankings"

const MEDAL: Record<number, { label: string; color: string }> = {
  1: { label: "🥇", color: "text-yellow-500" },
  2: { label: "🥈", color: "text-slate-400"  },
  3: { label: "🥉", color: "text-orange-400" },
}

function fmt(n: number): string {
  return Math.abs(n).toLocaleString("ko-KR")
}

export function RankingTab() {
  const [sortKey, setSortKey] = useState<SortKey>("totalValue")
  const { rankings, myRanking, loading } = useRankings(sortKey)

  const isMyProfit = myRanking.profitRate >= 0

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <header className="px-5 pt-5 pb-4 bg-background">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" strokeWidth={2} />
          <h1 className="text-xl font-bold text-foreground">랭킹</h1>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-0.5 bg-secondary rounded-xl p-0.5 w-full">
          {(["totalValue", "profitRate"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={cn(
                "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
                sortKey === key
                  ? "bg-card text-foreground card-shadow"
                  : "text-muted-foreground"
              )}
            >
              {key === "totalValue" ? "총 평가금액 순" : "수익률 순"}
            </button>
          ))}
        </div>
      </header>

      {/* My ranking card */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-2xl card-shadow p-4 border border-primary/20">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-2">내 순위</p>
          <div className="flex items-center gap-3">
            {/* Rank badge */}
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-base font-extrabold text-primary">{myRanking.rank}</span>
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{myRanking.displayName}</p>
              <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                ₩{myRanking.totalValue.toLocaleString("ko-KR")}
              </p>
            </div>

            {/* Profit */}
            <div className="text-right flex-shrink-0">
              <p className={cn("text-base font-extrabold tabular-nums", isMyProfit ? "stock-up" : "stock-down")}>
                {isMyProfit ? "+" : ""}{myRanking.profitRate.toFixed(1)}%
              </p>
              <p className={cn("text-xs font-semibold tabular-nums", isMyProfit ? "stock-up" : "stock-down")}>
                {isMyProfit ? "+" : "-"}₩{fmt(myRanking.profitAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings list */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-foreground">TOP 20</h2>
          <span className="text-xs text-muted-foreground">{rankings.length}명 참여</span>
        </div>

        {loading ? (
          <div className="bg-card rounded-2xl card-shadow py-12 text-center">
            <p className="text-muted-foreground text-sm">불러오는 중...</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl card-shadow overflow-hidden">
            {rankings.map((entry, index) => {
              const isMe = entry.userId === "me"
              const isProfit = entry.profitRate >= 0
              const medal = MEDAL[entry.rank]

              return (
                <div
                  key={entry.userId}
                  className={cn(
                    "px-4 py-3 flex items-center gap-3",
                    index < rankings.length - 1 && "border-b border-border",
                    isMe && "bg-primary/5"
                  )}
                >
                  {/* Rank */}
                  <div className="w-7 flex-shrink-0 flex items-center justify-center">
                    {medal ? (
                      <span className="text-base leading-none">{medal.label}</span>
                    ) : (
                      <span className={cn(
                        "text-xs font-bold tabular-nums",
                        isMe ? "text-primary" : "text-muted-foreground"
                      )}>
                        {entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar + name */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}>
                      {entry.displayName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={cn(
                          "text-sm font-semibold truncate",
                          isMe ? "text-primary" : "text-foreground"
                        )}>
                          {entry.displayName}
                        </p>
                        {isMe && (
                          <span className="text-[9px] font-bold text-primary bg-primary/10 px-1 py-0.5 rounded flex-shrink-0">
                            나
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        ₩{entry.totalValue.toLocaleString("ko-KR")}
      </p>
                    </div>
                  </div>

                  {/* Profit */}
                  <div className="text-right flex-shrink-0">
                    <div className={cn(
                      "flex items-center justify-end gap-0.5 text-sm font-bold tabular-nums",
                      isProfit ? "stock-up" : "stock-down"
                    )}>
                      {isProfit
                        ? <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
                        : <TrendingDown className="w-3 h-3" strokeWidth={2.5} />}
                      {isProfit ? "+" : ""}{entry.profitRate.toFixed(1)}%
                    </div>
                    <p className={cn("text-[10px] font-semibold tabular-nums mt-0.5", isProfit ? "stock-up" : "stock-down")}>
                      {isProfit ? "+" : "-"}₩{fmt(entry.profitAmount)}
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
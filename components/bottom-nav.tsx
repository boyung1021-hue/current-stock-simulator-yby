"use client"

import { cn } from "@/lib/utils"
import { PieChart, Compass, Trophy } from "lucide-react"

type TabId = "portfolio" | "discover" | "ranking"

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const TABS = [
  { id: "portfolio" as const, labelKr: "포트폴리오", icon: PieChart  },
  { id: "discover"  as const, labelKr: "탐색",      icon: Compass   },
  { id: "ranking"   as const, labelKr: "랭킹",      icon: Trophy    },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm tab-bar-blur border-t border-border z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      aria-label="Main navigation"
    >
      <div className="flex">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all active:scale-95"
              aria-label={tab.labelKr}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "transition-all",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  style={{ width: 22, height: 22 }}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.labelKr}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
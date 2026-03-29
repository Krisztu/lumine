'use client'

import { TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

interface MobileBottomNavProps {
  tabs: { value: string; label: string; icon: any }[]
  activeTab: string
}

export function MobileBottomNav({ tabs, activeTab }: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 border-t border-border shadow-sm" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <TabsList className="flex w-full h-auto bg-transparent p-0 overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex-1 min-w-[60px] flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-none text-muted-foreground transition-colors data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:bg-emerald-600/5"
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-tight whitespace-nowrap">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </nav>
  )
}

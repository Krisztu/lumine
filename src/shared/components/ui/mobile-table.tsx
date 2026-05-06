import React from 'react'
import { Card, CardContent } from './card'

interface MobileTableProps {
  data: any[]
  columns: {
    key: string
    label: string
    render?: (value: any, item: any) => React.ReactNode
  }[]
  keyField?: string
  emptyMessage?: string
}

export function MobileTable({ 
  data, 
  columns, 
  keyField = 'id', 
  emptyMessage = 'Nincsenek adatok' 
}: MobileTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <Card key={item[keyField] || index} className="border border-white/10">
          <CardContent className="p-3">
            <div className="space-y-2">
              {columns.map((column) => {
                const value = item[column.key]
                const displayValue = column.render ? column.render(value, item) : value
                
                return (
                  <div key={column.key} className="flex justify-between items-start gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-0 flex-shrink-0">
                      {column.label}:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white text-right break-words">
                      {displayValue || 'N/A'}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Responsive táblázat wrapper
interface ResponsiveTableProps {
  children: React.ReactNode
  mobileComponent: React.ReactNode
  breakpoint?: 'sm' | 'md' | 'lg'
}

export function ResponsiveTable({ 
  children, 
  mobileComponent, 
  breakpoint = 'md' 
}: ResponsiveTableProps) {
  const hideClass = breakpoint === 'sm' ? 'hidden sm:block' : 
                   breakpoint === 'md' ? 'hidden md:block' : 
                   'hidden lg:block'
  
  const showClass = breakpoint === 'sm' ? 'block sm:hidden' : 
                   breakpoint === 'md' ? 'block md:hidden' : 
                   'block lg:hidden'

  return (
    <>
      <div className={hideClass}>
        {children}
      </div>
      <div className={showClass}>
        {mobileComponent}
      </div>
    </>
  )
}
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'

interface TeacherMessage {
  id: string
  type: 'dicseret' | 'figyelmeztetés'
  level: 'szaktanári' | 'osztályfőnöki' | 'igazgatói'
  reason: string
  givenBy: string
  date: string
}

interface TeacherMessagesTabProps {
  messages: TeacherMessage[]
}

export function TeacherMessagesTab({ messages }: TeacherMessagesTabProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'szaktanári': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
      case 'osztályfőnöki': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
      case 'igazgatói': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'dicseret' 
      ? 'border-green-500/30 bg-green-500/10' 
      : 'border-red-500/30 bg-red-500/10'
  }

  if (messages.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="text-center py-8 text-gray-500">
          <p>Nincsenek tanári üzenetek</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {messages.map(message => (
        <Card key={message.id} className={`border ${getTypeColor(message.type)}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge className={message.type === 'dicseret' ? 'bg-green-500' : 'bg-red-500'}>
                  {message.type === 'dicseret' ? '✓ Dicséret' : '⚠ Figyelmeztetés'}
                </Badge>
                <Badge className={getLevelColor(message.level)}>
                  {message.level.charAt(0).toUpperCase() + message.level.slice(1)}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(message.date).toLocaleDateString('hu-HU')}
              </p>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              {message.reason}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Rögzítette: {message.givenBy}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

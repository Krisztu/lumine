'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
interface ChatTabProps {
  chatMessages: any[]
  chatMessage: string
  setChatMessage: (msg: string) => void
  sendChatMessage: () => Promise<void>
  userRole: string
  loadChatMessages: () => Promise<void>
  showAlert: (msg: string, type?: 'success' | 'error' | 'warning' | 'info', title?: string) => void
}

export function ChatTab({
  chatMessages,
  chatMessage,
  setChatMessage,
  sendChatMessage,
  userRole,
  loadChatMessages,
  showAlert
}: ChatTabProps) {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center text-sm sm:text-lg">
          
          Üzenőfal
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="space-y-2 sm:space-y-4 max-h-48 sm:max-h-96 overflow-y-auto mb-3 sm:mb-4 text-xs sm:text-sm">
          {chatMessages.map((message) => (
            <div key={message.id} className="border-b pb-2 last:border-b-0">
              <div className="flex justify-between items-start gap-2 mb-1">
                <span className="font-semibold text-sm break-words">{message.sender}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(message.createdAt).toLocaleString('hu-HU')}
                  </span>
                  {userRole === 'admin' && (
                    <button
                      onClick={async () => {
                        if (confirm('Biztosan törlöd ezt az üzenetet?')) {
                          try {
                            const response = await fetch(`/api/communication/chat?id=${message.id}`, {
                              method: 'DELETE'
                            })
                            if (response.ok) {
                              loadChatMessages()
                            }
                          } catch (error) {
                            console.error('Failed to delete message:', error)
                          }
                        }
                      }}
                      className="bg-red-500 text-white px-1 py-0.5 rounded text-xs hover:bg-red-600 flex-shrink-0"
                    >
                      Törlés
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-1 break-words text-xs sm:text-sm">{message.message}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Textarea
            placeholder="Írj egy üzenetet..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            className="flex-1 text-sm resize-none"
            rows={2}
          />
          <Button onClick={sendChatMessage} className="w-full sm:w-auto text-sm h-10 sm:h-auto">
            Küldés
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

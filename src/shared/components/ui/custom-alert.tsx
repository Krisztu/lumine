'use client'

import React from 'react'
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface CustomAlertProps {
    open: boolean
    onClose: () => void
    title?: string
    message: string
    type?: 'success' | 'error' | 'warning' | 'info'
}

export function CustomAlert({ open, onClose, title, message, type = 'info' }: CustomAlertProps) {
    if (!open) return null

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            case 'error': return <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            case 'warning': return <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
            default: return <Info className="w-12 h-12 text-blue-500 mb-4" />
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center relative transform transition-all scale-100">
                <div className="flex flex-col items-center">
                    {getIcon()}

                    {title && <h3 className="text-xl font-bold text-white mb-2">{title}</h3>}

                    <p className="text-slate-300 mb-6 leading-relaxed">
                        {message}
                    </p>

                    <Button
                        onClick={onClose}
                        className="w-full bg-primary hover:bg-primary/80 text-white font-medium py-2 rounded-xl transition-all"
                    >
                        Rendben
                    </Button>
                </div>
            </div>
        </div>
    )
}

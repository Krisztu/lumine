import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string | React.ReactNode;
    subtitle?: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
            <div className={`glass-panel border border-white/10 rounded-xl shadow-2xl p-3 sm:p-6 ${maxWidth} w-full max-h-[90vh] overflow-auto animate-in fade-in zoom-in duration-200`}>
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div className="flex-1 pr-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words">{title}</h3>
                        {subtitle && <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 break-words">{subtitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors flex-shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="text-sm sm:text-base">
                    {children}
                </div>
            </div>
        </div>
    );
}

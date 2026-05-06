import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/modal';
;

interface Grade {
    subject?: string;
    grade?: number;
}

interface ChartModalProps {
    isOpen: boolean;
    onClose: () => void;
    grades: Grade[];
}

export function ChartModal({ isOpen, onClose, grades }: ChartModalProps) {
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    const subjects = Object.keys(
        grades.reduce((acc, grade) => {
            const subject = grade.subject || 'Egyéb';
            acc[subject] = true;
            return acc;
        }, {} as Record<string, boolean>)
    );

    const chartData = Object.entries(
        grades.reduce((acc, grade) => {
            const subject = grade.subject || 'Egyéb';
            if (!acc[subject]) acc[subject] = [];
            acc[subject].push(grade);
            return acc;
        }, {} as Record<string, any[]>)
    ).filter(([subject]) => selectedSubject === null || subject === selectedSubject);

    const modalTitle = (
        <div>
            <div className="flex items-center gap-2">
                
                <span>Tantárgyak átlagai</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 font-normal">Részletes diagram nézet</p>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="max-w-6xl">
            <div className="bg-white/5 p-6 rounded-lg mb-8 border border-white/10">
                <h5 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Szűrés tantárgy szerint:</h5>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setSelectedSubject(null)}
                        className={`px-6 py-3 rounded-lg text-base font-medium transition-all ${selectedSubject === null
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                            }`}
                    >
                        Összes tantárgy
                    </button>
                    {subjects.map(subject => (
                        <button
                            key={subject}
                            onClick={() => setSelectedSubject(subject)}
                            className={`px-6 py-3 rounded-lg text-base font-medium transition-all ${selectedSubject === subject
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                                }`}
                        >
                            {subject}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-panel border border-white/10 rounded-xl p-8 bg-white/5">
                <div className="w-full overflow-x-auto">
                    <svg viewBox="0 0 800 500" className="w-full h-[450px] min-w-[700px]">
                        {chartData.map(([subject, subjectGrades]: [string, Grade[]], index: number, filteredArray: [string, Grade[]][]) => {
                            const average = subjectGrades.reduce((sum: number, grade: Grade) => sum + (grade.grade || 0), 0) / subjectGrades.length;
                            const barHeight = (average / 5) * 320;
                            const chartWidth = 650;
                            const barWidth = Math.min(70, (chartWidth / filteredArray.length) - 20);
                            const spacing = 90;
                            const x = 150 + index * spacing;
                            const color = average >= 4 ? '#10b981' : average >= 3 ? '#f59e0b' : '#ef4444';
                            return (
                                <g key={subject}>
                                    <rect
                                        x={x - barWidth / 2}
                                        y={380 - barHeight}
                                        width={barWidth}
                                        height={barHeight}
                                        fill={color}
                                        rx="4"
                                        className="hover:opacity-80 cursor-pointer transition-opacity"
                                    />
                                    <text
                                        x={x}
                                        y={400}
                                        textAnchor="middle"
                                        fontSize="12"
                                        fill="currentColor"
                                        className="text-gray-700 dark:text-gray-300 font-medium"
                                    >
                                        {subject.length > 10 ? subject.slice(0, 10) + '...' : subject}
                                    </text>
                                    <title>{subject}: {average.toFixed(2)}</title>
                                    <text
                                        x={x}
                                        y={370 - barHeight}
                                        textAnchor="middle"
                                        fontSize="14"
                                        fill={color}
                                        className="text-gray-900 dark:text-white font-bold"
                                    >
                                        {average.toFixed(2)}
                                    </text>
                                    <text
                                        x={x}
                                        y={415}
                                        textAnchor="middle"
                                        fontSize="10"
                                        fill="currentColor"
                                        className="text-gray-500 dark:text-gray-400"
                                    >
                                        {subjectGrades.length} jegy
                                    </text>
                                </g>
                            );
                        })}
                        <line x1="100" y1="380" x2="750" y2="380" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
                        <line x1="100" y1="60" x2="100" y2="380" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
                        {[1, 2, 3, 4, 5].map(grade => (
                            <g key={grade}>
                                <line x1="95" y1={380 - (grade / 5) * 320} x2="105" y2={380 - (grade / 5) * 320} stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
                                <text x="85" y={380 - (grade / 5) * 320 + 5} textAnchor="end" fontSize="12" fill="currentColor" className="text-gray-600 dark:text-gray-400 font-medium">{grade}</text>
                                <line x1="100" y1={380 - (grade / 5) * 320} x2="750" y2={380 - (grade / 5) * 320} stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-700" opacity="0.3" />
                            </g>
                        ))}
                        <text x="50" y="220" textAnchor="middle" fontSize="14" fill="currentColor" className="text-gray-600 dark:text-gray-400 font-medium" transform="rotate(-90 50 220)">Átlag</text>
                        <text x="425" y="450" textAnchor="middle" fontSize="14" fill="currentColor" className="text-gray-600 dark:text-gray-400 font-medium">Tantárgyak</text>
                    </svg>
                </div>
            </div>
        </Modal>
    );
}
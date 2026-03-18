'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { BEHAVIOR_PRAISE, BEHAVIOR_WARNING } from '@/shared/utils/constants';

interface BehaviorFormProps {
  students: Array<{ id: string; fullName: string; name: string; class: string }>;
  userRole: 'teacher' | 'homeroom_teacher' | 'principal';
  onSubmit: (data: any) => Promise<void>;
  onSuccess?: () => void;
}

export function BehaviorForm({ students, userRole, onSubmit, onSuccess }: BehaviorFormProps) {
  const [formData, setFormData] = useState({
    studentId: '',
    behaviorType: '',
    reason: ''
  });

  const availableTypes = [
    ...(userRole === 'teacher' ? [
      BEHAVIOR_PRAISE[0],
      BEHAVIOR_WARNING[0]
    ] : []),
    ...(userRole === 'homeroom_teacher' ? [
      ...BEHAVIOR_PRAISE.slice(0, 2),
      ...BEHAVIOR_WARNING.slice(0, 2)
    ] : []),
    ...(userRole === 'principal' ? [
      ...BEHAVIOR_PRAISE,
      ...BEHAVIOR_WARNING
    ] : [])
  ];

  const handleSubmit = async () => {
    if (!formData.studentId || !formData.behaviorType || !formData.reason) {
      alert('Töltsd ki az összes mezőt!');
      return;
    }

    const student = students.find(s => s.id === formData.studentId);
    if (!student) return;

    try {
      await onSubmit({
        studentId: formData.studentId,
        studentName: student.fullName || student.name,
        studentClass: student.class,
        behaviorType: formData.behaviorType,
        reason: formData.reason
      });

      setFormData({
        studentId: '',
        behaviorType: '',
        reason: ''
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Hiba:', error);
    }
  };

  const isPraise = formData.behaviorType && BEHAVIOR_PRAISE.includes(formData.behaviorType as any);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Viselkedés értékelés</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Diák</label>
          <select
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
          >
            <option value="">Válassz diákot</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.fullName || student.name} ({student.class})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bejegyzés típusa</label>
          <select
            value={formData.behaviorType}
            onChange={(e) => setFormData({ ...formData, behaviorType: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
          >
            <option value="">Válassz típust</option>
            <optgroup label="Dicséretek">
              {BEHAVIOR_PRAISE.filter(type => availableTypes.includes(type)).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </optgroup>
            <optgroup label="Figyelmeztetések">
              {BEHAVIOR_WARNING.filter(type => availableTypes.includes(type)).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Indoklás</label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
            rows={3}
            placeholder="Írd le az indoklást..."
          />
        </div>

        <Button
          onClick={handleSubmit}
          className={`w-full ${isPraise ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {isPraise ? '✓' : '⚠'} Rögzítés
        </Button>
      </CardContent>
    </Card>
  );
}

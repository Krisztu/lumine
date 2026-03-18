'use client';

import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';

type BehaviorType = 'dicséret' | 'figyelmeztetés';
type BehaviorLevel = 'szaktanári' | 'osztályfőnöki' | 'igazgatói';

interface BehaviorRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  type: BehaviorType;
  level: BehaviorLevel;
  reason: string;
  givenBy: string;
  date: string;
}

interface BehaviorListProps {
  records: BehaviorRecord[];
  showStudent?: boolean;
  onDelete?: (id: string) => Promise<void>;
  canDelete?: boolean;
}

export function BehaviorList({ records, showStudent = true, onDelete, canDelete = false }: BehaviorListProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'szaktanári': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'osztályfőnöki': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'igazgatói': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'dicséret' 
      ? 'border-green-500/30 bg-green-500/10' 
      : 'border-red-500/30 bg-red-500/10';
  };

  if (records.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="text-center py-8 text-gray-500">
          <p>Nincsenek viselkedési bejegyzések.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {records.map(record => (
        <Card key={record.id} className={`border ${getTypeColor(record.type)}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                {showStudent && (
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {record.studentName} ({record.studentClass})
                  </h4>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={record.type === 'dicséret' ? 'bg-green-500' : 'bg-red-500'}>
                    {record.type === 'dicséret' ? '✓ Dicséret' : '⚠ Figyelmeztetés'}
                  </Badge>
                  <Badge className={getLevelColor(record.level)}>
                    {record.level.charAt(0).toUpperCase() + record.level.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(record.date).toLocaleDateString('hu-HU')}
                </p>
                {canDelete && onDelete && (
                  <button
                    onClick={() => {
                      if (confirm('Biztosan törlöd ezt a bejegyzést?')) {
                        onDelete(record.id);
                      }
                    }}
                    className="mt-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    Törlés
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              <span className="font-medium">Indoklás:</span> {record.reason}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Rögzítette: {record.givenBy}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

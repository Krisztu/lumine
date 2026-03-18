import React from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Check, XCircle } from 'lucide-react';

interface HomeworkSubmission {
  id: string;
  studentName: string;
  content: string;
  submittedAt: string;
  status?: 'completed' | 'incomplete' | 'evaluated' | 'submitted';
  grade?: string;
  image?: string;
  attachments?: string[];
}

interface StudentSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: HomeworkSubmission | null;
  homeworkTitle: string;
  onUpdateSubmissionStatus?: (submissionId: string, status: 'completed' | 'incomplete') => Promise<void>;
}

export function StudentSubmissionModal({
  isOpen,
  onClose,
  submission,
  homeworkTitle,
  onUpdateSubmissionStatus
}: StudentSubmissionModalProps) {
  if (!submission) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${submission.studentName} beadása - ${homeworkTitle}`} maxWidth="max-w-4xl">
      <div className="border border-white/10 rounded-lg p-4 bg-white/5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h5 className="font-medium text-gray-900 dark:text-white text-lg">{submission.studentName}</h5>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Beküldve: {new Date(submission.submittedAt).toLocaleString('hu-HU')}
            </p>
          </div>
          <div className="flex gap-2">
            {(submission.grade || submission.status === 'completed') ? (
              <Badge className="bg-green-500 hover:bg-green-600">
                <Check size={12} className="mr-1" />
                {submission.grade || 'Elfogadva'}
              </Badge>
            ) : submission.status === 'incomplete' ? (
              <Badge className="bg-red-500 hover:bg-red-600">
                <XCircle size={12} className="mr-1" />
                Hiányos
              </Badge>
            ) : (
              <div className="flex gap-1">
                {onUpdateSubmissionStatus && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-800"
                      onClick={() => onUpdateSubmissionStatus(submission.id, 'completed')}
                    >
                      <Check size={14} className="mr-1" />
                      Elfogad
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                      onClick={() => onUpdateSubmissionStatus(submission.id, 'incomplete')}
                    >
                      <XCircle size={14} className="mr-1" />
                      Hiányos
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-black/5 dark:bg-black/20 p-3 rounded-md text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {submission.content}
        </div>

        {submission.attachments && submission.attachments.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Csatolmányok:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {submission.attachments.map((attachment: string, index: number) => (
                <img 
                  key={index} 
                  src={attachment} 
                  alt={`Csatolmány ${index + 1}`} 
                  className="max-h-48 w-full object-cover rounded-md border border-white/10 cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => window.open(attachment, '_blank')}
                />
              ))}
            </div>
          </div>
        )}

        {submission.image && (
          <div className="mt-3">
            <img src={submission.image} alt="Csatolmány" className="max-h-48 rounded-md border border-white/10" />
          </div>
        )}
      </div>
    </Modal>
  );
}
import React from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Check, XCircle, FileText } from 'lucide-react';

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

interface Homework {
  id: string;
  title: string;
  subject: string;
  teacherName: string;
  dueDate: string;
  description: string;
  submissions?: HomeworkSubmission[];
  submission?: HomeworkSubmission;
}

interface HomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  homework: Homework | null;
  userRole: string;
  onUpdateSubmissionStatus?: (submissionId: string, status: 'completed' | 'incomplete') => Promise<void>;
}

export function HomeworkModal({
  isOpen,
  onClose,
  homework,
  userRole,
  onUpdateSubmissionStatus
}: HomeworkModalProps) {
  if (!homework) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={homework.title} maxWidth="max-w-xs sm:max-w-4xl">
      <div className="mb-3 sm:mb-4">
        <p className="text-gray-600 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
          <span className="font-medium">{homework.subject}</span>
          <span className="hidden sm:inline w-1 h-1 bg-gray-400 rounded-full"></span>
          <span className="text-xs sm:text-sm">{homework.teacherName}</span>
          <span className="hidden sm:inline w-1 h-1 bg-gray-400 rounded-full"></span>
          <span className="text-xs sm:text-sm">Határidő: {new Date(homework.dueDate).toLocaleDateString('hu-HU')}</span>
        </p>
      </div>

      <div className="mb-4 sm:mb-6">
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
          <FileText size={16} className="sm:w-5 sm:h-5" />
          Feladat leírása
        </h4>
        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white/5 p-3 sm:p-4 rounded-lg border border-white/10 shadow-inner text-xs sm:text-sm break-words">
          {homework.description}
        </div>
      </div>

      {(userRole === 'parent' || userRole === 'student') && homework.submission && (
        <div className="border-t border-white/10 pt-4 sm:pt-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
            {userRole === 'parent' ? 'Gyermek beadása' : 'Saját beadás'}
          </h4>
          <div className="border border-white/10 rounded-lg p-3 sm:p-4 bg-white/5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Beküldve: {new Date(homework.submission.submittedAt).toLocaleString('hu-HU')}
                </p>
              </div>
              <div className="flex gap-2">
                {homework.submission.status === 'evaluated' || homework.submission.status === 'completed' ? (
                  <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                    <Check size={12} className="mr-1" />
                    Értékelve
                  </Badge>
                ) : (
                  <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">
                    Beküldve
                  </Badge>
                )}
              </div>
            </div>
            <div className="bg-black/5 dark:bg-black/20 p-2 sm:p-3 rounded-md text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
              {homework.submission.content}
            </div>
            {homework.submission.attachments && homework.submission.attachments.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Csatolmányok:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {homework.submission.attachments.map((attachment: string, index: number) => (
                    <img 
                      key={index} 
                      src={attachment} 
                      alt={`Csatolmány ${index + 1}`} 
                      className="max-h-32 sm:max-h-48 w-full object-cover rounded-md border border-white/10 cursor-pointer hover:opacity-80 transition-opacity" 
                      onClick={() => window.open(attachment, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {userRole === 'teacher' && homework.submissions && homework.submissions.length === 1 && (
        <div className="border-t border-white/10 pt-6">
          {homework.submissions.map((submission: HomeworkSubmission) => (
            <div key={submission.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
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
          ))}
        </div>
      )}
      
    </Modal>
  );
}

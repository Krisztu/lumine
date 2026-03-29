import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { FileUpload } from '@/shared/components/ui/file-upload';
import { Loader2 } from 'lucide-react';

interface Homework {
  id: string;
  title: string;
}

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  homework: Homework | null;
  onSubmit: (content: string, attachments?: string[]) => Promise<void>;
}

export function SubmissionModal({ isOpen, onClose, homework, onSubmit }: SubmissionModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  if (!homework) return null;

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) {
      alert('Írj leírást vagy csatolj képet!');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(content, imageUrl ? [imageUrl] : []);
      setContent('');
      setImageUrl(null);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Házi feladat beadása" subtitle={homework.title}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Megoldás / Válasz:</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-white dark:bg-black/20"
            rows={6}
            placeholder="Írd le a megoldásodat, válaszodat..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Kép csatolása (opcionális):</label>
          <FileUpload
            onUpload={setImageUrl}
            onRemove={() => setImageUrl(null)}
            imageUrl={imageUrl}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Küldés...
              </>
            ) : (
              '📤 Beküldés'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Mégse
          </Button>
        </div>
      </div>
    </Modal>
  );
}

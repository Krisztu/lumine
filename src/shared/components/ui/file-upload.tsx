import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface FileUploadProps {
    onUpload: (url: string) => void;
    onRemove?: () => void;
    imageUrl?: string | null;
    accept?: string;
    label?: string;
}

export function FileUpload({ onUpload, onRemove, imageUrl, accept = 'image/*', label = 'Kép feltöltése' }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const url = await uploadToCloudinary(file);
            onUpload(url);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Hiba a kép feltöltése során');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <div className="flex items-center gap-3">
                <input
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload-input"
                    disabled={uploading}
                />
                <label
                    htmlFor="file-upload-input"
                    className={`flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {uploading ? (
                        <Loader2 className="animate-spin mr-2" size={16} />
                    ) : (
                        <Upload size={16} className="mr-2" />
                    )}
                    <span className="text-sm">{label}</span>
                </label>
                {imageUrl && (
                    <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                        <ImageIcon size={16} className="mr-1" />
                        Kép feltöltve
                    </div>
                )}
            </div>
            {imageUrl && (
                <div className="mt-2 relative inline-block">
                    <img src={imageUrl} alt="Uploaded" className="h-20 w-auto rounded border" />
                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

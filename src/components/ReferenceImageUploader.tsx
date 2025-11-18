import React, { useCallback, useRef } from 'react';
import { ImageFile } from '../types';
import { UploadIcon, CloseIcon, ImageIcon } from './icons';

interface ReferenceImageUploaderProps {
  image: ImageFile | null;
  onImageChange: (file: File | null) => void;
  disabled: boolean;
}

export const ReferenceImageUploader: React.FC<ReferenceImageUploaderProps> = ({ image, onImageChange, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onImageChange(file);
    event.target.value = ''; // Reset input to allow re-uploading the same file
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
    if (disabled) return;
    const file = event.dataTransfer.files?.[0] || null;
    onImageChange(file);
  }, [onImageChange, disabled]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    event.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50');
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onImageChange(null);
  };
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-600 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-gray-500" />
        Стилевой референс (необязательно)
      </h3>
      <div className="relative w-full h-28 rounded-lg border-2 border-dashed border-gray-300 transition-all duration-300">
        <label
            htmlFor="reference-file-upload"
            className={`absolute inset-0 flex flex-col items-center justify-center group ${disabled ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
        {image ? (
          <>
            <img src={image.previewUrl} alt="Reference preview" className="w-full h-full object-cover rounded-md" />
            {!disabled && (
              <button
                type="button"
                aria-label="Удалить референсное изображение"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-white"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="text-center p-2">
            <UploadIcon className="mx-auto h-8 w-8 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            <p className="mt-1 text-xs text-gray-600">
              <span className="font-semibold text-indigo-600">Загрузите изображение</span>
            </p>
            <p className="text-xs text-gray-500">или перетащите</p>
          </div>
        )}
         <input 
          id="reference-file-upload" 
          name="reference-file-upload" 
          type="file" 
          className="sr-only" 
          ref={fileInputRef} 
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          disabled={disabled}
        />
        </label>
      </div>
    </div>
  );
};

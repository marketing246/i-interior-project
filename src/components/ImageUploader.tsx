import React, { useCallback, useRef } from 'react';
import { ImageFile } from '../types';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  image: ImageFile | null;
  onImageChange: (file: File | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ image, onImageChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onImageChange(file);
  };
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
    const file = event.dataTransfer.files?.[0] || null;
    onImageChange(file);
  }, [onImageChange]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50');
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">1. Ваше фото</h2>
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-dashed border-gray-300 transition-all duration-300">
        <label
            htmlFor="file-upload"
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
        {image ? (
          <img src={image.previewUrl} alt="Room preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-4">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold text-indigo-600">Нажмите, чтобы загрузить</span> или перетащите файл
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP до 10 МБ</p>
          </div>
        )}
         <input 
          id="file-upload" 
          name="file-upload" 
          type="file" 
          className="sr-only" 
          ref={fileInputRef} 
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
        />
        </label>
      </div>
      <button
        type="button"
        onClick={openFileDialog}
        className="w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {image ? 'Изменить фото' : 'Выбрать фото'}
      </button>
    </div>
  );
};

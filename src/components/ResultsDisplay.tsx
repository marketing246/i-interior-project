import React, { useState } from 'react';
import { ShareIcon, PencilIcon, DownloadIcon, CloseIcon, ResizeIcon } from './icons';

interface ResultsDisplayProps {
  originalImage?: string;
  generatedImages: string[];
  onEdit: (imageSrc: string) => void;
  isEditing: boolean;
}

const ImageCard: React.FC<{ 
  src: string; 
  alt: string; 
  label: string; 
  isOriginal?: boolean; 
  onShare?: () => void;
  onEdit?: () => void;
  onSave?: () => void;
  onEnlarge?: () => void;
}> = ({ src, alt, label, isOriginal = false, onShare, onEdit, onSave, onEnlarge }) => (
    <div className="relative group overflow-hidden rounded-xl shadow-lg">
      <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      
      {!isOriginal && onEnlarge && (
          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={onEnlarge}
            aria-label="Увеличить изображение"
          >
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <ResizeIcon className="w-12 h-12 text-white opacity-0 group-hover:opacity-80 transition-opacity delay-100 duration-200" />
            </div>
          </div>
      )}

      <div className={`absolute top-2 left-2 px-3 py-1 text-sm font-semibold text-white rounded-full ${isOriginal ? 'bg-gray-700/80' : 'bg-indigo-600/80'} backdrop-blur-sm`}>
        {label}
      </div>
      {!isOriginal && (
        <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              aria-label="Сохранить дизайн"
              className="p-2 bg-black/50 rounded-full text-white hover:bg-black/75 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-white"
            >
              <DownloadIcon className="w-5 h-5" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              aria-label="Редактировать дизайн"
              className="p-2 bg-black/50 rounded-full text-white hover:bg-black/75 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-white"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
          {onShare && (
            <button
              onClick={(e) => { e.stopPropagation(); onShare(); }}
              aria-label="Поделиться дизайном"
              className="p-2 bg-black/50 rounded-full text-white hover:bg-black/75 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-white"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
);

const ImageModal: React.FC<{
  image: {src: string, index: number} | null;
  onClose: () => void;
  onSave: (imageSrc: string, index: number) => void;
  onShare: (imageSrc: string, index: number) => void;
  onEdit: (imageSrc: string) => void;
}> = ({ image, onClose, onSave, onShare, onEdit }) => {
  if (!image) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <img src={image.src} alt={`Увеличенный дизайн ${image.index + 1}`} className="w-full h-auto object-contain rounded-t-lg flex-1 min-h-0" />
        <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 border-t rounded-b-lg">
            <button
              onClick={() => onSave(image.src, image.index)}
              className="flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DownloadIcon className="w-5 h-5" />
              Сохранить
            </button>
            <button
              onClick={() => onEdit(image.src)}
              className="flex items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PencilIcon className="w-5 h-5" />
              Редактировать
            </button>
            <button
              onClick={() => onShare(image.src, image.index)}
              className="flex items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ShareIcon className="w-5 h-5" />
              Поделиться
            </button>
        </div>
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute -top-3 -right-3 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ originalImage, generatedImages, onEdit, isEditing }) => {
  const [enlargedImage, setEnlargedImage] = useState<{src: string, index: number} | null>(null);

  const dataURItoFile = async (dataURI: string, fileName: string): Promise<File | null> => {
    try {
      const res = await fetch(dataURI);
      const blob = await res.blob();
      return new File([blob], fileName, { type: blob.type });
    } catch (e) {
      console.error("Error converting data URI to file:", e);
      return null;
    }
  };

  const handleShare = async (imageSrc: string, index: number) => {
    const fileName = `ai-дизайн-${index + 1}.png`;
    const file = await dataURItoFile(imageSrc, fileName);

    if (navigator.canShare && file && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Мой AI-дизайн интерьера',
          text: 'Посмотрите, какую потрясающую концепцию дизайна интерьера я создал с помощью ИИ!',
        });
      } catch (error) {
        console.log('Sharing failed or was cancelled', error);
      }
    } else {
      handleSave(imageSrc, index);
    }
  };

  const handleSave = (imageSrc: string, index: number) => {
    const fileName = `ai-дизайн-${index + 1}.png`;
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const isSingleResult = generatedImages.length === 1;

  return (
    <>
      <div className="space-y-6 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Ваш{isSingleResult ? ' новый дизайн' : 'и новые дизайны'}
        </h2>
        
        {isSingleResult ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {originalImage && (
              <ImageCard 
                src={originalImage} 
                alt="Предыдущая версия" 
                label={isEditing ? 'Предыдущая версия' : 'Оригинал'} 
                isOriginal={true} 
              />
            )}
            {generatedImages.map((imageSrc, index) => (
              <ImageCard 
                key={index} 
                src={imageSrc} 
                alt={`Сгенерированный дизайн ${index + 1}`} 
                label={`Новая версия`}
                onShare={() => handleShare(imageSrc, index)}
                onSave={() => handleSave(imageSrc, index)}
                onEdit={() => onEdit(imageSrc)}
                onEnlarge={() => setEnlargedImage({src: imageSrc, index})}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {originalImage && (
                <div className="lg:col-span-1">
                    <ImageCard src={originalImage} alt="Предыдущая версия" label={isEditing ? 'Предыдущая версия' : 'Оригинал'} isOriginal={true} />
                </div>
            )}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {generatedImages.map((imageSrc, index) => (
                    <ImageCard 
                      key={index} 
                      src={imageSrc} 
                      alt={`Сгенерированный дизайн ${index + 1}`} 
                      label={`Вариант ${index + 1}`}
                      onShare={() => handleShare(imageSrc, index)}
                      onSave={() => handleSave(imageSrc, index)}
                      onEdit={() => onEdit(imageSrc)}
                      onEnlarge={() => setEnlargedImage({src: imageSrc, index})}
                    />
                ))}
            </div>
          </div>
        )}
      </div>
      <ImageModal 
        image={enlargedImage}
        onClose={() => setEnlargedImage(null)}
        onSave={handleSave}
        onShare={handleShare}
        onEdit={onEdit}
      />
    </>
  );
};

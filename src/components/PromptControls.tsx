import React, { useState } from 'react';
import { MagicWandIcon, UndoIcon, RedoIcon, MagnifyingGlassIcon, ResizeIcon, RotateIcon, RepositionIcon, HomeIcon } from './icons';
import { ImageFile } from '../types';
import { ReferenceImageUploader } from './ReferenceImageUploader';

type ActiveTool = 'resize' | 'rotate' | 'reposition' | null;

interface PromptControlsProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isImageUploaded: boolean;
  isEditing: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onIdentifyObjects: () => void;
  onIdentifyMajorElements: () => void;
  isIdentifying: boolean;
  identifiedObjects: string[];
  selectedObject: string | null;
  setSelectedObject: (object: string | null) => void;
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  toolValue: string;
  setToolValue: (value: string) => void;
  referenceImage: ImageFile | null;
  onReferenceImageChange: (file: File | null) => void;
}

export const PromptControls: React.FC<PromptControlsProps> = ({ 
  prompt, setPrompt, onGenerate, isLoading, isImageUploaded, isEditing, 
  onUndo, onRedo, canUndo, canRedo, 
  onIdentifyObjects, onIdentifyMajorElements, isIdentifying, identifiedObjects, selectedObject, setSelectedObject,
  activeTool, setActiveTool, toolValue, setToolValue,
  referenceImage, onReferenceImageChange
}) => {
  const [scanType, setScanType] = useState<'items' | 'structure' | null>(null);

  const handleIdentifyItems = () => {
    setScanType('items');
    onIdentifyObjects();
  };

  const handleIdentifyStructure = () => {
    setScanType('structure');
    onIdentifyMajorElements();
  };


  const handleObjectClick = (object: string) => {
    if (selectedObject === object) {
      setSelectedObject(null);
      setActiveTool(null);
      setToolValue('');
      onReferenceImageChange(null);
    } else {
      setSelectedObject(object);
      setPrompt('');
      setActiveTool(null);
      setToolValue('');
      onReferenceImageChange(null);
    }
  };

  const handleToolClick = (tool: NonNullable<ActiveTool>) => {
    if (activeTool === tool) {
      setActiveTool(null);
      setToolValue('');
    } else {
      setActiveTool(tool);
      setToolValue('');
    }
  };

  const title = selectedObject 
    ? `2. Редактировать «${selectedObject.charAt(0).toUpperCase() + selectedObject.slice(1)}»`
    : `2. Опишите ваш стиль или правки`;

  const subTitle = selectedObject
    ? `Примените преобразования или опишите изменения стиля ниже.`
    : (isEditing 
      ? 'Будьте конкретны! Попробуйте "замени диван на синий бархатный" или "добавь большое растение в угол".'
      : 'Будьте описательны! Попробуйте "уютный домик с камином" или "светлый, воздушный скандинавский дизайн".');
      
  const placeholder = selectedObject
    ? `например, Измени цвет на темно-синий, сделай бархатным...`
    : (isEditing ? "например, Сделай стены светло-шалфейного цвета." : "например, Сделай комнату похожей на номер в роскошном отеле с золотыми акцентами.");

  const toolPlaceholders: Record<NonNullable<ActiveTool>, string> = {
    resize: 'например, Увеличить на 20%',
    rotate: 'например, Повернуть на 45 градусов по часовой стрелке',
    reposition: 'например, Переместить в левый угол комнаты'
  };

  return (
    <div className="space-y-4 flex flex-col">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-xl font-semibold text-gray-700 capitalize">{title}</h2>
        </div>
        {isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo || isLoading}
              aria-label="Отменить"
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
            >
              <UndoIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo || isLoading}
              aria-label="Повторить"
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
            >
              <RedoIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm text-gray-500 -mt-2">
          {subTitle}
        </p>
      </div>
      
      {isImageUploaded && (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleIdentifyItems}
            disabled={isIdentifying || isLoading}
            className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {isIdentifying && scanType === 'items' ? (
              <>
                <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Сканирую...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
                Сканировать объекты
              </>
            )}
          </button>
          <button
            onClick={handleIdentifyStructure}
            disabled={isIdentifying || isLoading}
            className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {isIdentifying && scanType === 'structure' ? (
              <>
                <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Распознаю...
              </>
            ) : (
              <>
                <HomeIcon className="w-5 h-5 text-gray-500" />
                Определить структуру
              </>
            )}
          </button>
        </div>
      )}

      {identifiedObjects.length > 0 && (
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">Выберите объект для редактирования:</h3>
            <div className="flex flex-wrap gap-2">
                {identifiedObjects.map(obj => (
                    <button 
                        key={obj}
                        onClick={() => handleObjectClick(obj)}
                        className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors ${
                            selectedObject === obj 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        {obj.charAt(0).toUpperCase() + obj.slice(1)}
                    </button>
                ))}
            </div>
        </div>
      )}

      {selectedObject && (
        <div className='space-y-3 pt-2'>
          <div className='flex items-center gap-2 border-b pb-3'>
             <h3 className="text-sm font-medium text-gray-600">Преобразовать:</h3>
             <div className='flex items-center gap-1'>
                <button aria-label="Изменить размер" onClick={() => handleToolClick('resize')} className={`p-2 rounded-md ${activeTool === 'resize' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <ResizeIcon className='w-5 h-5' />
                </button>
                 <button aria-label="Повернуть" onClick={() => handleToolClick('rotate')} className={`p-2 rounded-md ${activeTool === 'rotate' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <RotateIcon className='w-5 h-5' />
                </button>
                 <button aria-label="Переместить" onClick={() => handleToolClick('reposition')} className={`p-2 rounded-md ${activeTool === 'reposition' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <RepositionIcon className='w-5 h-5' />
                </button>
             </div>
          </div>
          {activeTool && (
            <input 
              type="text"
              placeholder={toolPlaceholders[activeTool]}
              value={toolValue}
              onChange={(e) => setToolValue(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              disabled={isLoading}
            />
          )}
           <ReferenceImageUploader 
            image={referenceImage}
            onImageChange={onReferenceImageChange}
            disabled={isLoading}
           />
           <h3 className="text-sm font-medium text-gray-600 pt-2">Стиль:</h3>
        </div>
      )}

      <textarea
        rows={selectedObject ? 2 : 4}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition flex-grow"
        placeholder={placeholder}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isLoading}
      />
      <button
        onClick={onGenerate}
        disabled={isLoading || !isImageUploaded || (!prompt && !toolValue && !referenceImage)}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Создаю...
          </>
        ) : (
          <>
            <MagicWandIcon className="w-5 h-5" />
            {isEditing || selectedObject ? 'Применить правку' : 'Создать 4 дизайна'}
          </>
        )}
      </button>
    </div>
  );
};

import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PromptControls } from './components/PromptControls';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Loader } from './components/Loader';
import { generateInteriorDesigns, identifyObjectsInImage, identifyMajorElements } from './services/geminiService';
import { ImageFile } from './types';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [referenceImageFile, setReferenceImageFile] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>('Сделай эту комнату современной и минималистичной.');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<ImageFile[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [identifiedObjects, setIdentifiedObjects] = useState<string[]>([]);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState<boolean>(false);

  const [activeTool, setActiveTool] = useState<'resize' | 'rotate' | 'reposition' | null>(null);
  const [toolValue, setToolValue] = useState<string>('');

  const isEditing = historyIndex > 0;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

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

  const resetEditingState = () => {
    setGeneratedImages([]);
    setPrompt('');
    setIdentifiedObjects([]);
    setSelectedObject(null);
    setActiveTool(null);
    setToolValue('');
    setReferenceImageFile(null);
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      const newImageFile = {
        file,
        previewUrl: URL.createObjectURL(file),
      };
      setImageFile(newImageFile);
      setHistory([newImageFile]);
      setHistoryIndex(0);
      setPrompt('Сделай эту комнату современной и минималистичной.');
      resetEditingState();
    } else {
      setImageFile(null);
      setHistory([]);
      setHistoryIndex(-1);
    }
  };
  
  const handleReferenceImageChange = (file: File | null) => {
    if (file) {
      setReferenceImageFile({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    } else {
      setReferenceImageFile(null);
    }
  };

  const handleSelectForEditing = async (imageSrc: string) => {
    const file = await dataURItoFile(imageSrc, 'редактируемый-дизайн.png');
    if (file) {
        const newImageFile = {
            file,
            previewUrl: imageSrc,
        };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newImageFile);

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setImageFile(newImageFile);
        resetEditingState();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        setError("Не удалось выбрать изображение для редактирования.");
    }
  };

  const handleUndo = () => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setImageFile(history[newIndex]);
      resetEditingState();
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setImageFile(history[newIndex]);
      resetEditingState();
    }
  };
  
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleIdentifyObjects = useCallback(async () => {
    if (!imageFile) return;
    setIsIdentifying(true);
    setError(null);
    try {
      const base64Image = await fileToBase64(imageFile.file);
      const objects = await identifyObjectsInImage(base64Image, imageFile.file.type);
      setIdentifiedObjects(prev => [...new Set([...prev, ...objects])]);
    } catch (err) {
      console.error(err);
      setError('Не удалось распознать объекты на изображении.');
    } finally {
      setIsIdentifying(false);
    }
  }, [imageFile]);

  const handleIdentifyMajorElements = useCallback(async () => {
    if (!imageFile) return;
    setIsIdentifying(true);
    setError(null);
    try {
      const base64Image = await fileToBase64(imageFile.file);
      const elements = await identifyMajorElements(base64Image, imageFile.file.type);
      setIdentifiedObjects(prev => [...new Set([...prev, ...elements])]);
    } catch (err) {
      console.error(err);
      setError('Не удалось распознать основные элементы на изображении.');
    } finally {
      setIsIdentifying(false);
    }
  }, [imageFile]);

  const handleGenerate = useCallback(async () => {
    if (!imageFile || (!prompt && !toolValue && !referenceImageFile)) {
      setError('Пожалуйста, загрузите изображение и введите описание стиля или преобразования.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const base64Image = await fileToBase64(imageFile.file);
      const referenceImageBase64 = referenceImageFile ? await fileToBase64(referenceImageFile.file) : null;
      const referenceImageMimeType = referenceImageFile ? referenceImageFile.file.type : null;

      const designs = await generateInteriorDesigns(
        base64Image, 
        imageFile.file.type, 
        prompt, 
        isEditing, 
        selectedObject, 
        activeTool, 
        toolValue,
        referenceImageBase64,
        referenceImageMimeType
      );
      setGeneratedImages(designs);
      setSelectedObject(null);
      setActiveTool(null);
      setToolValue('');
      setReferenceImageFile(null);
    } catch (err) {
      console.error(err);
      setError('Не удалось создать дизайны. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, prompt, isEditing, selectedObject, activeTool, toolValue, referenceImageFile]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ImageUploader image={imageFile} onImageChange={handleImageChange} />
            <PromptControls 
              prompt={prompt}
              setPrompt={setPrompt}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              isImageUploaded={!!imageFile}
              isEditing={isEditing}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              onIdentifyObjects={handleIdentifyObjects}
              onIdentifyMajorElements={handleIdentifyMajorElements}
              isIdentifying={isIdentifying}
              identifiedObjects={identifiedObjects}
              selectedObject={selectedObject}
              setSelectedObject={setSelectedObject}
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              toolValue={toolValue}
              setToolValue={setToolValue}
              referenceImage={referenceImageFile}
              onReferenceImageChange={handleReferenceImageChange}
            />
          </div>
          
          {isLoading && <Loader />}
          
          {error && <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>}
          
          {generatedImages.length > 0 && <ResultsDisplay originalImage={imageFile?.previewUrl} generatedImages={generatedImages} onEdit={handleSelectForEditing} isEditing={isEditing} />}
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Работает на Gemini 2.5 Flash Image. Дизайны созданы искусственным интеллектом.</p>
      </footer>
    </div>
  );
};

export default App;
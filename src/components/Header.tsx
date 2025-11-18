import React from 'react';
import { SparklesIcon } from './icons';

export const Header: React.FC = () => (
  <header className="bg-white shadow-sm">
    <div className="container mx-auto px-4 py-5 text-center">
      <div className="flex items-center justify-center gap-3">
        <SparklesIcon className="w-8 h-8 text-indigo-500" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
          AI Дизайнер Интерьеров
        </h1>
      </div>
      <p className="mt-2 text-md md:text-lg text-gray-600 max-w-2xl mx-auto">
        Загрузите фото вашего пространства, опишите стиль вашей мечты, и позвольте ИИ создать для вас четыре уникальных дизайн-концепции.
      </p>
    </div>
  </header>
);

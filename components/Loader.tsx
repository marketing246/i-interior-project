import React from 'react';

export const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 bg-gray-50 rounded-lg">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
    <div className="text-gray-700">
      <p className="font-semibold text-lg">Создаю дизайны вашей новой комнаты...</p>
      <p className="text-sm">Это может занять до минуты. Пожалуйста, подождите.</p>
    </div>
  </div>
);
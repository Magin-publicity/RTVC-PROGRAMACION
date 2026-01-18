// src/components/UI/Loading.jsx
import React from 'react';

export const Loading = ({ size = 'md', text = 'Cargando...' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizes[size]} animate-spin`}>
        <div className="h-full w-full border-4 border-gray-200 rounded-full border-t-blue-600"></div>
      </div>
      {text && (
        <p className="mt-4 text-gray-600 text-sm">{text}</p>
      )}
    </div>
  );
};

export const LoadingOverlay = ({ text = 'Cargando...' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8">
        <Loading size="lg" text={text} />
      </div>
    </div>
  );
};
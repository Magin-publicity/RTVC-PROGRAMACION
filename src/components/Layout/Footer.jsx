// src/components/Layout/Footer.jsx
import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            © 2025 RTVC - Sistema de Programación. Todos los derechos reservados.
          </p>
          <p className="text-sm text-gray-500">
            Versión 1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
};
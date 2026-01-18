// src/components/Novelties/NoveltiesModal.jsx
import React from 'react';
import { X, Calendar, User as UserIcon } from 'lucide-react';
import { getNoveltyIcon, getNoveltyColor, getNoveltyBgColor } from '../../data/novelties';
import { formatDateShort } from '../../utils/dateUtils';

export const NoveltiesModal = ({ isOpen, onClose, novelties, personnel }) => {
  if (!isOpen) return null;

  // Ordenar novedades por fecha de inicio (más recientes primero)
  const sortedNovelties = [...novelties].sort((a, b) => {
    const dateA = new Date(a.start_date || a.date || 0);
    const dateB = new Date(b.start_date || b.date || 0);
    return dateB - dateA;
  });

  const getPersonnelName = (personnelId) => {
    const person = personnel.find(p => p.id === personnelId);
    return person?.name || 'Personal no encontrado';
  };

  const getDateRange = (novelty) => {
    if (novelty.start_date && novelty.end_date) {
      const start = formatDateShort(novelty.start_date);
      const end = formatDateShort(novelty.end_date);
      return `${start} - ${end}`;
    } else if (novelty.date) {
      return formatDateShort(novelty.date);
    } else if (novelty.start_date) {
      return `Desde ${formatDateShort(novelty.start_date)}`;
    }
    return 'Sin fecha';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Todas las Novedades ({novelties.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {sortedNovelties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedNovelties.map((novelty) => (
                <div
                  key={novelty.id}
                  className="bg-white border-2 rounded-lg p-4 hover:shadow-md transition-shadow"
                  style={{
                    borderColor: getNoveltyColor(novelty.type),
                  }}
                >
                  {/* Header de la tarjeta */}
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="px-3 py-1 rounded-full flex items-center gap-2"
                      style={{
                        backgroundColor: getNoveltyBgColor(novelty.type),
                        color: getNoveltyColor(novelty.type),
                      }}
                    >
                      <span className="text-lg">{getNoveltyIcon(novelty.type)}</span>
                      <span className="text-sm font-semibold">{novelty.type}</span>
                    </div>
                  </div>

                  {/* Información del personal */}
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {getPersonnelName(novelty.personnel_id)}
                    </span>
                  </div>

                  {/* Fecha */}
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {getDateRange(novelty)}
                    </span>
                  </div>

                  {/* Descripción */}
                  {novelty.description && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {novelty.description}
                      </p>
                    </div>
                  )}

                  {/* Estado */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      novelty.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {novelty.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No hay novedades registradas</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

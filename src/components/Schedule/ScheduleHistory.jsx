// src/components/Schedule/ScheduleHistory.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Download, Trash2, Eye } from 'lucide-react';
import { scheduleHistoryService } from '../../services/scheduleHistoryService';
import { Button } from '../UI/Button';

export const ScheduleHistory = ({ onLoadDate }) => {
  const [history, setHistory] = useState({});
  const [stats, setStats] = useState({ totalDays: 0, oldestDate: null, newestDate: null });
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const allHistory = scheduleHistoryService.getAll();
    const historyStats = scheduleHistoryService.getStats();
    setHistory(allHistory);
    setStats(historyStats);
  };

  const handleDeleteDay = (date) => {
    if (confirm(`¿Estás seguro de eliminar el historial del ${formatDate(date)}?`)) {
      scheduleHistoryService.deleteDay(date);
      loadHistory();
    }
  };

  const handleViewDay = (date) => {
    if (onLoadDate) {
      // Convertir fecha string a objeto Date
      const [year, month, day] = date.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      onLoadDate(dateObj);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedDates = Object.keys(history).sort().reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historial de Programación</h2>
          <p className="text-gray-600 mt-1">
            Consulta la programación guardada de días anteriores
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            <p><strong>{stats.totalDays}</strong> días guardados</p>
            {stats.oldestDate && (
              <p className="text-xs">
                Desde: {formatDate(stats.oldestDate)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total de Días</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalDays}</p>
            </div>
          </div>
        </div>

        {stats.oldestDate && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div>
              <p className="text-sm text-gray-600">Fecha Más Antigua</p>
              <p className="text-lg font-semibold text-green-900">
                {new Date(stats.oldestDate + 'T00:00:00').toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}

        {stats.newestDate && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div>
              <p className="text-sm text-gray-600">Fecha Más Reciente</p>
              <p className="text-lg font-semibold text-purple-900">
                {new Date(stats.newestDate + 'T00:00:00').toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lista de días guardados */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Días Guardados</h3>
        </div>

        {sortedDates.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
            <p>No hay historial guardado aún</p>
            <p className="text-sm mt-2">
              El historial se guarda automáticamente cuando trabajas en la programación
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedDates.map(date => {
              const dayData = history[date];
              return (
                <div
                  key={date}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {formatDate(date)}
                      </h4>
                      <div className="mt-1 text-sm text-gray-600 space-y-1">
                        <p>
                          Programas: <strong>{dayData.programs?.length || 0}</strong>
                        </p>
                        <p>
                          Asignaciones: <strong>{Object.keys(dayData.assignments || {}).filter(k => dayData.assignments[k]).length}</strong>
                        </p>
                        <p className="text-xs text-gray-500">
                          Guardado: {formatDateTime(dayData.savedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDay(date)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        title="Ver este día"
                      >
                        <Eye size={16} />
                        Ver
                      </button>
                      <button
                        onClick={() => handleDeleteDay(date)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                        title="Eliminar historial"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Información */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          ℹ️ Información sobre el Historial
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• El historial se guarda automáticamente cuando trabajas en la programación</li>
          <li>• Puedes ver la programación de cualquier día anterior haciendo clic en "Ver"</li>
          <li>• Los datos se guardan localmente en tu navegador</li>
          <li>• Si eliminas el historial de un día, no se puede recuperar</li>
        </ul>
      </div>
    </div>
  );
};

// src/components/Schedule/ScheduleHistory.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, ArrowLeft, Eye, Clock } from 'lucide-react';
import { HistoricalScheduleView } from './HistoricalScheduleView';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ScheduleHistory = ({ onLoadDate }) => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalDays: 0, oldestDate: null, newestDate: null });
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'detail'

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);

      // Cargar desde snapshots (historial inmutable)
      const response = await fetch(`${API_URL}/snapshots/list`);

      if (response.ok) {
        const data = await response.json();
        setHistory(data.snapshots || []);
        setStats(data.stats || { totalDays: 0, oldestDate: null, newestDate: null });
      } else {
        console.warn('No se pudo cargar el historial desde snapshots');
        setHistory([]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDay = (dateStr) => {
    // Convertir fecha string a objeto Date
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    setSelectedDate(dateObj);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedDate(null);
    setViewMode('list');
  };

  const handleBackToToday = () => {
    setSelectedDate(null);
    setViewMode('list');
    if (onLoadDate) {
      onLoadDate(new Date());
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

  // Si estamos en modo detalle, mostrar la vista histórica
  if (viewMode === 'detail' && selectedDate) {
    return (
      <HistoricalScheduleView
        selectedDate={selectedDate}
        onBack={handleBackToToday}
      />
    );
  }

  // Vista de lista de historial
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📚 Máquina del Tiempo</h2>
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

        {history.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
            <p>No hay historial guardado aún</p>
            <p className="text-sm mt-2">
              El historial se guarda automáticamente cuando trabajas en la programación y presionas "Guardar Jornada"
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {history.map(dayData => {
              const date = dayData.snapshot_date;
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
                          Personal: <strong>{dayData.total_personnel || 0}</strong>
                        </p>
                        <p>
                          Áreas: <strong>{dayData.total_areas || 0}</strong>
                        </p>
                        <p className="text-xs text-gray-500">
                          Guardado: {formatDateTime(dayData.saved_at)}
                        </p>
                        {dayData.is_locked && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                            <Clock size={12} />
                            Bloqueado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDay(date)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        title="Ver programación histórica"
                      >
                        <Eye size={16} />
                        Ver Programación
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
          ℹ️ Información sobre la Máquina del Tiempo
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• El historial se guarda automáticamente cuando presionas "Guardar Jornada"</li>
          <li>• Puedes ver la programación de cualquier día anterior haciendo clic en "Ver Programación"</li>
          <li>• Los datos históricos son de SOLO LECTURA - no se pueden modificar</li>
          <li>• Las novedades (viajes, permisos, etc.) se resaltan con colores especiales</li>
          <li>• Los datos se guardan permanentemente en la base de datos</li>
        </ul>
      </div>
    </div>
  );
};

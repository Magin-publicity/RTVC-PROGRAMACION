// src/components/Schedule/HistoricalScheduleView.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, AlertCircle, Plane, Briefcase, Coffee } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const HistoricalScheduleView = ({ selectedDate, onBack }) => {
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [novelties, setNovelties] = useState([]);

  useEffect(() => {
    loadHistoricalData();
    loadNovelties();
  }, [selectedDate]);

  const loadHistoricalData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dateStr = formatDateForAPI(selectedDate);

      // Intentar cargar desde snapshots primero
      const snapshotResponse = await fetch(`${API_URL}/snapshots/${dateStr}`);

      if (snapshotResponse.ok) {
        const snapshotData = await snapshotResponse.json();
        setHistoricalData({
          source: 'snapshot',
          data: snapshotData
        });
      } else {
        // Si no hay snapshot, cargar desde daily_schedules
        const dailyResponse = await fetch(`${API_URL}/schedule/daily/${dateStr}`);

        if (dailyResponse.ok) {
          const dailyData = await dailyResponse.json();
          setHistoricalData({
            source: 'daily',
            data: dailyData
          });
        } else {
          setError('No hay datos guardados para esta fecha');
        }
      }
    } catch (err) {
      console.error('Error loading historical data:', err);
      setError('Error al cargar los datos históricos');
    } finally {
      setLoading(false);
    }
  };

  const loadNovelties = async () => {
    try {
      const dateStr = formatDateForAPI(selectedDate);
      const response = await fetch(`${API_URL}/novelties/date/${dateStr}`);

      if (response.ok) {
        const data = await response.json();
        setNovelties(data.novelties || []);
      }
    } catch (err) {
      console.error('Error loading novelties:', err);
    }
  };

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date) => {
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    const months = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName} ${day} ${month} DE ${year}`;
  };

  const getNoveltyForPersonnel = (personnelId) => {
    return novelties.find(n => n.personnel_id === personnelId);
  };

  const getNoveltyIcon = (noveltyType) => {
    switch (noveltyType?.toLowerCase()) {
      case 'viaje':
        return <Plane size={16} className="text-blue-600" />;
      case 'capacitacion':
        return <Briefcase size={16} className="text-purple-600" />;
      case 'permiso':
        return <Coffee size={16} className="text-orange-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const getNoveltyStyle = (noveltyType) => {
    switch (noveltyType?.toLowerCase()) {
      case 'viaje':
        return 'bg-blue-100 border-blue-300';
      case 'capacitacion':
        return 'bg-purple-100 border-purple-300';
      case 'permiso':
        return 'bg-orange-100 border-orange-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos históricos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
        >
          <ArrowLeft size={20} />
          Volver al Hoy
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h3 className="text-lg font-semibold text-red-900 mb-2">No hay datos disponibles</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const renderSnapshotView = (data) => {
    // Agrupar por área
    const groupedByArea = {};
    data.shifts?.forEach(shift => {
      if (!groupedByArea[shift.area]) {
        groupedByArea[shift.area] = [];
      }
      groupedByArea[shift.area].push(shift);
    });

    return (
      <div className="space-y-6">
        {Object.entries(groupedByArea).map(([area, shifts]) => (
          <div key={area} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{area}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Personal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turno</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora Inicio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora Fin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {shifts.map((shift, idx) => {
                    const novelty = getNoveltyForPersonnel(shift.personnel_id);
                    const hasNovelty = !!novelty;

                    return (
                      <tr
                        key={idx}
                        className={hasNovelty ? getNoveltyStyle(novelty.novelty_type) : 'hover:bg-gray-50'}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{shift.personnel_name}</span>
                            {hasNovelty && (
                              <span className="flex items-center gap-1 text-xs">
                                {getNoveltyIcon(novelty.novelty_type)}
                                <span className="font-semibold">{novelty.novelty_type}</span>
                              </span>
                            )}
                          </div>
                          {shift.personnel_role && (
                            <span className="text-sm text-gray-500">{shift.personnel_role}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {shift.shift_label || `T${shift.shift_number}`}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {shift.shift_start_time}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {shift.shift_end_time || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            shift.status === 'ACTIVO' ? 'bg-green-100 text-green-800' :
                            shift.status === 'DE_VIAJE' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {shift.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDailyView = (data) => {
    // Aquí renderizamos la vista del formato daily_schedules
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 text-center">
          Vista de formato legacy (daily_schedules)
        </p>
        <p className="text-sm text-gray-500 text-center mt-2">
          {Object.keys(data.assignments || {}).length} asignaciones guardadas
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con botón Volver */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Volver al Hoy
          </button>
          <div className="h-8 w-px bg-gray-300"></div>
          <div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Calendar size={16} />
              <span>VISTA HISTÓRICA - SOLO LECTURA</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {formatDateDisplay(selectedDate)}
            </h2>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            <Clock size={16} />
            Histórico
          </span>
        </div>
      </div>

      {/* Banner informativo */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-semibold text-yellow-900">
              📖 Modo Solo Lectura
            </h4>
            <p className="text-sm text-yellow-800 mt-1">
              Estás viendo la programación histórica del {formatDateDisplay(selectedDate)}.
              Los datos no pueden ser modificados. Para editar, vuelve a la vista de "Hoy".
            </p>
          </div>
        </div>
      </div>

      {/* Contenido histórico */}
      {historicalData?.source === 'snapshot' ? (
        renderSnapshotView(historicalData.data)
      ) : (
        renderDailyView(historicalData.data)
      )}

      {/* Novedades del día */}
      {novelties.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Novedades del Día
          </h3>
          <div className="space-y-2">
            {novelties.map(novelty => (
              <div
                key={novelty.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                {getNoveltyIcon(novelty.novelty_type)}
                <div>
                  <span className="font-medium text-gray-900">{novelty.personnel_name}</span>
                  <span className="text-gray-600 mx-2">•</span>
                  <span className="text-gray-700">{novelty.novelty_type}</span>
                  {novelty.description && (
                    <p className="text-sm text-gray-600 mt-1">{novelty.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

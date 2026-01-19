import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function LogisticsDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dashboard, setDashboard] = useState({
    personnel: [],
    liveu: { disponibles: 0, en_terreno: 0, en_reparacion: 0, total: 0 },
    active_dispatches: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    // Recargar cada 30 segundos para mantener actualizado
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/logistics/dashboard/${selectedDate}`);
      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Dashboard Logístico</h1>
        <p className="text-gray-600">Control en tiempo real de personal y equipos</p>
      </div>

      {/* Selector de Fecha */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={loadDashboard}
          className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🔄 Actualizar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando dashboard...</p>
        </div>
      ) : (
        <>
          {/* Estadísticas de LiveU */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📡 Equipos LiveU</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Disponibles</p>
                    <p className="text-4xl font-bold text-green-600">{dashboard.liveu.disponibles}</p>
                  </div>
                  <div className="text-green-500">
                    <span className="text-5xl">🟢</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">En Terreno</p>
                    <p className="text-4xl font-bold text-blue-600">{dashboard.liveu.en_terreno}</p>
                  </div>
                  <div className="text-blue-500">
                    <span className="text-5xl">🔵</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Reparación</p>
                    <p className="text-4xl font-bold text-red-600">{dashboard.liveu.en_reparacion}</p>
                  </div>
                  <div className="text-red-500">
                    <span className="text-5xl">🔴</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-4xl font-bold text-gray-800">{dashboard.liveu.total}</p>
                  </div>
                  <div className="text-gray-500">
                    <span className="text-5xl">📡</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas de Personal por Área */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 Estado del Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dashboard.personnel.map((areaData) => (
                <div key={areaData.area} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                    {areaData.area}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">🟢 En Canal:</span>
                      <span className="text-2xl font-bold text-green-600">{areaData.en_canal || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">🔵 En Terreno:</span>
                      <span className="text-2xl font-bold text-blue-600">{areaData.en_terreno || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">⚪ Descanso:</span>
                      <span className="text-2xl font-bold text-gray-600">{areaData.descanso || 0}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-xs text-gray-500">Total programado:</span>
                      <span className="ml-2 text-lg font-bold text-gray-800">{areaData.total_programado}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Despachos Activos */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🚗 Despachos Activos</h2>
            {dashboard.active_dispatches.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periodista</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LiveU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboard.active_dispatches.map((dispatch) => (
                      <tr key={dispatch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {dispatch.departure_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          🚗 {dispatch.vehicle_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dispatch.journalist_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {dispatch.cameraman_name && `📹 ${dispatch.cameraman_name}`}
                          {dispatch.assistant_name && ` / 🎬 ${dispatch.assistant_name}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {dispatch.liveu_code ? `📡 ${dispatch.liveu_code}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {dispatch.destination}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            dispatch.status === 'PROGRAMADO' ? 'bg-yellow-100 text-yellow-800' :
                            dispatch.status === 'EN_RUTA' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {dispatch.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                <p className="text-lg">No hay despachos activos para esta fecha</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

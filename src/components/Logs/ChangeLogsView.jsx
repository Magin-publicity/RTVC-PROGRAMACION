// src/components/Logs/ChangeLogsView.jsx
import React, { useState, useEffect } from 'react';
import { FileText, Calendar, User, Filter, Trash2 } from 'lucide-react';
import { changeLogService } from '../../services/changeLogService';
import { Button } from '../UI/Button';

export const ChangeLogsView = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const allLogs = changeLogService.getAll();
    const statistics = changeLogService.getStats();
    setLogs(allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    setStats(statistics);
  };

  const handleClearOldLogs = () => {
    if (confirm('¿Estás seguro de eliminar los logs de más de 30 días?')) {
      const removed = changeLogService.clearOldLogs();
      alert(`Se eliminaron ${removed} logs antiguos`);
      loadLogs();
    }
  };

  const handleClearAllLogs = () => {
    if (confirm('¿Estás seguro de eliminar TODOS los logs? Esta acción no se puede deshacer.')) {
      changeLogService.clearAll();
      alert('Todos los logs han sido eliminados');
      loadLogs();
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTypeLabel = (type) => {
    const labels = {
      'assignment': 'Asignación',
      'program_time': 'Horario de Programa',
      'program_master': 'Master de Programa',
      'program_studio': 'Estudio de Programa',
      'program_status': 'Estado de Programa',
      'program_created': 'Programa Creado',
      'program_deleted': 'Programa Eliminado'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      'assignment': 'bg-blue-100 text-blue-800',
      'program_time': 'bg-purple-100 text-purple-800',
      'program_master': 'bg-green-100 text-green-800',
      'program_studio': 'bg-yellow-100 text-yellow-800',
      'program_status': 'bg-red-100 text-red-800',
      'program_created': 'bg-teal-100 text-teal-800',
      'program_deleted': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Filtrar logs
  const filteredLogs = logs.filter(log => {
    if (filterDate && log.date !== filterDate) return false;
    if (filterType !== 'all' && log.type !== filterType) return false;
    if (filterUser !== 'all' && log.user !== filterUser) return false;
    return true;
  });

  // Obtener usuarios únicos
  const uniqueUsers = [...new Set(logs.map(log => log.user))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registro de Cambios</h2>
          <p className="text-gray-600 mt-1">
            Historial completo de modificaciones en la programación
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleClearOldLogs}
            icon={<Trash2 size={16} />}
          >
            Limpiar Antiguos
          </Button>
          <Button
            variant="ghost"
            onClick={handleClearAllLogs}
            className="text-red-600 hover:bg-red-50"
            icon={<Trash2 size={16} />}
          >
            Limpiar Todos
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total de Cambios</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalChanges || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <User className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-green-900">{uniqueUsers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Días con Cambios</p>
              <p className="text-2xl font-bold text-purple-900">
                {Object.keys(stats.changesByDate || {}).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div>
            <p className="text-sm text-gray-600">Tipo Más Común</p>
            <p className="text-lg font-semibold text-yellow-900">
              {stats.changesByType && Object.keys(stats.changesByType).length > 0
                ? getTypeLabel(Object.entries(stats.changesByType).sort((a, b) => b[1] - a[1])[0][0])
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Cambio
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="assignment">Asignaciones</option>
              <option value="program_master">Cambios de Master</option>
              <option value="program_studio">Cambios de Estudio</option>
              <option value="program_time">Cambios de Horario</option>
              <option value="program_status">Cambios de Estado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>

        {(filterDate || filterType !== 'all' || filterUser !== 'all') && (
          <div className="mt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setFilterDate('');
                setFilterType('all');
                setFilterUser('all');
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Lista de Logs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Cambios Recientes ({filteredLogs.length})
          </h3>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
            <p>No hay logs que mostrar</p>
            <p className="text-sm mt-2">
              Los cambios se registran automáticamente cuando trabajas en la programación
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(log.type)}`}>
                        {getTypeLabel(log.type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-900 mb-2">
                      {log.description}
                    </p>

                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">Fecha:</span>{' '}
                        <span className="font-medium">
                          {new Date(log.date + 'T00:00:00').toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Usuario:</span>{' '}
                        <span className="font-medium">{log.user}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Entidad:</span>{' '}
                        <span className="font-medium">{log.entityName}</span>
                      </div>
                    </div>

                    {(log.previousValue !== undefined && log.newValue !== undefined) && (
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-red-50 text-red-700 rounded">
                          {String(log.previousValue)}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                          {String(log.newValue)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

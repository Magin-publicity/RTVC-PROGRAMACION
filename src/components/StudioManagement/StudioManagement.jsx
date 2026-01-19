import React, { useState, useEffect } from 'react';
import { Building, Monitor, Tv, Users, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

export const StudioManagement = () => {
  const [activeTab, setActiveTab] = useState('studios');
  const [studios, setStudios] = useState([]);
  const [masters, setMasters] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'studios') {
        const response = await fetch('/api/studios');
        const data = await response.json();
        setStudios(data);
      } else if (activeTab === 'masters') {
        const response = await fetch('/api/masters');
        const data = await response.json();
        setMasters(data);
      } else if (activeTab === 'programs') {
        const response = await fetch('/api/programs');
        const data = await response.json();
        setPrograms(data);
      }
    } catch (err) {
      setError('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('¿Está seguro de eliminar este elemento?')) return;

    try {
      const endpoint = type === 'studios' ? 'studios' : type === 'masters' ? 'masters' : 'programs';
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar');
      }

      loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const renderStudios = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Gestión de Estudios</h3>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nuevo Estudio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {studios.map(studio => (
          <div key={studio.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Tv size={24} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{studio.nombre}</h4>
                  <p className="text-sm text-gray-500">Código: {studio.codigo}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingItem(studio);
                    setShowForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(studio.id, 'studios')}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {studio.descripcion && (
              <p className="text-sm text-gray-600 mb-3">{studio.descripcion}</p>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {studio.capacidad ? `Capacidad: ${studio.capacidad}` : 'Sin capacidad definida'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                studio.estado === 'activo'
                  ? 'bg-green-100 text-green-800'
                  : studio.estado === 'inactivo'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {studio.estado}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMasters = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Gestión de Masters</h3>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nuevo Master
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {masters.map(master => (
          <div key={master.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Monitor size={24} className="text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{master.nombre}</h4>
                  <p className="text-sm text-gray-500">Código: {master.codigo}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingItem(master);
                    setShowForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(master.id, 'masters')}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {master.descripcion && (
              <p className="text-sm text-gray-600 mb-3">{master.descripcion}</p>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {master.tipo ? master.tipo.replace('_', ' ') : 'Sin tipo'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                master.estado === 'activo'
                  ? 'bg-green-100 text-green-800'
                  : master.estado === 'inactivo'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {master.estado}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrograms = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Gestión de Programas</h3>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nuevo Programa
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Master</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {programs.map(program => (
              <tr key={program.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{program.nombre}</div>
                  {program.descripcion && (
                    <div className="text-sm text-gray-500">{program.descripcion}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {program.estudio_nombre || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {program.master_nombre || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {program.horario_inicio} - {program.horario_fin}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {program.tipo || '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    program.estado === 'activo'
                      ? 'bg-green-100 text-green-800'
                      : program.estado === 'inactivo'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {program.estado}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(program);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(program.id, 'programs')}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Estudios y Masters</h1>
        <p className="text-gray-600 mt-2">Administra estudios, masters y programas de televisión</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md p-1">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab('studios');
              setShowForm(false);
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'studios'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Tv size={20} />
            Estudios
          </button>
          <button
            onClick={() => {
              setActiveTab('masters');
              setShowForm(false);
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'masters'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Monitor size={20} />
            Masters
          </button>
          <button
            onClick={() => {
              setActiveTab('programs');
              setShowForm(false);
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'programs'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building size={20} />
            Programas
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <XCircle size={20} />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Content */}
      {!loading && !showForm && (
        <>
          {activeTab === 'studios' && renderStudios()}
          {activeTab === 'masters' && renderMasters()}
          {activeTab === 'programs' && renderPrograms()}
        </>
      )}
    </div>
  );
};

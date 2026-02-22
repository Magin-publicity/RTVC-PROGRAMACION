// src/components/Meals/MealGroupsModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Users, Plus, Search } from 'lucide-react';

const API_URL = '/api';

export const MealGroupsModal = ({ isOpen, onClose, serviceType }) => {
  const [groups, setGroups] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    service_type: serviceType || 'ALMUERZO',
    personnel_ids: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, serviceType]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupsRes, personnelRes] = await Promise.all([
        fetch(`${API_URL}/meals/groups?service_type=${serviceType || 'ALMUERZO'}`).then(r => r.json()),
        fetch(`${API_URL}/routes/logistic-personnel`).then(r => r.json())  // Personal logístico (tipo_personal = LOGISTICO)
      ]);
      setGroups(groupsRes);
      setPersonnel(personnelRes);
    } catch (err) {
      setError('Error cargando datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedGroup(null);
    setError(null);
    setFormData({
      name: '',
      description: '',
      service_type: serviceType || 'ALMUERZO',
      personnel_ids: []
    });
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setIsCreating(false);
    setError(null);
    setFormData({
      name: group.name,
      description: group.description || '',
      service_type: group.service_type,
      personnel_ids: group.personnel_ids || []
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (formData.personnel_ids.length === 0) {
      setError('Debe seleccionar al menos una persona');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (selectedGroup) {
        await fetch(`${API_URL}/meals/groups/${selectedGroup.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch(`${API_URL}/meals/groups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      await loadData();
      setIsCreating(false);
      setSelectedGroup(null);
      setFormData({ name: '', description: '', service_type: serviceType || 'ALMUERZO', personnel_ids: [] });
    } catch (err) {
      setError(err.message || 'Error guardando grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (groupId) => {
    if (!confirm('¿Está seguro de eliminar este grupo?')) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/meals/groups/${groupId}`, { method: 'DELETE' });
      await loadData();
      setSelectedGroup(null);
      setIsCreating(false);
    } catch (err) {
      setError('Error eliminando grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePersonnel = (personnelId) => {
    setFormData(prev => ({
      ...prev,
      personnel_ids: prev.personnel_ids.includes(personnelId)
        ? prev.personnel_ids.filter(id => id !== personnelId)
        : [...prev.personnel_ids, personnelId]
    }));
  };

  const handleLoadGroup = (group) => {
    if (onClose) onClose(group);
  };

  // Filtrar personal por búsqueda
  const filteredPersonnel = personnel.filter(p => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return p.name?.toLowerCase().includes(term) || p.area?.toLowerCase().includes(term);
  });

  // Agrupar personal filtrado por área
  const personnelByArea = filteredPersonnel.reduce((acc, p) => {
    const area = p.area || 'OTRO';
    if (!acc[area]) acc[area] = [];
    acc[area].push(p);
    return acc;
  }, {});

  const SERVICE_LABELS = {
    DESAYUNO: 'Desayuno (06:00)',
    ALMUERZO: 'Almuerzo (12:00)',
    CENA: 'Cena (18:00)'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-orange-600 text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            <h2 className="text-xl font-bold">Plantillas de Alimentación — {serviceType}</h2>
          </div>
          <button onClick={() => onClose(null)} className="text-white hover:bg-orange-700 p-2 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm flex-shrink-0">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex min-h-0">

          {/* Lista de grupos — izquierda */}
          <div className="w-72 border-r overflow-y-auto p-4 flex-shrink-0">
            <button
              onClick={handleCreateNew}
              disabled={loading}
              className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
            >
              <Plus className="w-4 h-4" />
              Crear Nueva Plantilla
            </button>

            {groups.length === 0 && !loading && (
              <p className="text-gray-500 text-center py-4 text-sm">No hay plantillas creadas</p>
            )}

            <div className="space-y-2">
              {groups.map(group => (
                <div
                  key={group.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedGroup?.id === group.id ? 'bg-orange-50 border-orange-400' : 'border-gray-200'
                  }`}
                  onClick={() => handleSelectGroup(group)}
                >
                  <div className="font-semibold text-gray-900">{group.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {group.personnel_ids?.length || 0} personas · {group.service_type}
                  </div>
                  {group.description && (
                    <div className="text-xs text-gray-400 mt-1 truncate">{group.description}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Botones rápidos de carga */}
            {groups.length > 0 && !isCreating && !selectedGroup && (
              <div className="mt-6 border-t pt-4">
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase">Cargar en alimentación:</p>
                <div className="space-y-1">
                  {groups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => handleLoadGroup(group)}
                      className="w-full text-left px-3 py-2 text-sm bg-green-50 border border-green-200 text-green-700 rounded hover:bg-green-100 transition-colors"
                    >
                      ▶ {group.name} ({group.personnel_ids?.length || 0})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Formulario — derecha */}
          <div className="flex-1 overflow-y-auto p-6">
            {(isCreating || selectedGroup) ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedGroup ? `Editando: ${selectedGroup.name}` : 'Nueva Plantilla'}
                </h3>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Plantilla <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Equipo Noticiero AM"
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows="2"
                    placeholder="Descripción opcional"
                    disabled={loading}
                  />
                </div>

                {/* Servicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                  <select
                    value={formData.service_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="DESAYUNO">Desayuno (06:00)</option>
                    <option value="ALMUERZO">Almuerzo (12:00)</option>
                    <option value="CENA">Cena (18:00)</option>
                  </select>
                </div>

                {/* Personal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Logístico{' '}
                    <span className="text-orange-600 font-semibold">
                      ({formData.personnel_ids.length} seleccionados)
                    </span>
                  </label>

                  {/* Miembros actuales de la plantilla */}
                  {formData.personnel_ids.length > 0 && (
                    <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-orange-700">
                          Miembros de la plantilla ({formData.personnel_ids.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, personnel_ids: [] }))}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Quitar todos
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.personnel_ids.map(id => {
                          const person = personnel.find(p => p.id === id);
                          if (!person) return null;
                          return (
                            <span
                              key={id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs cursor-pointer hover:bg-orange-200"
                              onClick={() => handleTogglePersonnel(id)}
                              title="Click para quitar"
                            >
                              {person.name}
                              <X className="w-3 h-3" />
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Buscador */}
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre o área..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                  </div>

                  {loading ? (
                    <div className="text-center py-6 text-gray-500">Cargando personal...</div>
                  ) : personnel.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 border rounded-lg">
                      No hay personal logístico disponible
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      {/* Seleccionar / Deseleccionar todos */}
                      <div className="bg-gray-50 px-3 py-2 border-b flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {searchTerm ? `${filteredPersonnel.length} de ${personnel.length}` : `${personnel.length} personas disponibles`}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, personnel_ids: personnel.map(p => p.id) }))}
                            className="text-xs text-orange-600 hover:underline"
                          >
                            Todos
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, personnel_ids: [] }))}
                            className="text-xs text-gray-500 hover:underline"
                          >
                            Ninguno
                          </button>
                        </div>
                      </div>

                      <div className="max-h-72 overflow-y-auto">
                        {Object.entries(personnelByArea).sort().map(([area, areaPersonnel]) => (
                          <div key={area}>
                            <div className="bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 uppercase sticky top-0">
                              {area} ({areaPersonnel.length})
                            </div>
                            {areaPersonnel.map(person => {
                              const selected = formData.personnel_ids.includes(person.id);
                              return (
                                <div
                                  key={person.id}
                                  onClick={() => handleTogglePersonnel(person.id)}
                                  className={`px-3 py-2 border-b border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                    selected ? 'bg-orange-50' : ''
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                    selected ? 'bg-orange-600 border-orange-600' : 'border-gray-300'
                                  }`}>
                                    {selected && <span className="text-white text-xs font-bold">✓</span>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 text-sm truncate">{person.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{person.area}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {selectedGroup ? 'Actualizar Plantilla' : 'Crear Plantilla'}
                  </button>

                  {selectedGroup && (
                    <>
                      <button
                        onClick={() => handleLoadGroup(selectedGroup)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                      >
                        ▶ Cargar
                      </button>
                      <button
                        onClick={() => handleDelete(selectedGroup.id)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-16">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Selecciona una plantilla para editarla</p>
                <p className="text-sm mt-1">o crea una nueva con el botón de la izquierda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

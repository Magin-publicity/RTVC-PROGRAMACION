// src/components/ExclusiveGroups/ExclusiveGroupsModal.jsx
// Modal para gestionar Grupos Exclusivos (MASTER, MÓVIL, PUESTO FIJO)

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Users, Plus, Search, Radio, Truck, MapPin, AlertTriangle } from 'lucide-react';
import { exclusiveGroupsService } from '../../services/exclusiveGroupsService';

const API_URL = '/api';

// Configuración de tipos de grupo
const GROUP_TYPES = {
  MASTER: {
    label: 'Master/Estudio',
    description: 'Equipo que opera un Master o Estudio',
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-700',
    icon: Radio
  },
  MOVIL: {
    label: 'Móvil',
    description: 'Equipo en unidad móvil con vehículo',
    color: '#10b981',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-400',
    textColor: 'text-green-700',
    icon: Truck
  },
  PUESTO_FIJO: {
    label: 'Puesto Fijo',
    description: 'Personal en ubicación externa fija',
    color: '#f59e0b',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-700',
    icon: MapPin
  }
};

export const ExclusiveGroupsModal = ({ isOpen, onClose, selectedDate, onGroupAssigned }) => {
  const [groups, setGroups] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [masters, setMasters] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // null = all, or 'MASTER', 'MOVIL', 'PUESTO_FIJO'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    group_type: 'MASTER',
    master_id: null,
    vehicle_id: null,
    driver_id: null,
    location_name: '',
    location_address: '',
    personnel_ids: [],
    color: '#3b82f6'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, selectedDate]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupsData, personnelRes, mastersData, vehiclesData, driversData] = await Promise.all([
        exclusiveGroupsService.getAll(null, false),
        fetch(`${API_URL}/routes/logistic-personnel`).then(r => r.json()),
        exclusiveGroupsService.getMasters(),
        exclusiveGroupsService.getVehicles(),
        exclusiveGroupsService.getDrivers()
      ]);
      setGroups(groupsData);
      setPersonnel(personnelRes);
      setMasters(mastersData);
      setVehicles(vehiclesData);
      setDrivers(driversData);

      // Cargar asignaciones si hay fecha seleccionada
      if (selectedDate) {
        const assignmentsData = await exclusiveGroupsService.getAssignments(selectedDate);
        setAssignments(assignmentsData);
      }
    } catch (err) {
      setError('Error cargando datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = (groupType = 'MASTER') => {
    setIsCreating(true);
    setSelectedGroup(null);
    setError(null);
    const config = GROUP_TYPES[groupType];
    setFormData({
      name: '',
      description: '',
      group_type: groupType,
      master_id: null,
      vehicle_id: null,
      driver_id: null,
      location_name: '',
      location_address: '',
      personnel_ids: [],
      color: config.color
    });
  };

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    setIsCreating(false);
    setError(null);

    // Cargar detalles completos del grupo
    try {
      const fullGroup = await exclusiveGroupsService.getById(group.id);
      setFormData({
        name: fullGroup.name,
        description: fullGroup.description || '',
        group_type: fullGroup.group_type,
        master_id: fullGroup.master_id,
        vehicle_id: fullGroup.vehicle_id,
        driver_id: fullGroup.driver_id,
        location_name: fullGroup.location_name || '',
        location_address: fullGroup.location_address || '',
        personnel_ids: fullGroup.personnel_ids || [],
        color: fullGroup.color || GROUP_TYPES[fullGroup.group_type].color
      });
    } catch (err) {
      console.error('Error cargando grupo:', err);
    }
  };

  const handleSave = async () => {
    // Validaciones
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (formData.group_type === 'MASTER' && !formData.master_id) {
      setError('Debe seleccionar un Master/Estudio');
      return;
    }
    if (formData.group_type === 'MOVIL' && (!formData.vehicle_id || !formData.driver_id)) {
      setError('Debe seleccionar vehículo y conductor');
      return;
    }
    if (formData.group_type === 'PUESTO_FIJO' && !formData.location_name.trim()) {
      setError('Debe especificar la ubicación');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (selectedGroup) {
        await exclusiveGroupsService.update(selectedGroup.id, formData);
      } else {
        await exclusiveGroupsService.create(formData);
      }
      await loadData();
      setIsCreating(false);
      setSelectedGroup(null);
      resetForm();
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
      await exclusiveGroupsService.delete(groupId);
      await loadData();
      setSelectedGroup(null);
      setIsCreating(false);
      resetForm();
    } catch (err) {
      setError('Error eliminando grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToDate = async (group) => {
    if (!selectedDate) {
      setError('No hay fecha seleccionada');
      return;
    }

    setLoading(true);
    try {
      const result = await exclusiveGroupsService.assign(group.id, selectedDate);

      if (result.alerts && result.alerts.length > 0) {
        alert(`Grupo asignado con alertas:\n${result.alerts.map(a => a.message).join('\n')}`);
      }

      await loadData();
      if (onGroupAssigned) onGroupAssigned(result);
    } catch (err) {
      setError(err.message || 'Error asignando grupo');
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      group_type: 'MASTER',
      master_id: null,
      vehicle_id: null,
      driver_id: null,
      location_name: '',
      location_address: '',
      personnel_ids: [],
      color: '#3b82f6'
    });
  };

  // Filtrar grupos por tipo
  const filteredGroups = activeTab
    ? groups.filter(g => g.group_type === activeTab)
    : groups;

  // Filtrar personal por búsqueda
  const filteredPersonnel = personnel.filter(p => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return p.name?.toLowerCase().includes(term) ||
           p.area?.toLowerCase().includes(term);
  });

  // Agrupar personal por área
  const personnelByArea = filteredPersonnel.reduce((acc, p) => {
    const area = p.area || 'OTRO';
    if (!acc[area]) acc[area] = [];
    acc[area].push(p);
    return acc;
  }, {});

  // Verificar si un grupo está asignado hoy
  const isGroupAssignedToday = (groupId) => {
    return assignments.some(a => a.group_id === groupId);
  };

  if (!isOpen) return null;

  const currentConfig = GROUP_TYPES[formData.group_type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-green-600 to-amber-500 text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Grupos Exclusivos</h2>
              {selectedDate && (
                <p className="text-sm text-white/80">Fecha: {selectedDate}</p>
              )}
            </div>
          </div>
          <button onClick={() => onClose()} className="text-white hover:bg-white/20 p-2 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs de tipos */}
        <div className="border-b flex gap-2 px-4 py-2 bg-gray-50 flex-shrink-0">
          <button
            onClick={() => setActiveTab(null)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === null ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos ({groups.length})
          </button>
          {Object.entries(GROUP_TYPES).map(([type, config]) => {
            const count = groups.filter(g => g.group_type === type).length;
            const Icon = config.icon;
            return (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === type
                    ? `${config.bgColor} ${config.textColor} ${config.borderColor} border-2`
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {config.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm flex-shrink-0 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex min-h-0">

          {/* Lista de grupos — izquierda */}
          <div className="w-80 border-r overflow-y-auto p-4 flex-shrink-0 bg-gray-50">
            {/* Botones crear nuevo */}
            <div className="mb-4 space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Crear Nuevo Grupo:</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(GROUP_TYPES).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => handleCreateNew(type)}
                      disabled={loading}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 hover:shadow-md transition-all disabled:opacity-50 ${config.bgColor} ${config.borderColor}`}
                    >
                      <Icon className={`w-5 h-5 ${config.textColor}`} />
                      <span className={`text-xs font-medium ${config.textColor}`}>
                        {type === 'PUESTO_FIJO' ? 'Fijo' : config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista de grupos existentes */}
            {filteredGroups.length === 0 && !loading && (
              <p className="text-gray-500 text-center py-4 text-sm">No hay grupos creados</p>
            )}

            <div className="space-y-2">
              {filteredGroups.map(group => {
                const config = GROUP_TYPES[group.group_type];
                const Icon = config.icon;
                const isAssigned = isGroupAssignedToday(group.id);

                return (
                  <div
                    key={group.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer hover:shadow-md transition-all ${
                      selectedGroup?.id === group.id
                        ? `${config.bgColor} ${config.borderColor}`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectGroup(group)}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={`w-5 h-5 mt-0.5 ${config.textColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {group.name}
                          {isAssigned && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                              Asignado
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {group.personnel_count || group.personnel_ids?.length || 0} personas
                        </div>
                        {group.group_type === 'MASTER' && group.master_name && (
                          <div className="text-xs text-blue-600 mt-1 truncate">{group.master_name}</div>
                        )}
                        {group.group_type === 'MOVIL' && group.vehicle_plate && (
                          <div className="text-xs text-green-600 mt-1">{group.vehicle_plate}</div>
                        )}
                        {group.group_type === 'PUESTO_FIJO' && group.location_name && (
                          <div className="text-xs text-amber-600 mt-1 truncate">{group.location_name}</div>
                        )}
                      </div>
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: group.color || config.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Asignar grupos a fecha */}
            {selectedDate && filteredGroups.length > 0 && !isCreating && !selectedGroup && (
              <div className="mt-6 border-t pt-4">
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase">
                  Asignar para {selectedDate}:
                </p>
                <div className="space-y-1">
                  {filteredGroups.filter(g => !isGroupAssignedToday(g.id)).map(group => {
                    const config = GROUP_TYPES[group.group_type];
                    return (
                      <button
                        key={group.id}
                        onClick={() => handleAssignToDate(group)}
                        disabled={loading}
                        className={`w-full text-left px-3 py-2 text-sm ${config.bgColor} border ${config.borderColor} ${config.textColor} rounded hover:shadow transition-all disabled:opacity-50`}
                      >
                        ▶ {group.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Formulario — derecha */}
          <div className="flex-1 overflow-y-auto p-6">
            {(isCreating || selectedGroup) ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {React.createElement(currentConfig.icon, {
                    className: `w-6 h-6 ${currentConfig.textColor}`
                  })}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedGroup ? `Editando: ${selectedGroup.name}` : `Nuevo Grupo ${currentConfig.label}`}
                  </h3>
                </div>

                {/* Tipo de grupo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Grupo</label>
                  <div className="flex gap-2">
                    {Object.entries(GROUP_TYPES).map(([type, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            group_type: type,
                            color: config.color,
                            master_id: null,
                            vehicle_id: null,
                            driver_id: null,
                            location_name: '',
                            location_address: ''
                          }))}
                          disabled={loading || selectedGroup} // No cambiar tipo al editar
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                            formData.group_type === type
                              ? `${config.bgColor} ${config.borderColor} ${config.textColor}`
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          } ${selectedGroup ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Grupo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Equipo Master Principal"
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${currentConfig.borderColor} focus:ring-opacity-50`}
                    style={{ '--tw-ring-color': currentConfig.color }}
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    rows="2"
                    placeholder="Descripción opcional del grupo"
                    disabled={loading}
                  />
                </div>

                {/* Campos específicos por tipo */}
                {formData.group_type === 'MASTER' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      <Radio className="w-4 h-4 inline mr-2" />
                      Seleccionar Master/Estudio <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.master_id || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, master_id: e.target.value ? parseInt(e.target.value) : null }))}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Seleccionar...</option>
                      {masters.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.nombre} {m.codigo ? `(${m.codigo})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.group_type === 'MOVIL' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">
                        <Truck className="w-4 h-4 inline mr-2" />
                        Vehículo <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.vehicle_id || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, vehicle_id: e.target.value ? parseInt(e.target.value) : null }))}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      >
                        <option value="">Seleccionar vehículo...</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.placa} - {v.marca} {v.modelo} (Cap: {v.capacidad})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">
                        Conductor <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.driver_id || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, driver_id: e.target.value ? parseInt(e.target.value) : null }))}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      >
                        <option value="">Seleccionar conductor...</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {formData.group_type === 'PUESTO_FIJO' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-amber-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Nombre de la Ubicación <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.location_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
                        placeholder="Ej: Congreso, Presidencia, Aeropuerto..."
                        disabled={loading}
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-700 mb-2">
                        Dirección (opcional)
                      </label>
                      <input
                        type="text"
                        value={formData.location_address}
                        onChange={(e) => setFormData(prev => ({ ...prev, location_address: e.target.value }))}
                        placeholder="Dirección específica..."
                        disabled={loading}
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}

                {/* Color personalizado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color del Grupo</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 rounded border cursor-pointer"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-500">
                      Este color se mostrará en la programación
                    </span>
                  </div>
                </div>

                {/* Personal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal del Grupo{' '}
                    <span className={`${currentConfig.textColor} font-semibold`}>
                      ({formData.personnel_ids.length} seleccionados)
                    </span>
                  </label>

                  {/* Miembros actuales */}
                  {formData.personnel_ids.length > 0 && (
                    <div className={`mb-3 p-3 ${currentConfig.bgColor} border ${currentConfig.borderColor} rounded-lg`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-semibold ${currentConfig.textColor}`}>
                          Miembros del grupo ({formData.personnel_ids.length})
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
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs cursor-pointer hover:opacity-80`}
                              style={{ backgroundColor: formData.color + '30', color: formData.color }}
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
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                    />
                  </div>

                  {loading ? (
                    <div className="text-center py-6 text-gray-500">Cargando personal...</div>
                  ) : personnel.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 border rounded-lg">
                      No hay personal disponible
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {searchTerm ? `${filteredPersonnel.length} de ${personnel.length}` : `${personnel.length} personas disponibles`}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, personnel_ids: personnel.map(p => p.id) }))}
                            className={`text-xs ${currentConfig.textColor} hover:underline`}
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

                      <div className="max-h-60 overflow-y-auto">
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
                                    selected ? currentConfig.bgColor : ''
                                  }`}
                                >
                                  <div
                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0`}
                                    style={{
                                      backgroundColor: selected ? formData.color : 'white',
                                      borderColor: selected ? formData.color : '#d1d5db'
                                    }}
                                  >
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
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium"
                    style={{ backgroundColor: formData.color }}
                  >
                    <Save className="w-4 h-4" />
                    {selectedGroup ? 'Actualizar Grupo' : 'Crear Grupo'}
                  </button>

                  {selectedGroup && selectedDate && (
                    <button
                      onClick={() => handleAssignToDate(selectedGroup)}
                      disabled={loading || isGroupAssignedToday(selectedGroup.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 font-medium"
                    >
                      {isGroupAssignedToday(selectedGroup.id) ? '✓ Asignado' : '▶ Asignar Hoy'}
                    </button>
                  )}

                  {selectedGroup && (
                    <button
                      onClick={() => handleDelete(selectedGroup.id)}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-16">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Selecciona un grupo para editarlo</p>
                <p className="text-sm mt-1">o crea uno nuevo con los botones de la izquierda</p>

                <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto">
                  {Object.entries(GROUP_TYPES).map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <div key={type} className={`p-4 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${config.textColor}`} />
                        <p className={`font-medium ${config.textColor}`}>{config.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExclusiveGroupsModal;

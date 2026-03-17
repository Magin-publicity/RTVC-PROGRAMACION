// src/components/Novelties/NoveltyList.jsx
import React, { useState } from 'react';
import { NoveltyModal } from './NoveltyModal';
import { NoveltyBadge } from './NoveltyBadge';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Plus, Search, Filter, Trash2, Calendar, Users } from 'lucide-react';
import { formatDateLong, formatDateRange, isPast } from '../../utils/dateUtils';
import { noveltyService } from '../../services/noveltyService';
import { customProgramsService } from '../../services/customProgramsService';

export const NoveltyList = ({ novelties, personnel, onAdd, onUpdate, onDelete, onRefresh, selectedDate }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedNovelty, setSelectedNovelty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [editingGroup, setEditingGroup] = useState(null); // Para editar fechas del grupo
  const [selectedPersonnel, setSelectedPersonnel] = useState([]); // Para selección múltiple
  const [showGroupModal, setShowGroupModal] = useState(false); // Modal para novedad grupal
  const [personnelSearchTerm, setPersonnelSearchTerm] = useState(''); // Buscador de personal para selección
  
const filteredNovelties = novelties.filter(novelty => {
  const person = personnel.find(p => p.id === novelty.personnel_id);
  const matchesSearch = !searchTerm || person?.name.toLowerCase().includes(searchTerm.toLowerCase());

  // Usar start_date si existe, sino usar date
  const noveltyDate = novelty.start_date ? novelty.start_date.split('T')[0] : novelty.date.split('T')[0];
  const matchesDate = !filterDate || noveltyDate === filterDate;

  const matchesType = !filterType || novelty.type === filterType;
  return matchesSearch && matchesDate && matchesType;
});
  
  const handleAddNew = () => {
    setSelectedNovelty(null);
    setSelectedPersonnel([]); // Limpiar selección
    setShowModal(true);
  };

  // Manejar selección múltiple con checkbox (click simple)
  const handlePersonnelSelect = (person) => {
    setSelectedPersonnel(prev => {
      const isSelected = prev.some(p => p.id === person.id);
      if (isSelected) {
        return prev.filter(p => p.id !== person.id);
      } else {
        return [...prev, person];
      }
    });
  };

  // Seleccionar/deseleccionar todos de un área
  const handleSelectAllArea = (areaPeople) => {
    const allSelected = areaPeople.every(p => selectedPersonnel.some(sp => sp.id === p.id));
    if (allSelected) {
      // Deseleccionar todos del área
      setSelectedPersonnel(prev => prev.filter(p => !areaPeople.some(ap => ap.id === p.id)));
    } else {
      // Seleccionar todos del área
      const newSelection = [...selectedPersonnel];
      areaPeople.forEach(p => {
        if (!newSelection.some(sp => sp.id === p.id)) {
          newSelection.push(p);
        }
      });
      setSelectedPersonnel(newSelection);
    }
  };

  // Filtrar personal por búsqueda
  const filteredPersonnel = personnel.filter(person =>
    person.name.toLowerCase().includes(personnelSearchTerm.toLowerCase()) ||
    person.role.toLowerCase().includes(personnelSearchTerm.toLowerCase()) ||
    person.area.toLowerCase().includes(personnelSearchTerm.toLowerCase())
  );

  // Crear novedad grupal para las personas seleccionadas
  const handleAddGroupNovelty = () => {
    if (selectedPersonnel.length === 0) {
      alert('Selecciona al menos una persona con Ctrl+Click');
      return;
    }
    setShowGroupModal(true);
  };

  // Guardar novedad para múltiples personas
  const handleSaveGroupNovelty = async (data) => {
    try {
      // Crear una novedad para cada persona seleccionada
      for (const person of selectedPersonnel) {
        await onAdd({
          ...data,
          personnel_id: person.id
        });
      }
      setShowGroupModal(false);
      setSelectedPersonnel([]);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error al crear novedades grupales:', error);
      alert('Error al crear las novedades. Por favor intente de nuevo.');
    }
  };

  // Limpiar selección
  const clearSelection = () => {
    setSelectedPersonnel([]);
  };
  
  const handleEdit = (novelty) => {
    setSelectedNovelty(novelty);
    setShowModal(true);
  };
  
  const handleSave = async (data) => {
    if (selectedNovelty) {
      await onUpdate(selectedNovelty.id, data);
    } else {
      await onAdd(data);
    }
    setShowModal(false);
    setSelectedNovelty(null);
  };
  
  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta novedad?')) {
      onDelete(id);
    }
  };

  // Eliminar grupo exclusivo completo (novedades + programa personalizado)
  const handleDeleteGroup = async (group) => {
    const confirmMsg = `¿Está seguro de eliminar el grupo "${group.program_name}"?\n\nEsto eliminará:\n- ${group.memberCount} novedad(es) del personal\n- El programa del Mapeo de Programas`;

    if (window.confirm(confirmMsg)) {
      try {
        // 1. Eliminar todas las novedades del programa
        await noveltyService.deleteByProgramId(group.program_id);

        // 2. Eliminar el programa personalizado del mapeo
        customProgramsService.delete(group.program_id);

        // 3. Refrescar la lista
        if (onRefresh) {
          onRefresh();
        }

        alert(`Grupo "${group.program_name}" eliminado correctamente`);
      } catch (error) {
        console.error('Error al eliminar grupo:', error);
        alert('Error al eliminar el grupo. Por favor intente de nuevo.');
      }
    }
  };

  // Actualizar fechas del grupo exclusivo
  const handleUpdateGroupDates = async (group, newStartDate, newEndDate) => {
    try {
      // 1. Actualizar todas las novedades del grupo
      for (const member of group.members) {
        await noveltyService.update(member.noveltyId, {
          start_date: newStartDate,
          end_date: newEndDate,
          type: group.type,
          description: group.program_name
        });
      }

      // 2. Actualizar el programa personalizado
      const customPrograms = customProgramsService.getAll();
      const programIndex = customPrograms.findIndex(p => p.id === group.program_id);
      if (programIndex !== -1) {
        customPrograms[programIndex].startDate = newStartDate;
        customPrograms[programIndex].endDate = newEndDate;
        customProgramsService.saveAll(customPrograms);
      }

      // 3. Refrescar la lista
      setEditingGroup(null);
      if (onRefresh) {
        onRefresh();
      }

      alert('Fechas actualizadas correctamente');
    } catch (error) {
      console.error('Error al actualizar fechas:', error);
      alert('Error al actualizar las fechas. Por favor intente de nuevo.');
    }
  };

  // Función para verificar si una novedad está expirada
  const isNoveltyExpired = (novelty) => {
    if (novelty.end_date) {
      return isPast(novelty.end_date);
    }
    if (novelty.date && !novelty.start_date) {
      return isPast(novelty.date);
    }
    return false;
  };
  
  // Consolidar novedades de grupos exclusivos (MOVIL, PUESTO_FIJO)
  const consolidateExclusiveGroups = (novelties) => {
    const consolidated = [];
    const exclusiveGroups = {}; // Agrupar por program_id

    novelties.forEach(novelty => {
      // Si es un grupo exclusivo (MOVIL o PUESTO_FIJO) con program_id
      if ((novelty.type === 'MOVIL' || novelty.type === 'PUESTO_FIJO') && novelty.program_id) {
        const groupKey = novelty.program_id;
        if (!exclusiveGroups[groupKey]) {
          exclusiveGroups[groupKey] = {
            ...novelty,
            isConsolidated: true,
            members: [],
            memberCount: 0
          };
        }
        // Agregar miembro al grupo
        const person = personnel.find(p => p.id === novelty.personnel_id);
        exclusiveGroups[groupKey].members.push({
          id: novelty.personnel_id,
          name: person?.name || novelty.personnel_name || `ID: ${novelty.personnel_id}`,
          role: person?.role || novelty.role || '',
          noveltyId: novelty.id
        });
        exclusiveGroups[groupKey].memberCount++;
      } else {
        // Novedad individual normal
        consolidated.push(novelty);
      }
    });

    // Agregar grupos consolidados
    Object.values(exclusiveGroups).forEach(group => {
      consolidated.push(group);
    });

    return consolidated;
  };

  const consolidatedNovelties = consolidateExclusiveGroups(filteredNovelties);

  // Group by start_date (o date si no existe start_date)
  const groupedByDate = consolidatedNovelties.reduce((acc, novelty) => {
    const groupKey = novelty.start_date || novelty.date;
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(novelty);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));
  
  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Novedades</h2>
          <p className="text-gray-600 mt-1">
            {novelties.length} novedad{novelties.length !== 1 ? 'es' : ''} registrada{novelties.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2">
          {selectedPersonnel.length > 0 && (
            <>
              <span className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                <Users size={16} />
                {selectedPersonnel.length} seleccionado{selectedPersonnel.length > 1 ? 's' : ''}
              </span>
              <Button
                onClick={handleAddGroupNovelty}
                variant="primary"
                icon={<Plus size={20} />}
              >
                Novedad Grupal
              </Button>
              <Button
                onClick={clearSelection}
                variant="secondary"
              >
                Limpiar
              </Button>
            </>
          )}
          <Button
            onClick={handleAddNew}
            icon={<Plus size={20} />}
          >
            Agregar Novedad
          </Button>
        </div>
      </div>

      {/* Panel de selección de personal para novedades grupales */}
      <details className="bg-white rounded-lg shadow-md">
        <summary className="p-4 cursor-pointer font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <Users size={20} className="text-blue-600" />
          Seleccionar Personal para Novedad Grupal
          {selectedPersonnel.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              {selectedPersonnel.length}
            </span>
          )}
        </summary>
        <div className="p-4 border-t border-gray-200">
          {/* Buscador de personal */}
          <div className="mb-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, rol o área..."
                value={personnelSearchTerm}
                onChange={(e) => setPersonnelSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {personnelSearchTerm && (
                <button
                  onClick={() => setPersonnelSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Agrupar personal por área */}
          <div className="max-h-96 overflow-y-auto space-y-4">
            {Object.entries(
              [...filteredPersonnel].sort((a, b) => {
                if (a.area < b.area) return -1;
                if (a.area > b.area) return 1;
                return a.name.localeCompare(b.name);
              }).reduce((acc, person) => {
                if (!acc[person.area]) acc[person.area] = [];
                acc[person.area].push(person);
                return acc;
              }, {})
            ).map(([area, people]) => {
              const allSelected = people.every(p => selectedPersonnel.some(sp => sp.id === p.id));
              const someSelected = people.some(p => selectedPersonnel.some(sp => sp.id === p.id));

              return (
                <div key={area}>
                  <div className="flex items-center gap-2 sticky top-0 bg-white py-1 mb-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                      onChange={() => handleSelectAllArea(people)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <h4 className="font-semibold text-gray-700 text-sm">
                      {area}
                      <span className="text-gray-400 font-normal ml-1">({people.length})</span>
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-6">
                    {people.map(person => {
                      const isSelected = selectedPersonnel.some(p => p.id === person.id);
                      return (
                        <label
                          key={person.id}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-all border ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handlePersonnelSelect(person)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{person.name}</div>
                            <div className="text-xs text-gray-500 truncate">{person.role}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPersonnel.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No se encontró personal con "{personnelSearchTerm}"
            </div>
          )}

          {selectedPersonnel.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedPersonnel.length} persona{selectedPersonnel.length > 1 ? 's' : ''} seleccionada{selectedPersonnel.length > 1 ? 's' : ''}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={clearSelection}>
                    Limpiar
                  </Button>
                  <Button size="sm" onClick={handleAddGroupNovelty} icon={<Plus size={16} />}>
                    Crear Novedad Grupal
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedPersonnel.map(p => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                  >
                    {p.name}
                    <button
                      onClick={() => handlePersonnelSelect(p)}
                      className="hover:text-blue-600"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </details>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={20} className="text-gray-400" />}
          />
          
         <input
  type="date"
  placeholder="Filtrar por fecha"
  value={filterDate || ''}
  onChange={(e) => setFilterDate(e.target.value || null)}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm('');
                setFilterDate(null);
                setFilterType('');
              }}
              icon={<Filter size={20} />}
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>
      
      {/* Novelties List */}
      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No se encontraron novedades</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => (
            <div key={date} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
               {formatDateLong(new Date(date))}
              </h3>
              
              <div className="space-y-3">
                {groupedByDate[date].map(novelty => {
                  const person = personnel.find(p => p.id === novelty.personnel_id);
                  const isExpired = isNoveltyExpired(novelty);

                  // Renderizar grupo consolidado
                  if (novelty.isConsolidated) {
                    const icon = novelty.type === 'MOVIL' ? '🚐' : '📍';
                    const isEditingThis = editingGroup?.program_id === novelty.program_id;

                    return (
                      <div
                        key={`group-${novelty.program_id}`}
                        className={`p-4 rounded-lg transition-colors ${
                          isExpired
                            ? 'bg-green-50 opacity-60 border-2 border-green-300'
                            : 'bg-green-50 hover:bg-green-100 border-2 border-green-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <NoveltyBadge type={novelty.type} />

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900 text-lg">
                                  {icon} {novelty.program_name || novelty.description}
                                </h4>
                                <span className="text-sm px-2 py-0.5 bg-green-600 text-white rounded-full font-semibold">
                                  {novelty.memberCount} persona{novelty.memberCount !== 1 ? 's' : ''}
                                </span>
                                {isExpired && (
                                  <span className="text-xs px-2 py-0.5 bg-gray-500 text-white rounded-full font-semibold">
                                    FINALIZADA
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 font-medium">
                                Grupo {novelty.type}
                              </p>

                              {/* Formulario de edición de fechas */}
                              {isEditingThis ? (
                                <div className="mt-3 p-3 bg-white rounded-lg border border-green-300">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Editar fechas del grupo:</p>
                                  <div className="flex flex-wrap gap-2 items-center">
                                    <div>
                                      <label className="text-xs text-gray-500">Desde:</label>
                                      <input
                                        type="date"
                                        defaultValue={novelty.start_date?.split('T')[0]}
                                        id={`start-${novelty.program_id}`}
                                        className="ml-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500">Hasta:</label>
                                      <input
                                        type="date"
                                        defaultValue={novelty.end_date?.split('T')[0]}
                                        id={`end-${novelty.program_id}`}
                                        className="ml-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                      />
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        const startInput = document.getElementById(`start-${novelty.program_id}`);
                                        const endInput = document.getElementById(`end-${novelty.program_id}`);
                                        handleUpdateGroupDates(novelty, startInput.value, endInput.value);
                                      }}
                                    >
                                      Guardar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingGroup(null)}
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                (novelty.start_date && novelty.end_date) && (
                                  <p className="text-sm text-blue-600 font-medium mt-1">
                                    {formatDateRange(novelty.start_date, novelty.end_date)}
                                  </p>
                                )
                              )}

                              {/* Lista de miembros colapsable */}
                              <details className="mt-2">
                                <summary className="cursor-pointer text-sm text-green-700 hover:text-green-800 font-medium">
                                  Ver integrantes del grupo
                                </summary>
                                <ul className="mt-2 ml-4 space-y-1">
                                  {novelty.members.map((member, idx) => (
                                    <li key={member.id || idx} className="text-sm text-gray-600">
                                      • {member.name} {member.role && <span className="text-gray-400">({member.role})</span>}
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            </div>
                          </div>

                          {/* Botones de acción para el grupo */}
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingGroup(novelty)}
                              icon={<Calendar size={16} />}
                              title="Editar fechas"
                            >
                              Fechas
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteGroup(novelty)}
                              icon={<Trash2 size={16} />}
                              title="Eliminar grupo completo"
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Renderizar novedad individual normal
                  return (
                    <div
                      key={novelty.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        isExpired
                          ? 'bg-gray-100 opacity-60 border-2 border-gray-300'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <NoveltyBadge type={novelty.type} />

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">
                              {person ? person.name : novelty.personnel_name || `ID: ${novelty.personnel_id} (No encontrado)`}
                            </h4>
                            {isExpired && (
                              <span className="text-xs px-2 py-0.5 bg-gray-500 text-white rounded-full font-semibold">
                                FINALIZADA
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                           {person ? person.role : novelty.personnel_role || 'Personal no encontrado en el sistema'}
                            </p>
                          {(novelty.start_date && novelty.end_date && novelty.start_date !== novelty.end_date) && (
                            <p className="text-sm text-blue-600 font-medium mt-1">
                              {formatDateRange(novelty.start_date, novelty.end_date)}
                            </p>
                          )}
                          {novelty.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {novelty.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(novelty)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(novelty.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal Individual */}
      <NoveltyModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedNovelty(null);
        }}
        novelty={selectedNovelty}
        personnel={personnel}
        onSave={handleSave}
        selectedDate={selectedDate}
      />

      {/* Modal Grupal */}
      <NoveltyModal
        isOpen={showGroupModal}
        onClose={() => {
          setShowGroupModal(false);
        }}
        novelty={null}
        personnel={personnel}
        onSave={handleSaveGroupNovelty}
        isGroupMode={true}
        selectedPersonnel={selectedPersonnel}
        selectedDate={selectedDate}
      />
    </div>
  );
};
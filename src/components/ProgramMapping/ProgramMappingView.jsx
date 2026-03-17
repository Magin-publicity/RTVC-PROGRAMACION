// src/components/ProgramMapping/ProgramMappingView.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '../UI/Button';
import { Save, RefreshCw, Plus, X, Trash2, Edit2, Database, Shield, Radio, Truck, MapPin, Users, Search, Download } from 'lucide-react';
import { programMappingService } from '../../services/programMappingService';
import { customProgramsService } from '../../services/customProgramsService';
import { changeLogService } from '../../services/changeLogService';
import { noveltyService } from '../../services/noveltyService';
import { WEEKDAY_PROGRAMS, WEEKEND_PROGRAMS } from '../../data/programs';
import { exportExclusiveGroupPersonnel } from '../../utils/exportExclusiveGroupPersonnel';

// Función para crear/actualizar novedades de grupos exclusivos
const createExclusiveGroupNovelties = async (program, personnelIds) => {
  if (!program.isExclusiveGroup || !personnelIds || personnelIds.length === 0) return;

  const noveltyType = program.exclusiveType === 'MOVIL' ? 'MOVIL' :
                      program.exclusiveType === 'PUESTO_FIJO' ? 'PUESTO_FIJO' : null;

  if (!noveltyType) return;

  // Extraer hora de inicio y fin del programa
  const [startTime, endTime] = (program.time || '00:00-23:59').split('-');

  // Descripción de la novedad
  const description = `${program.name} (${startTime}-${endTime})`;

  // Usar startDate y endDate del programa
  let startDate = program.startDate;
  let endDate = program.endDate;

  // Si no hay fechas definidas, usar hoy
  if (!startDate || !endDate) {
    const today = new Date();
    startDate = startDate || today.toISOString().split('T')[0];
    endDate = endDate || startDate;
  }

  // Crear una novedad por persona con rango de fechas
  for (const personnelId of personnelIds) {
    try {
      const noveltyData = {
        personnel_id: personnelId,
        type: noveltyType,
        description: description,
        start_date: startDate,
        end_date: endDate,
        program_id: program.id,
        program_name: program.name,
        exclusive_type: program.exclusiveType
      };

      // Crear novedad en API
      try {
        await noveltyService.create(noveltyData);
        console.log(`📡 Novedad creada en API para persona ${personnelId}`);
      } catch (apiError) {
        // Si falla API, guardar en localStorage
        noveltyService.addLocal(noveltyData);
        console.log(`💾 Novedad guardada localmente para persona ${personnelId}`);
      }
    } catch (error) {
      console.error('Error creando novedad:', error);
    }
  }

  console.log(`✅ Novedades creadas para ${personnelIds.length} personas en programa ${program.name}`);
};

// Función para eliminar novedades de un programa exclusivo
const removeExclusiveGroupNovelties = async (programId) => {
  try {
    // Intentar eliminar por API usando el nuevo endpoint
    try {
      const result = await noveltyService.deleteByProgramId(programId);
      console.log(`🗑️ Novedades del programa ${programId} eliminadas via API:`, result);
    } catch (apiError) {
      console.log('API no disponible, eliminando localmente...');
    }

    // También limpiar localStorage por seguridad
    const localNovelties = noveltyService.getAllLocal();
    const filtered = localNovelties.filter(n => n.program_id !== programId);
    noveltyService.saveLocal(filtered);

    console.log(`🗑️ Novedades del programa ${programId} eliminadas de localStorage`);
  } catch (error) {
    console.error('Error eliminando novedades:', error);
  }
};

// Configuración de tipos de grupo exclusivo
const EXCLUSIVE_GROUP_TYPES = {
  MASTER: {
    label: 'Master/Estudio',
    description: 'Equipo fijo operando un Master',
    color: '#3b82f6',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: Radio
  },
  MOVIL: {
    label: 'Móvil',
    description: 'Equipo en unidad móvil',
    color: '#10b981',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: Truck
  },
  PUESTO_FIJO: {
    label: 'Puesto Fijo',
    description: 'Personal en ubicación externa',
    color: '#f59e0b',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: MapPin
  }
};

// Componente del modal de edición de fechas
const DateEditorModal = ({ program, currentDates, onSave, onClose }) => {
  const [tempDates, setTempDates] = useState(currentDates || []);
  const [startDate, setStartDate] = useState(program?.startDate || '');
  const [endDate, setEndDate] = useState(program?.endDate || '');

  // Detectar si es un grupo exclusivo (MOVIL o PUESTO_FIJO)
  const isExclusiveGroup = program?.isExclusiveGroup &&
                          (program?.exclusiveType === 'MOVIL' || program?.exclusiveType === 'PUESTO_FIJO');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Editar Fechas de Grabación - {program?.name}
        </h3>

        <div className="space-y-4">
          {/* Si es grupo exclusivo, mostrar selector de rango */}
          {isExclusiveGroup ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-3 font-medium">
                {program.exclusiveType === 'MOVIL' ? '🚐 Grupo MÓVIL' : '📍 Grupo PUESTO FIJO'} - Selecciona el período de asignación:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              {startDate && endDate && (
                <p className="mt-3 text-sm text-green-600 font-medium">
                  El personal aparecerá como "{program.exclusiveType === 'MOVIL' ? '🚐 MÓVIL' : '📍 PUESTO FIJO'}" del{' '}
                  {new Date(startDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} al{' '}
                  {new Date(endDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Opción: Todos los días */}
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="allDays"
                  name="dateOption"
                  checked={tempDates.length === 0}
                  onChange={() => setTempDates([])}
                  className="w-4 h-4"
                />
                <label htmlFor="allDays" className="text-sm font-medium text-gray-700">
                  Todos los días
                </label>
              </div>

              {/* Opción: Fechas específicas */}
              <div className="flex items-start gap-2">
            <input
              type="radio"
              id="specificDates"
              name="dateOption"
              checked={tempDates.length > 0}
              onChange={() => {
                if (tempDates.length === 0) {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
                  setTempDates([dateStr]);
                }
              }}
              className="w-4 h-4 mt-1"
            />
            <div className="flex-1">
              <label htmlFor="specificDates" className="text-sm font-medium text-gray-700 block mb-2">
                Fechas específicas
              </label>

              {tempDates.length > 0 && (
                <div className="space-y-2">
                  {/* Input para agregar nueva fecha */}
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      onChange={(e) => {
                        if (e.target.value && !tempDates.includes(e.target.value)) {
                          setTempDates([...tempDates, e.target.value].sort());
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>

                  {/* Lista de fechas seleccionadas */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tempDates.map(date => (
                      <div
                        key={date}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                      >
                        <span>{new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                        <button
                          type="button"
                          onClick={() => setTempDates(tempDates.filter(d => d !== date))}
                          className="text-blue-600 hover:text-blue-900 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
            </>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => {
            if (isExclusiveGroup) {
              // Para grupos exclusivos, guardar startDate y endDate
              onSave({ startDate, endDate });
            } else {
              // Para programas normales, guardar tempDates
              onSave(tempDates);
            }
          }}>
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ProgramMappingView = () => {
  // Combinar programas predefinidos con personalizados
  const [customPrograms, setCustomPrograms] = useState([]);
  const [disabledPrograms, setDisabledPrograms] = useState([]); // IDs de programas deshabilitados
  const [programDates, setProgramDates] = useState({}); // Fechas específicas por programa
  const [programTimes, setProgramTimes] = useState({}); // Horarios modificados por programa
  const [editingDates, setEditingDates] = useState(null); // ID del programa cuyas fechas se están editando
  const [editingTime, setEditingTime] = useState(null); // ID del programa cuyo horario se está editando
  const [activeTab, setActiveTab] = useState('weekday'); // 'weekday' o 'weekend'
  const [mappings, setMappings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [newProgram, setNewProgram] = useState({
    name: '',
    time: '',
    color: '#3B82F6',
    recordingDates: [], // Array de fechas exactas seleccionadas
    programType: 'weekday', // 'weekday' o 'weekend'
    isExclusiveGroup: false,
    exclusiveType: null, // 'MASTER', 'MOVIL', 'PUESTO_FIJO'
    exclusivePersonnel: [], // IDs del personal asignado
    startDate: '', // Fecha de inicio para grupos exclusivos
    endDate: '' // Fecha de fin para grupos exclusivos
  });
  const [personnel, setPersonnel] = useState([]);
  const [personnelSearchTerm, setPersonnelSearchTerm] = useState('');

  // Cargar programas personalizados y mapeos al iniciar
  useEffect(() => {
    loadData();
  }, []);

  // Recargar horarios cuando cambies de pestaña
  useEffect(() => {
    const storageKey = activeTab === 'weekend' ? 'rtvc_program_times_weekend' : 'rtvc_program_times';
    const times = JSON.parse(localStorage.getItem(storageKey) || '{}');
    setProgramTimes(times);
    console.log(`🔄 [useEffect] Horarios recargados para ${activeTab}:`, times);
  }, [activeTab]);

  const loadData = async () => {
    const loadedCustom = customProgramsService.getAll();
    setCustomPrograms(loadedCustom);

    const loadedMappings = await programMappingService.getAll();
    setMappings(loadedMappings);

    // Cargar programas deshabilitados desde localStorage
    const disabled = JSON.parse(localStorage.getItem('rtvc_disabled_programs') || '[]');
    setDisabledPrograms(disabled);

    // Cargar fechas específicas por programa desde localStorage
    const dates = JSON.parse(localStorage.getItem('rtvc_program_dates') || '{}');
    setProgramDates(dates);

    // Cargar horarios modificados según la pestaña activa
    const storageKey = activeTab === 'weekend' ? 'rtvc_program_times_weekend' : 'rtvc_program_times';
    const times = JSON.parse(localStorage.getItem(storageKey) || '{}');
    setProgramTimes(times);

    // Cargar personal para grupos exclusivos
    try {
      const personnelRes = await fetch('/api/personnel');
      if (personnelRes.ok) {
        const personnelData = await personnelRes.json();
        setPersonnel(personnelData);
      }
    } catch (err) {
      console.warn('No se pudo cargar personal:', err);
    }
  };

  // Combinar programas según la pestaña activa
  const baseProgramsByTab = activeTab === 'weekday' ? WEEKDAY_PROGRAMS : WEEKEND_PROGRAMS;

  // Filtrar programas predefinidos (quitar duplicados y deshabilitados)
  const predefinedPrograms = baseProgramsByTab.filter((program, index, self) =>
    index === self.findIndex((p) => p.id === program.id) && !disabledPrograms.includes(program.id)
  ).map(program => ({
    ...program,
    // Usar horario modificado si existe, sino usar el original
    time: programTimes[program.id] || program.time
  }));

  // Filtrar programas personalizados según el tipo (weekday/weekend)
  const filteredCustomPrograms = customPrograms.filter(program =>
    program.programType === activeTab || !program.programType // Si no tiene tipo, mostrarlo en ambas
  );

  // Combinar con programas personalizados filtrados
  const allPrograms = [...predefinedPrograms, ...filteredCustomPrograms];

  const handleResourceChange = (programId, resourceType, value) => {
    const program = allPrograms.find(p => p.id === programId);
    const previousMapping = mappings[programId] || {};
    const previousValue = previousMapping[resourceType];
    const newValue = value === '' ? null : parseInt(value);

    // Registrar el cambio en el log
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const changeType = resourceType === 'studioResource' ? 'program_studio' : 'program_master';
    const previousText = previousValue ? (resourceType === 'studioResource' ? `Estudio ${previousValue}` : `Master ${previousValue}`) : 'Sin asignar';
    const newText = newValue ? (resourceType === 'studioResource' ? `Estudio ${newValue}` : `Master ${newValue}`) : 'Sin asignar';

    changeLogService.logChange({
      date: dateStr,
      type: changeType,
      entity: `program_${programId}`,
      entityName: program?.name || 'Programa',
      previousValue: previousText,
      newValue: newText,
      user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Usuario'
    });

    setMappings(prev => ({
      ...prev,
      [programId]: {
        ...prev[programId],
        [resourceType]: newValue
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Guardar mapeos para TODOS los programas
    const savePromises = allPrograms.map(program => {
      const mapping = mappings[program.id] || {};
      return programMappingService.save(program.id, {
        studioResource: mapping.studioResource || null,
        masterResource: mapping.masterResource || null
      });
    });

    try {
      await Promise.all(savePromises);
      setHasChanges(false);
      alert('✅ Mapeos guardados correctamente en la base de datos');
    } catch (error) {
      console.error('Error guardando mapeos:', error);
      alert('❌ Error al guardar algunos mapeos. Revisa la consola.');
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Está seguro de recargar los mapeos? Se perderán los cambios no guardados.')) {
      loadData();
      setHasChanges(false);
    }
  };

  const handleAddProgram = (e) => {
    e.preventDefault();

    if (!newProgram.name || !newProgram.time) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const addedProgram = customProgramsService.add({
        name: newProgram.name,
        time: newProgram.time,
        color: newProgram.color,
        type: 'custom',
        recordingDates: newProgram.recordingDates,
        programType: newProgram.programType,
        isExclusiveGroup: newProgram.isExclusiveGroup,
        exclusiveType: newProgram.isExclusiveGroup ? newProgram.exclusiveType : null,
        exclusivePersonnel: newProgram.isExclusiveGroup ? newProgram.exclusivePersonnel : [],
        startDate: newProgram.startDate || '',
        endDate: newProgram.endDate || ''
      });

      setCustomPrograms(prev => [...prev, addedProgram]);

      // Crear novedades automáticas para grupos exclusivos (MOVIL o PUESTO_FIJO)
      if (newProgram.isExclusiveGroup &&
          (newProgram.exclusiveType === 'MOVIL' || newProgram.exclusiveType === 'PUESTO_FIJO') &&
          newProgram.exclusivePersonnel.length > 0) {
        createExclusiveGroupNovelties({...addedProgram, startDate: newProgram.startDate, endDate: newProgram.endDate}, newProgram.exclusivePersonnel);
      }

      // Resetear formulario
      setNewProgram({
        name: '',
        time: '',
        color: '#3B82F6',
        recordingDates: [],
        programType: activeTab,
        isExclusiveGroup: false,
        exclusiveType: null,
        exclusivePersonnel: [],
        startDate: '',
        endDate: ''
      });
      setPersonnelSearchTerm('');
      setShowAddForm(false);

      alert(`Programa "${addedProgram.name}" agregado exitosamente`);
    } catch (error) {
      alert('Error al agregar el programa. Intenta de nuevo.');
    }
  };

  const handleEditProgram = (program) => {
    if (!program.isCustom) {
      alert('No puedes editar programas predefinidos');
      return;
    }

    setEditingProgram(program);
    setNewProgram({
      name: program.name,
      time: program.time,
      color: program.color,
      recordingDates: program.recordingDates || [],
      programType: program.programType || 'weekday',
      isExclusiveGroup: program.isExclusiveGroup || false,
      startDate: program.startDate || '',
      endDate: program.endDate || '',
      exclusiveType: program.exclusiveType || null,
      exclusivePersonnel: program.exclusivePersonnel || []
    });
    setPersonnelSearchTerm('');
    setShowAddForm(true);
  };

  const handleUpdateProgram = async (e) => {
    e.preventDefault();

    if (!newProgram.name || !newProgram.time) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      // Primero eliminar novedades anteriores del programa (ESPERAR a que termine)
      await removeExclusiveGroupNovelties(editingProgram.id);

      const updatedProgram = customProgramsService.update(editingProgram.id, {
        name: newProgram.name,
        time: newProgram.time,
        color: newProgram.color,
        recordingDates: newProgram.recordingDates,
        programType: newProgram.programType,
        isExclusiveGroup: newProgram.isExclusiveGroup,
        exclusiveType: newProgram.isExclusiveGroup ? newProgram.exclusiveType : null,
        exclusivePersonnel: newProgram.isExclusiveGroup ? newProgram.exclusivePersonnel : [],
        startDate: newProgram.startDate || '',
        endDate: newProgram.endDate || ''
      });

      setCustomPrograms(prev => prev.map(p =>
        p.id === editingProgram.id ? updatedProgram : p
      ));

      // Crear nuevas novedades para grupos exclusivos (MOVIL o PUESTO_FIJO) - ESPERAR a que termine
      if (newProgram.isExclusiveGroup &&
          (newProgram.exclusiveType === 'MOVIL' || newProgram.exclusiveType === 'PUESTO_FIJO') &&
          newProgram.exclusivePersonnel.length > 0) {
        await createExclusiveGroupNovelties({...updatedProgram, startDate: newProgram.startDate, endDate: newProgram.endDate}, newProgram.exclusivePersonnel);
      }

      // Resetear formulario
      setNewProgram({
        name: '',
        time: '',
        color: '#3B82F6',
        recordingDates: [],
        programType: activeTab,
        isExclusiveGroup: false,
        exclusiveType: null,
        exclusivePersonnel: [],
        startDate: '',
        endDate: ''
      });
      setPersonnelSearchTerm('');
      setEditingProgram(null);
      setShowAddForm(false);

      alert(`Programa "${updatedProgram.name}" actualizado exitosamente. Las novedades se han actualizado.`);
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('Error al actualizar el programa. Intenta de nuevo.');
    }
  };

  const handleToggleProgram = async (programId, isCustom) => {
    // Siempre permitir eliminar cualquier programa (personalizado o predefinido)
    const programName = isCustom
      ? customPrograms.find(p => p.id === programId)?.name
      : allPrograms.find(p => p.id === programId)?.name;

    if (!confirm(`¿Estás seguro de eliminar el programa "${programName || 'este programa'}" de todas las programaciones?`)) {
      return;
    }

    try {
      // 1. Si es personalizado, eliminar de customPrograms localStorage
      if (isCustom) {
        // Eliminar novedades asociadas al programa
        removeExclusiveGroupNovelties(programId);
        customProgramsService.delete(programId);
        setCustomPrograms(prev => prev.filter(p => p.id !== programId));
      } else {
        // Si es programa predefinido, agregarlo a la lista de deshabilitados
        const currentDisabled = JSON.parse(localStorage.getItem('rtvc_disabled_programs') || '[]');
        if (!currentDisabled.includes(programId)) {
          currentDisabled.push(programId);
          localStorage.setItem('rtvc_disabled_programs', JSON.stringify(currentDisabled));
          setDisabledPrograms(currentDisabled);
          console.log(`🚫 Programa ${programId} agregado a rtvc_disabled_programs`);
        }
      }

      // 2. Eliminar mapeo y fechas (tanto para personalizados como predefinidos)
      const newMappings = { ...mappings };
      delete newMappings[programId];
      setMappings(newMappings);
      await programMappingService.delete(programId);

      const newDates = { ...programDates };
      delete newDates[programId];
      setProgramDates(newDates);
      localStorage.setItem('rtvc_program_dates', JSON.stringify(newDates));

      // 3. Eliminar horarios tanto de entre semana como de fin de semana
      const newTimes = { ...programTimes };
      delete newTimes[programId];
      setProgramTimes(newTimes);

      // Limpiar de AMBOS storages (weekday y weekend)
      const weekdayTimes = JSON.parse(localStorage.getItem('rtvc_program_times') || '{}');
      delete weekdayTimes[programId];
      localStorage.setItem('rtvc_program_times', JSON.stringify(weekdayTimes));

      const weekendTimes = JSON.parse(localStorage.getItem('rtvc_program_times_weekend') || '{}');
      delete weekendTimes[programId];
      localStorage.setItem('rtvc_program_times_weekend', JSON.stringify(weekendTimes));

      console.log(`🗑️ Horarios del programa ${programId} eliminados de ambos storages`);

      // 4. Intentar eliminar del backend si está disponible
      try {
        const response = await fetch(`/api/schedule/remove-program/${programId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Programa eliminado de ${result.schedulesUpdated} programaciones en BD`);
        }
      } catch (fetchError) {
        console.warn('⚠️ No se pudo conectar al backend, pero el programa fue eliminado del localStorage');
      }

      alert(`Programa "${programName}" eliminado exitosamente de la programación`);
    } catch (error) {
      console.error('Error al eliminar programa:', error);
      alert('Error al eliminar el programa. Intenta de nuevo.');
    }
  };

  const handleDateChange = (programId, dates) => {
    const newDates = { ...programDates, [programId]: dates };
    setProgramDates(newDates);
    localStorage.setItem('rtvc_program_dates', JSON.stringify(newDates));
    setHasChanges(true);
  };

  const handleTimeChange = (programId, newTime) => {
    // Determinar la clave de storage según la pestaña activa
    const storageKey = activeTab === 'weekend' ? 'rtvc_program_times_weekend' : 'rtvc_program_times';

    // Cargar tiempos existentes de la clave correcta
    const existingTimes = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const newTimes = { ...existingTimes, [programId]: newTime };

    // Actualizar estado (para el UI)
    setProgramTimes(newTimes);

    // Guardar en la clave correcta según el tipo de programa
    localStorage.setItem(storageKey, JSON.stringify(newTimes));

    console.log(`⏰ [handleTimeChange] Guardado en ${storageKey}:`, { programId, newTime });
  };

  const handleDeleteProgram = async (program) => {
    // Permitir eliminar tanto programas personalizados como predefinidos
    if (!confirm(`¿Estás seguro de eliminar el programa "${program.name}" de todas las programaciones?`)) {
      return;
    }

    try {
      // 1. Si es personalizado, eliminar de customPrograms localStorage
      if (program.isCustom) {
        customProgramsService.delete(program.id);
        setCustomPrograms(prev => prev.filter(p => p.id !== program.id));
      }

      // 2. Eliminar mapeo y fechas (tanto para personalizados como predefinidos)
      const newMappings = { ...mappings };
      delete newMappings[program.id];
      setMappings(newMappings);
      await programMappingService.delete(program.id);

      const newDates = { ...programDates };
      delete newDates[program.id];
      setProgramDates(newDates);
      localStorage.setItem('rtvc_program_dates', JSON.stringify(newDates));

      // 3. Eliminar asignaciones de estudios
      const newTimes = { ...programTimes };
      delete newTimes[program.id];
      setProgramTimes(newTimes);
      localStorage.setItem('rtvc_program_times', JSON.stringify(newTimes));

      // 4. Intentar eliminar del backend si está disponible
      try {
        const response = await fetch(`/api/schedule/remove-program/${program.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Programa eliminado de ${result.schedulesUpdated} programaciones en BD`);
        }
      } catch (fetchError) {
        console.warn('⚠️ No se pudo conectar al backend, pero el programa fue eliminado del localStorage');
      }

      alert(`Programa "${program.name}" eliminado exitosamente de la programación`);
    } catch (error) {
      console.error('Error al eliminar el programa:', error);
      alert('Error al eliminar el programa. Intenta de nuevo.');
    }
  };

  const handleMigrateToDatabase = async () => {
    if (!window.confirm(
      '💾 ¿Migrar asignaciones a la base de datos?\n\n' +
      'Esto copiará todas tus asignaciones actuales de Estudio/Master\n' +
      'desde el navegador (localStorage) a la base de datos PostgreSQL.\n\n' +
      '✅ Las asignaciones quedarán respaldadas permanentemente\n' +
      '⚠️ Solo necesitas hacer esto UNA VEZ\n\n' +
      '¿Continuar?'
    )) {
      return;
    }

    try {
      const result = await programMappingService.migrateFromLocalStorage();

      if (result.success) {
        alert(
          `✅ Migración exitosa!\n\n` +
          `${result.message || 'Asignaciones migradas a la base de datos'}\n\n` +
          `Ahora tus datos están respaldados en PostgreSQL y ya no dependen del navegador.`
        );
        // Recargar datos desde BD
        await loadData();
      } else {
        alert(`❌ Error en la migración:\n\n${result.error}`);
      }
    } catch (error) {
      console.error('Error al migrar:', error);
      alert(`❌ Error al migrar:\n\n${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mapeo de Programas a Recursos</h2>
          <p className="text-gray-600 mt-1">
            Define qué recursos de Estudio y Master utiliza cada programa.
            <span className="text-blue-600 font-medium ml-1">Haz clic en la hora de cualquier programa para modificarla.</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setShowAddForm(!showAddForm)}
            icon={showAddForm ? <X size={20} /> : <Plus size={20} />}
          >
            {showAddForm ? 'Cancelar' : 'Nuevo Programa'}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            icon={<RefreshCw size={20} />}
          >
            Recargar
          </Button>
          <Button
            variant="secondary"
            onClick={handleMigrateToDatabase}
            icon={<Database size={20} />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Migrar a BD
          </Button>
          <Button
            onClick={handleSave}
            icon={<Save size={20} />}
          >
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Pestañas para Lunes-Viernes / Fin de Semana */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('weekday')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'weekday'
                ? 'bg-blue-500 text-white border-b-2 border-blue-600'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            📅 Lunes a Viernes
          </button>
          <button
            onClick={() => setActiveTab('weekend')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'weekend'
                ? 'bg-blue-500 text-white border-b-2 border-blue-600'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            🎉 Fin de Semana
          </button>
        </div>

        <div className="p-4 bg-gray-50 text-sm text-gray-600">
          {activeTab === 'weekday' ? (
            <p>📌 Programas que se emiten de <strong>Lunes a Viernes</strong></p>
          ) : (
            <p>📌 Programas que se emiten en <strong>Sábado y Domingo</strong></p>
          )}
        </div>
      </div>

      {/* Formulario para agregar/editar programa */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingProgram ? 'Editar Programa' : 'Agregar Nuevo Programa'}
          </h3>
          <form onSubmit={editingProgram ? handleUpdateProgram : handleAddProgram} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Programa *
                </label>
                <input
                  type="text"
                  required
                  value={newProgram.name}
                  onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Programa Especial"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horario *
                </label>
                <input
                  type="text"
                  required
                  value={newProgram.time}
                  onChange={(e) => setNewProgram({ ...newProgram, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 15:00-16:00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={newProgram.color}
                  onChange={(e) => setNewProgram({ ...newProgram, color: e.target.value })}
                  className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tipo de programa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Programa *
              </label>
              <select
                value={newProgram.programType}
                onChange={(e) => setNewProgram({ ...newProgram, programType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekday">📅 Lunes a Viernes</option>
                <option value="weekend">🎉 Fin de Semana (Sábado y Domingo)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Define en qué días de la semana se emite este programa
              </p>
            </div>

            {/* Grupo Exclusivo */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="isExclusiveGroup"
                  checked={newProgram.isExclusiveGroup}
                  onChange={(e) => setNewProgram({
                    ...newProgram,
                    isExclusiveGroup: e.target.checked,
                    exclusiveType: e.target.checked ? 'MASTER' : null,
                    exclusivePersonnel: e.target.checked ? newProgram.exclusivePersonnel : []
                  })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="isExclusiveGroup" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Este programa tiene un Grupo Exclusivo de personal
                </label>
              </div>

              {newProgram.isExclusiveGroup && (
                <div className="ml-8 space-y-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  {/* Tipo de grupo exclusivo */}
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-2">
                      Tipo de Grupo Exclusivo
                    </label>
                    <div className="flex gap-2">
                      {Object.entries(EXCLUSIVE_GROUP_TYPES).map(([type, config]) => {
                        const Icon = config.icon;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setNewProgram({ ...newProgram, exclusiveType: type })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                              newProgram.exclusiveType === type
                                ? `${config.bgColor} border-current ${config.textColor}`
                                : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                    {newProgram.exclusiveType && (
                      <p className="mt-2 text-xs text-indigo-600">
                        {EXCLUSIVE_GROUP_TYPES[newProgram.exclusiveType]?.description}
                      </p>
                    )}
                  </div>

                  {/* Selector de personal */}
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Personal Exclusivo ({newProgram.exclusivePersonnel.length} seleccionados)
                    </label>

                    {/* Miembros actuales */}
                    {newProgram.exclusivePersonnel.length > 0 && (
                      <div className="mb-3 p-3 bg-white border border-indigo-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-indigo-700">
                            Personal asignado:
                          </span>
                          <button
                            type="button"
                            onClick={() => setNewProgram({ ...newProgram, exclusivePersonnel: [] })}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Quitar todos
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {newProgram.exclusivePersonnel.map(id => {
                            const person = personnel.find(p => p.id === id);
                            if (!person) return null;
                            const config = EXCLUSIVE_GROUP_TYPES[newProgram.exclusiveType] || {};
                            return (
                              <span
                                key={id}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 ${config.bgColor || 'bg-gray-100'} ${config.textColor || 'text-gray-700'}`}
                                onClick={() => setNewProgram({
                                  ...newProgram,
                                  exclusivePersonnel: newProgram.exclusivePersonnel.filter(pid => pid !== id)
                                })}
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
                        value={personnelSearchTerm}
                        onChange={(e) => setPersonnelSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre o área..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                      />
                    </div>

                    {/* Lista de personal */}
                    <div className="border rounded-lg overflow-hidden bg-white max-h-48 overflow-y-auto">
                      {personnel.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          Cargando personal...
                        </div>
                      ) : (
                        (() => {
                          const filtered = personnel.filter(p => {
                            if (!personnelSearchTerm.trim()) return true;
                            const term = personnelSearchTerm.toLowerCase();
                            return p.name?.toLowerCase().includes(term) ||
                                   p.area?.toLowerCase().includes(term);
                          });
                          const grouped = filtered.reduce((acc, p) => {
                            const area = p.area || 'OTRO';
                            if (!acc[area]) acc[area] = [];
                            acc[area].push(p);
                            return acc;
                          }, {});

                          return Object.entries(grouped).sort().map(([area, areaPersonnel]) => (
                            <div key={area}>
                              <div className="bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 uppercase sticky top-0">
                                {area} ({areaPersonnel.length})
                              </div>
                              {areaPersonnel.map(person => {
                                const selected = newProgram.exclusivePersonnel.includes(person.id);
                                const config = EXCLUSIVE_GROUP_TYPES[newProgram.exclusiveType] || {};
                                return (
                                  <div
                                    key={person.id}
                                    onClick={() => setNewProgram({
                                      ...newProgram,
                                      exclusivePersonnel: selected
                                        ? newProgram.exclusivePersonnel.filter(id => id !== person.id)
                                        : [...newProgram.exclusivePersonnel, person.id]
                                    })}
                                    className={`px-3 py-2 border-b border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                      selected ? (config.bgColor || 'bg-indigo-50') : ''
                                    }`}
                                  >
                                    <div
                                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0`}
                                      style={{
                                        backgroundColor: selected ? (config.color || '#6366f1') : 'white',
                                        borderColor: selected ? (config.color || '#6366f1') : '#d1d5db'
                                      }}
                                    >
                                      {selected && <span className="text-white text-xs font-bold">✓</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-gray-900 text-sm truncate">{person.name}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ));
                        })()
                      )}
                    </div>
                    <p className="mt-2 text-xs text-indigo-600">
                      El personal seleccionado quedará bloqueado de la rotación general cuando este programa esté activo.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Selección de fechas de grabación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {newProgram.isExclusiveGroup && (newProgram.exclusiveType === 'MOVIL' || newProgram.exclusiveType === 'PUESTO_FIJO')
                  ? 'Período de Asignación'
                  : 'Fechas de Grabación'}
              </label>

              {/* Si es grupo exclusivo MOVIL o PUESTO_FIJO, mostrar selector de rango */}
              {newProgram.isExclusiveGroup && (newProgram.exclusiveType === 'MOVIL' || newProgram.exclusiveType === 'PUESTO_FIJO') ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-3">
                    Selecciona el período durante el cual el personal estará asignado a este {newProgram.exclusiveType === 'MOVIL' ? 'móvil' : 'puesto fijo'}:
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
                      <input
                        type="date"
                        value={newProgram.startDate || ''}
                        onChange={(e) => setNewProgram({ ...newProgram, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
                      <input
                        type="date"
                        value={newProgram.endDate || ''}
                        min={newProgram.startDate || ''}
                        onChange={(e) => setNewProgram({ ...newProgram, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  {newProgram.startDate && newProgram.endDate && (
                    <p className="mt-3 text-sm text-green-600 font-medium">
                      El personal aparecerá como "{newProgram.exclusiveType === 'MOVIL' ? '🚐 MÓVIL' : '📍 PUESTO FIJO'}" del{' '}
                      {new Date(newProgram.startDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} al{' '}
                      {new Date(newProgram.endDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {/* Opciones: Todos los días vs Fechas específicas (para programas normales) */}
                  <div className="space-y-3 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dateOption"
                        checked={newProgram.recordingDates.length === 0}
                        onChange={() => setNewProgram({ ...newProgram, recordingDates: [] })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700 font-medium">Todos los días</span>
                      <span className="text-xs text-gray-500">(el programa aparecerá siempre)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dateOption"
                        checked={newProgram.recordingDates.length > 0}
                        onChange={() => {
                          if (newProgram.recordingDates.length === 0) {
                            // Agregar la fecha de hoy por defecto
                            const today = new Date();
                            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                            setNewProgram({ ...newProgram, recordingDates: [dateStr] });
                          }
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700 font-medium">Fechas específicas</span>
                      <span className="text-xs text-gray-500">(solo en las fechas seleccionadas)</span>
                    </label>
                  </div>

                  {/* Selector de fechas - solo visible si se eligió "Fechas específicas" */}
                  {newProgram.recordingDates.length > 0 && (
                    <div className="ml-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="date"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onChange={(e) => {
                            if (e.target.value && !newProgram.recordingDates.includes(e.target.value)) {
                              setNewProgram({
                                ...newProgram,
                                recordingDates: [...newProgram.recordingDates, e.target.value].sort()
                              });
                              e.target.value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                          onClick={() => {
                            const input = document.querySelector('input[type="date"]');
                            if (input && input.value) {
                              if (!newProgram.recordingDates.includes(input.value)) {
                                setNewProgram({
                                  ...newProgram,
                                  recordingDates: [...newProgram.recordingDates, input.value].sort()
                                });
                              }
                              input.value = '';
                            }
                          }}
                        >
                          Agregar
                        </button>
                      </div>

                      {/* Lista de fechas seleccionadas */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">Fechas seleccionadas:</p>
                        <div className="flex flex-wrap gap-2">
                          {newProgram.recordingDates.map(date => (
                            <div
                              key={date}
                              className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                            >
                              <span>{new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newDates = newProgram.recordingDates.filter(d => d !== date);
                                  // Si queda vacío después de eliminar, agregar hoy para no volver a "todos los días"
                                  if (newDates.length === 0) {
                                    const today = new Date();
                                    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                    setNewProgram({ ...newProgram, recordingDates: [dateStr] });
                                  } else {
                                    setNewProgram({ ...newProgram, recordingDates: newDates });
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900 font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProgram(null);
                  setPersonnelSearchTerm('');
                  setNewProgram({
                    name: '',
                    time: '',
                    color: '#3B82F6',
                    recordingDates: [],
                    programType: activeTab,
                    isExclusiveGroup: false,
                    exclusiveType: null,
                    exclusivePersonnel: []
                  });
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingProgram ? 'Actualizar Programa' : 'Agregar Programa'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Mapeos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Programa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fechas de Grabación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recurso de Estudio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recurso de Master
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allPrograms.map(program => {
              const mapping = mappings[program.id] || {};

              // Obtener fechas del programa (combinar recordingDates y programDates)
              const currentDates = program.isCustom
                ? (program.recordingDates || [])
                : (programDates[program.id] || []);

              // Función helper para mostrar fechas
              const getDatesText = (dates) => {
                // Si es grupo exclusivo con startDate y endDate, mostrar rango
                if (program.isExclusiveGroup && program.startDate && program.endDate) {
                  const startFormatted = new Date(program.startDate + 'T00:00:00').toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short'
                  });
                  const endFormatted = new Date(program.endDate + 'T00:00:00').toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short'
                  });
                  return `${startFormatted} - ${endFormatted}`;
                }

                if (!dates || dates.length === 0) return 'Todos los días';

                // Mostrar máximo 3 fechas, luego indicar cuántas más
                const datesToShow = dates.slice(0, 3);
                const formattedDates = datesToShow.map(date =>
                  new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short'
                  })
                );

                if (dates.length > 3) {
                  return `${formattedDates.join(', ')} +${dates.length - 3} más`;
                }

                return formattedDates.join(', ');
              };

              return (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded mr-3"
                        style={{ backgroundColor: program.color }}
                      />
                      <div className="text-sm font-medium text-gray-900">
                        {program.name}
                        {program.isCustom && (
                          <span className="ml-2 text-xs text-blue-600">(Personalizado)</span>
                        )}
                        {program.isExclusiveGroup && program.exclusiveType && (
                          <span className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${EXCLUSIVE_GROUP_TYPES[program.exclusiveType]?.bgColor} ${EXCLUSIVE_GROUP_TYPES[program.exclusiveType]?.textColor}`}>
                            <Shield className="w-3 h-3" />
                            {EXCLUSIVE_GROUP_TYPES[program.exclusiveType]?.label}
                            {program.exclusivePersonnel?.length > 0 && (
                              <span className="font-semibold">({program.exclusivePersonnel.length})</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingTime === program.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={program.time}
                          onBlur={(e) => {
                            handleTimeChange(program.id, e.target.value);
                            setEditingTime(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleTimeChange(program.id, e.target.value);
                              setEditingTime(null);
                            } else if (e.key === 'Escape') {
                              setEditingTime(null);
                            }
                          }}
                          autoFocus
                          className="w-32 px-2 py-1 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="00:00-00:00"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingTime(program.id)}
                        className="text-left hover:text-blue-600 hover:underline cursor-pointer w-full"
                      >
                        {program.time}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => setEditingDates(program.id)}
                      className="text-left text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {getDatesText(currentDates)}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap resource-section">
                    <div className="w-full">
                      <label className="block md:hidden text-xs font-semibold text-gray-700 mb-1">Estudio</label>
                      <select
                        value={mapping.studioResource || ''}
                        onChange={(e) => handleResourceChange(program.id, 'studioResource', e.target.value)}
                        className="form-select block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Sin asignar</option>
                        <option value="1">Estudio 1</option>
                        <option value="2">Estudio 2</option>
                        <option value="3">Estudio 3</option>
                        <option value="4">Estudio 4</option>
                        <option value="5">Estudio 5</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap master-section">
                    <div className="w-full">
                      <label className="block md:hidden text-xs font-semibold text-gray-700 mb-1">Master</label>
                      <select
                        value={mapping.masterResource || ''}
                        onChange={(e) => handleResourceChange(program.id, 'masterResource', e.target.value)}
                        className="form-select block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Sin asignar</option>
                        <option value="1">Master 1</option>
                        <option value="2">Master 2</option>
                        <option value="3">Master 3</option>
                        <option value="4">Master 4</option>
                        <option value="5">Master 5</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-3">
                      {program.isExclusiveGroup && program.exclusivePersonnel?.length > 0 && (
                        <button
                          onClick={() => exportExclusiveGroupPersonnel(program, personnel)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                          title="Exportar personal a Excel"
                        >
                          <Download size={16} />
                          Excel
                        </button>
                      )}
                      {program.isCustom && (
                        <button
                          onClick={() => handleEditProgram(program)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Edit2 size={16} />
                          Editar
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleProgram(program.id, program.isCustom)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        title={program.isCustom ? 'Eliminar programa' : 'Quitar de programación'}
                      >
                        <Trash2 size={16} />
                        {program.isCustom ? 'Eliminar' : 'Quitar'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de edición de fechas */}
      {editingDates !== null && (() => {
        const program = allPrograms.find(p => p.id === editingDates);
        const isCustomProgram = program?.isCustom;
        const currentProgramDates = isCustomProgram
          ? (program.recordingDates || [])
          : (programDates[editingDates] || []);

        return (
          <DateEditorModal
            program={program}
            currentDates={currentProgramDates}
            onSave={async (data) => {
              if (isCustomProgram) {
                // Detectar si es grupo exclusivo
                const isExclusiveGroup = program?.isExclusiveGroup &&
                                        (program?.exclusiveType === 'MOVIL' || program?.exclusiveType === 'PUESTO_FIJO');

                if (isExclusiveGroup && data.startDate && data.endDate) {
                  // Actualizar programa exclusivo con rango de fechas
                  // Primero eliminar novedades antiguas
                  await removeExclusiveGroupNovelties(editingDates);

                  // Actualizar programa con nuevas fechas
                  customProgramsService.update(editingDates, {
                    startDate: data.startDate,
                    endDate: data.endDate
                  });

                  setCustomPrograms(prev => prev.map(p =>
                    p.id === editingDates ? { ...p, startDate: data.startDate, endDate: data.endDate } : p
                  ));

                  // Crear nuevas novedades con fechas actualizadas
                  await createExclusiveGroupNovelties(
                    { ...program, startDate: data.startDate, endDate: data.endDate },
                    program.exclusivePersonnel
                  );
                } else {
                  // Actualizar programa normal con fechas específicas
                  customProgramsService.update(editingDates, {
                    recordingDates: data
                  });
                  setCustomPrograms(prev => prev.map(p =>
                    p.id === editingDates ? { ...p, recordingDates: data } : p
                  ));
                }
              } else {
                // Guardar fechas para programa predefinido
                handleDateChange(editingDates, data);
              }
              setEditingDates(null);
            }}
            onClose={() => setEditingDates(null)}
          />
        );
      })()}

      {/* Información de grupos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Información sobre Grupos de Personal</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Grupo ESTUDIO:</strong> Verán el número de estudio asignado (Estudio 1-5)</p>
          <p><strong>Grupo MASTER:</strong> Verán el número de master asignado (Master 1-5)</p>
        </div>
      </div>

      {/* Clasificación de Personal Actualizada */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clasificación de Personal por Grupo</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grupo ESTUDIO */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              Grupo ESTUDIO
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Camarógrafo</li>
              <li>• Camarógrafo de estudio</li>
              <li>• Camarógrafo de reportería</li>
              <li>• Asistente de Cámara</li>
              <li>• Asistente de estudio</li>
              <li>• Asistente de reportería</li>
              <li>• Asistente de Escenografía</li>
              <li>• Asistente de luces</li>
              <li>• Coordinador</li>
              <li>• Coordinador estudio</li>
              <li>• Escenógrafo</li>
              <li className="text-green-700 font-medium">• Maquilladora</li>
              <li className="text-green-700 font-medium">• Maquillaje</li>
              <li className="text-green-700 font-medium">• Vestuario</li>
            </ul>
          </div>

          {/* Grupo MASTER */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
              Grupo MASTER
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• VTR</li>
              <li>• Operador de VTR</li>
              <li>• Director</li>
              <li>• Director de Cámaras</li>
              <li>• Realizador</li>
              <li>• Operador de Sonido</li>
              <li>• Operador consola de sonido</li>
              <li>• Asistente de sonido</li>
              <li>• Generador de Caracteres</li>
              <li>• Productor</li>
              <li>• Producción</li>
              <li>• Productor de Emisión</li>
              <li>• Productora</li>
              <li>• Teleprompter</li>
              <li>• Operador de teleprompter</li>
              <li>• Asistente de Producción</li>
              <li>• Pantallas</li>
              <li>• Operador de Pantallas</li>
              <li>• VMix</li>
              <li>• Operador de Vmix</li>
              <li className="text-blue-700 font-medium">• Contribuciones</li>
              <li className="text-blue-700 font-medium">• Operador de Video</li>
              <li className="text-blue-700 font-medium">• Operador de video</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

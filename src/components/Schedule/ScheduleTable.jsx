// src/components/Schedule/ScheduleTable.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Download, Edit2, Trash2, Wifi, WifiOff, Camera } from 'lucide-react';
import { generateSchedulePDF } from '../../utils/pdfGenerator';
import { classifyPersonnel, getResourceForPersonnel } from '../../utils/personnelClassification';
import { programMappingService } from '../../services/programMappingService';
import { customProgramsService } from '../../services/customProgramsService';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import { useContractValidation } from '../../hooks/useContractValidation';
import { WeekSelector } from '../Calendar/WeekSelector';
import { WEEKDAY_PROGRAMS as WEEKDAY_PROGRAMS_SOURCE, WEEKEND_PROGRAMS as WEEKEND_PROGRAMS_SOURCE } from '../../data/programs';

const API_URL = '/api';

// Programas de lunes a viernes - Importados desde programs.js
const WEEKDAY_PROGRAMS = WEEKDAY_PROGRAMS_SOURCE.map(p => ({
  id: p.id,
  name: p.name,
  defaultTime: p.time, // 🚨 MANTENER RANGO COMPLETO "06:00-10:00"
  time: p.time, // Agregar también como 'time' para compatibilidad
  color: p.color
}));

// Programas de fin de semana - Importados desde programs.js
const WEEKEND_PROGRAMS = WEEKEND_PROGRAMS_SOURCE.map(p => ({
  id: p.id,
  name: p.name,
  defaultTime: p.time, // 🚨 MANTENER RANGO COMPLETO "06:00-10:00"
  time: p.time, // Agregar también como 'time' para compatibilidad
  color: p.color
}));

export const ScheduleTable = ({ personnel, selectedDate, novelties, onExportPDF, showWeekSelector, weekSelectorProps }) => {
  // Hook de validación de contratos
  const { getContractStatus } = useContractValidation(personnel);

  // 🚨 WRAPPER para interceptar cambio de fecha y confirmar si hay cambios sin guardar
  const wrappedWeekSelectorProps = weekSelectorProps ? {
    ...weekSelectorProps,
    onDateSelect: (newDate) => {
      // Si hay cambios sin guardar, pedir confirmación
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(
          '⚠️ CAMBIOS SIN GUARDAR\n\n' +
          'Tienes cambios sin guardar en esta fecha.\n\n' +
          '¿Deseas descartarlos y cambiar de día?\n\n' +
          '• SÍ: Descartar cambios y cambiar de día\n' +
          '• NO: Permanecer en este día (usa "Guardar Jornada" primero)'
        );

        if (!confirmed) {
          return; // Usuario canceló, no cambiar de día
        }
      }

      // Si no hay cambios o el usuario confirmó, proceder con el cambio
      weekSelectorProps.onDateSelect(newDate);
    },
    onPrevWeek: () => {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(
          '⚠️ CAMBIOS SIN GUARDAR\n\n' +
          'Tienes cambios sin guardar.\n¿Deseas descartarlos y cambiar de semana?'
        );
        if (!confirmed) return;
      }
      weekSelectorProps.onPrevWeek();
    },
    onNextWeek: () => {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(
          '⚠️ CAMBIOS SIN GUARDAR\n\n' +
          'Tienes cambios sin guardar.\n¿Deseas descartarlos y cambiar de semana?'
        );
        if (!confirmed) return;
      }
      weekSelectorProps.onNextWeek();
    },
    onToday: () => {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(
          '⚠️ CAMBIOS SIN GUARDAR\n\n' +
          'Tienes cambios sin guardar.\n¿Deseas descartarlos e ir a hoy?'
        );
        if (!confirmed) return;
      }
      weekSelectorProps.onToday();
    }
  } : null;

  // Determinar si es fin de semana
  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;

  // Aplicar modificaciones de horarios desde localStorage y ordenar por hora
  const getProgramsWithModifiedTimes = (basePrograms, isWeekendDay) => {
    // Usar diferentes claves de localStorage para weekday y weekend
    const storageKey = isWeekendDay ? 'rtvc_program_times_weekend' : 'rtvc_program_times';
    const modifiedTimes = JSON.parse(localStorage.getItem(storageKey) || '{}');

    console.log(`📅 [getProgramsWithModifiedTimes] Tipo: ${isWeekendDay ? 'Fin de Semana' : 'Entre Semana'}`);
    console.log(`📅 [getProgramsWithModifiedTimes] Storage Key: ${storageKey}`);
    console.log(`📅 [getProgramsWithModifiedTimes] Horarios modificados:`, modifiedTimes);

    const programsWithTimes = basePrograms.map(program => ({
      ...program,
      defaultTime: modifiedTimes[program.id] || program.defaultTime
    }));

    // Ordenar por hora de inicio (convertir a minutos para comparación numérica)
    return programsWithTimes.sort((a, b) => {
      const timeA = (a.defaultTime || a.time || '').split('-')[0].trim();
      const timeB = (b.defaultTime || b.time || '').split('-')[0].trim();

      // Convertir "HH:MM" a minutos desde medianoche
      const toMinutes = (time) => {
        if (!time) return 0;
        const [hours, minutes] = time.split(':').map(Number);
        return (hours || 0) * 60 + (minutes || 0);
      };

      return toMinutes(timeA) - toMinutes(timeB);
    });
  };

  const initialPrograms = getProgramsWithModifiedTimes(isWeekend ? WEEKEND_PROGRAMS : WEEKDAY_PROGRAMS, isWeekend);

  const [programs, setPrograms] = useState(initialPrograms);
  const [assignments, setAssignments] = useState({});
  const [assignmentNotes, setAssignmentNotes] = useState({}); // Notas personalizadas para cada asignación
  const [editingCell, setEditingCell] = useState(null); // Celda que se está editando
  const [callTimes, setCallTimes] = useState({});
  const [endTimes, setEndTimes] = useState({}); // 🆕 Hora de fin (automática desde turnos, editable manualmente)
  const [manualEndTimes, setManualEndTimes] = useState({}); // 🆕 Marcador de horas de fin manuales
  const [manualCallTimes, setManualCallTimes] = useState({}); // 🚨 PILAR 1: CallTimes manuales (ley suprema)
  const [manualAssignments, setManualAssignments] = useState({}); // Asignaciones manuales (excepciones a la regla de callTime)
  const [autoShifts, setAutoShifts] = useState([]);
  const [programMappings, setProgramMappings] = useState({});
  const [loadedFromDB, setLoadedFromDB] = useState(false); // Indica si los datos actuales vienen de BD
  const [isFromSnapshot, setIsFromSnapshot] = useState(false); // 📸 Indica si los datos vienen de snapshot histórico
  const [snapshotMetadata, setSnapshotMetadata] = useState(null); // 📸 Metadata del snapshot
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // 🚨 Indica si hay cambios sin guardar
  const isUpdatingFromSocket = useRef(false);

  // 🚨 Refs para detectar cambios REALES (no solo carga de datos)
  const previousAssignments = useRef(null);
  const previousCallTimes = useRef(null);
  const previousEndTimes = useRef(null);
  const previousManualCallTimes = useRef(null);
  const previousManualEndTimes = useRef(null);
  const previousManualAssignments = useRef(null);

  // Memoizar el string de fecha para evitar re-renders
  const dateStr = useMemo(() => {
    return `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  }, [selectedDate]);

  // Helper: Convertir "HH:MM" a minutos desde medianoche
  const timeToMinutes = (timeStr) => {
    if (!timeStr || timeStr === '--:--') return -1;
    const timeString = String(timeStr || '');
    if (!timeString.includes(':')) return -1;
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  // Helper: Verificar si un programa debe mostrarse según callTime
  const shouldShowProgram = (personnelId, programId, program) => {
    const key = `${personnelId}_${programId}`;

    // Si es asignación manual, siempre mostrarla
    if (manualAssignments[key]) {
      return true;
    }

    // Obtener callTime del trabajador
    const workerCallTime = callTimes[personnelId];
    if (!workerCallTime || workerCallTime === '--:--') {
      return true; // Si no tiene callTime, mostrar todos
    }

    // Obtener hora de inicio del programa
    const programTime = program.defaultTime || program.time || '';
    const programStartTime = programTime.split('-')[0].trim();

    if (!programStartTime) return true;

    // Comparar tiempos
    const callMinutes = timeToMinutes(workerCallTime);
    const programMinutes = timeToMinutes(programStartTime);

    // Solo mostrar si el programa empieza en o después del llamado
    return programMinutes >= callMinutes;
  };

  // Indicador de conexión (sin WebSocket real, solo visual)
  const { isConnected } = useRealtimeSync(dateStr);


  // EFECTO COMBINADO: Cargar programs Y assignments en el orden correcto
  useEffect(() => {
    let isCancelled = false;

    const loadEverything = async () => {
      // 🧹 LIMPIEZA DE LOCALSTORAGE: Limpiar SOLO datos de programación (NO credenciales)
      console.log('🧹 [LOCALSTORAGE] Limpiando datos de programación (preservando credenciales)...');
      const keysToKeep = ['token', 'user', 'bypass_mode']; // Preservar credenciales
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToKeep.includes(key)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`✅ [LOCALSTORAGE] Eliminadas ${keysToRemove.length} claves, preservadas ${keysToKeep.length} claves`);

      // 🧹 LIMPIEZA DE ZOMBIS: Resetear todos los estados al cambiar de día
      // Esto asegura que no queden residuos del día anterior en memoria
      console.log('🧹 [ZOMBIE CLEANUP] Limpiando memoria al cargar nuevo día...');
      setAssignments({});
      setCallTimes({});
      setEndTimes({});
      setManualEndTimes({});
      setManualCallTimes({});
      setManualAssignments({});
      setAutoShifts([]);
      setLoadedFromDB(false);
      setIsFromSnapshot(false); // 📸 Resetear indicador de snapshot
      setSnapshotMetadata(null); // 📸 Limpiar metadata de snapshot
      setHasUnsavedChanges(false); // Importante: nuevo día = sin cambios pendientes

      // Resetear refs de comparación para que el detector NO dispare en la primera carga
      previousAssignments.current = null;
      previousCallTimes.current = null;
      previousEndTimes.current = null;
      previousManualCallTimes.current = null;
      previousManualEndTimes.current = null;
      previousManualAssignments.current = null;

      console.log('✅ [ZOMBIE CLEANUP] Memoria limpiada, iniciando carga fresca...');

      const dayOfWeek = selectedDate.getDay();
      const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
      const basePrograms = getProgramsWithModifiedTimes(isWeekendDay ? WEEKEND_PROGRAMS : WEEKDAY_PROGRAMS, isWeekendDay);

      console.log('🔄 [useEffect] Ejecutando para fecha:', dateStr);
      setIsLoadingSchedule(true);

      // PASO 1: Preparar programs
      const customPrograms = customProgramsService.getAll();
      const filteredCustomPrograms = customPrograms.filter(program => {
        // Filtrar por tipo de programa (weekday/weekend)
        const programType = program.programType || 'weekday'; // Por defecto weekday
        if (isWeekendDay && programType !== 'weekend') return false;
        if (!isWeekendDay && programType !== 'weekday') return false;

        // Filtrar por fechas específicas
        if (!program.recordingDates || program.recordingDates.length === 0) return true;
        return program.recordingDates.includes(dateStr);
      });

      // No filtrar programas - mostrar todos siempre
      const filteredBasePrograms = basePrograms;

      const mappings = await programMappingService.getAll();
      setProgramMappings(mappings);

      const allPrograms = [...filteredBasePrograms, ...filteredCustomPrograms];

      // APLICAR horarios modificados de localStorage
      const storageKey = isWeekendDay ? 'rtvc_program_times_weekend' : 'rtvc_program_times';
      const modifiedTimes = JSON.parse(localStorage.getItem(storageKey) || '{}');
      console.log(`🔧 [Initial Programs] Aplicando horarios modificados de ${storageKey}:`, modifiedTimes);

      const programsWithModifiedTimes = allPrograms.map(program => ({
        ...program,
        defaultTime: modifiedTimes[program.id] || program.defaultTime || program.time
      }));

      // Ordenar todos los programas
      const sortedPrograms = programsWithModifiedTimes.sort((a, b) => {
        const timeA = (a.defaultTime || a.time || '00:00').split(':')[0] + ':' + (a.defaultTime || a.time || '00:00').split(':')[1].substring(0, 2);
        const timeB = (b.defaultTime || b.time || '00:00').split(':')[0] + ':' + (b.defaultTime || b.time || '00:00').split(':')[1].substring(0, 2);
        return timeA.localeCompare(timeB);
      });

      setPrograms(sortedPrograms);

      try {
        // PASO 2: Consultar BD
        const response = await fetch(`${API_URL}/schedule/daily/${dateStr}`);
        const savedData = await response.json();

        if (isCancelled) return;

        // PASO 3: Obtener turnos
        const shiftsRes = await fetch(`${API_URL}/schedule/auto-shifts/${dateStr}`);
        const shiftsData = await shiftsRes.json();

        if (isCancelled) return;

        // 📸 Detectar si los datos vienen de snapshot histórico
        if (shiftsData.from_snapshot) {
          console.log(`📸 [SNAPSHOT] Datos históricos cargados desde snapshot de ${dateStr}`);
          setIsFromSnapshot(true);
          setSnapshotMetadata(shiftsData.metadata);
          setAutoShifts(shiftsData.shifts);
        } else {
          console.log(`📊 [DINÁMICO] Datos calculados dinámicamente para ${dateStr}`);
          setIsFromSnapshot(false);
          setSnapshotMetadata(null);
          setAutoShifts(shiftsData);
        }

        // NO usar programas de BD - siempre usar programs.js
        console.log('✅ [ScheduleTable] Usando programas de programs.js, NO de BD');

        // PASO 5: Assignments Y CallTimes - de BD o automáticos
        if (savedData.found && savedData.assignments && Object.keys(savedData.assignments).length > 0) {
          // ✅ USAR ASIGNACIONES DIRECTAMENTE (ya vienen en formato correcto: {personnel_id_program_id: true})
          const convertedAssignments = { ...savedData.assignments };

          console.log('✅ [ScheduleTable] Asignaciones cargadas desde BD:', Object.keys(convertedAssignments).length, 'assignments');
          console.log('🔑 [ScheduleTable] Primeras 10 keys:', Object.keys(convertedAssignments).slice(0, 10));

          // ✅ USAR CALLTIMES DIRECTAMENTE (ya vienen en formato correcto: {personnel_id: "HH:MM"})
          const convertedCallTimes = { ...(savedData.callTimes || {}) };
          const convertedManualCallTimes = { ...(savedData.manualCallTimes || {}) };

          console.log('✅ [ScheduleTable] CallTimes cargados desde BD:', Object.keys(convertedCallTimes).length, 'callTimes');

          // 🚨 SINCRONIZACIÓN CRÍTICA: Validar callTimes de BD contra shifts actuales
          // Los callTimes MANUALES se respetan, pero los automáticos se sincronizan con shifts
          const savedCallTimes = convertedCallTimes;
          const finalManualCallTimes = { ...convertedManualCallTimes, ...(savedData.manualCallTimes || {}) }; // 🚨 PILAR 1: Cargar marcadores de manuales
          const finalManualAssignments = savedData.manualAssignments || {}; // 🚨 PILAR 3: Cargar marcadores de asignaciones manuales

          // Crear callTimes y endTimes sincronizados: manuales se respetan, automáticos se actualizan desde shifts
          const finalCallTimes = {};
          const finalEndTimes = {};
          const savedEndTimes = savedData.endTimes || {};
          const finalManualEndTimes = savedData.manualEndTimes || {};

          shiftsData.forEach(shift => {
            const personId = shift.personnel_id.toString();
            const shiftCallTime = shift.shift_start.substring(0, 5);
            const shiftEndTime = shift.shift_end.substring(0, 5);

            // HORA LLAMADO: Si es manual, respetar el guardado; si no, usar el del shift actual
            if (finalManualCallTimes[personId]) {
              finalCallTimes[personId] = savedCallTimes[personId] || shiftCallTime;
              console.log(`   🔒 [SYNC] Persona ${personId}: callTime MANUAL preservado → ${finalCallTimes[personId]}`);
            } else {
              finalCallTimes[personId] = shiftCallTime;
              if (savedCallTimes[personId] && savedCallTimes[personId] !== shiftCallTime) {
                console.log(`   🔄 [SYNC] Persona ${personId}: callTime actualizado ${savedCallTimes[personId]} → ${shiftCallTime}`);
              }
            }

            // HORA FIN: Si es manual, respetar el guardado; si no, usar el del shift actual
            if (finalManualEndTimes[personId]) {
              finalEndTimes[personId] = savedEndTimes[personId] || shiftEndTime;
              console.log(`   🔒 [SYNC] Persona ${personId}: endTime MANUAL preservado → ${finalEndTimes[personId]}`);
            } else {
              finalEndTimes[personId] = shiftEndTime;
            }
          });

          // 🚨 VALIDACIÓN CRÍTICA: ¿Hay callTimes manuales que difieren de los shifts?
          // Si sí, recalcular asignaciones automáticas con el callTime manual
          // ESTE FILTRO SE APLICA SIEMPRE, INCLUSO PARA EL DÍA HOY
          console.log(`🔍 [VALIDACIÓN HORARIO] Verificando callTimes manuales para ${dateStr}...`);
          console.log(`   📊 Total asignaciones guardadas: ${Object.keys(savedData.assignments).length}`);
          console.log(`   🔒 Total callTimes manuales: ${Object.keys(finalManualCallTimes).length}`);

          const recalculatedAssignments = { ...convertedAssignments };
          let needsRecalculation = false;

          Object.keys(finalManualCallTimes).forEach(personId => {
            if (finalManualCallTimes[personId]) {
              // Esta persona tiene callTime manual
              const manualCallTime = finalCallTimes[personId];
              const shift = shiftsData.find(s => s.personnel_id.toString() === personId.toString());

              if (shift) {
                const shiftCallTime = shift.shift_start.substring(0, 5);

                if (manualCallTime !== shiftCallTime) {
                  needsRecalculation = true;
                  console.log(`⚠️ CallTime manual detectado: Persona ${personId} tiene ${manualCallTime} (manual) vs ${shiftCallTime} (shift) - recalculando...`);

                  // Recalcular asignaciones para esta persona
                  const callMinutes = timeToMinutes(manualCallTime);
                  const endTime = shift.shift_end.substring(0, 5);
                  const endMinutes = timeToMinutes(endTime);

                  sortedPrograms.forEach(program => {
                    const key = `${personId}_${program.id}`;

                    // Si es asignación manual, no tocar
                    if (finalManualAssignments[key]) {
                      return;
                    }

                    // Calcular solapamiento basado en callTime MANUAL
                    const programTime = program.defaultTime || program.time || '';
                    const timeParts = programTime.split('-');
                    const programStartTime = timeParts[0].trim();

                    let programEndTime;
                    if (timeParts.length > 1) {
                      programEndTime = timeParts[1].trim();
                    } else {
                      const [h, m] = programStartTime.split(':').map(Number);
                      const endM = h * 60 + m + 60;
                      programEndTime = `${String(Math.floor(endM / 60)).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;
                    }

                    const programStartMinutes = timeToMinutes(programStartTime);
                    const programEndMinutes = timeToMinutes(programEndTime);

                    // 🚨 LÓGICA DE COBERTURA PARCIAL (Overlapping)
                    // REGLA: Asignar si el trabajador está presente durante CUALQUIER PARTE del programa
                    // El programa debe empezar ANTES de que el trabajador se vaya Y terminar DESPUÉS de que llegue
                    // FÓRMULA: (programStartMinutes < endMinutes) && (programEndMinutes > callMinutes)
                    const hasOverlap = (programStartMinutes < endMinutes) && (programEndMinutes > callMinutes);

                    if (hasOverlap) {
                      recalculatedAssignments[key] = true;
                    } else {
                      delete recalculatedAssignments[key];
                    }
                  });
                }
              }
            }
          });

          if (needsRecalculation) {
            console.log(`✅ [VALIDACIÓN HORARIO] Asignaciones recalculadas basadas en callTimes manuales para ${dateStr}`);
          } else {
            console.log(`✅ [VALIDACIÓN HORARIO] No se requiere recálculo para ${dateStr} (no hay callTimes manuales diferentes a shifts)`);
          }

          if (!isCancelled) {
            setCallTimes(finalCallTimes);
            setEndTimes(finalEndTimes); // 🆕 Cargar horas de fin
            setManualEndTimes(finalManualEndTimes); // 🆕 Cargar marcadores de horas de fin manuales
            setManualCallTimes(finalManualCallTimes); // 🚨 PILAR 1: Restaurar qué callTimes son manuales
            setManualAssignments(finalManualAssignments); // 🚨 PILAR 3: Restaurar qué asignaciones son manuales
            setAssignments(recalculatedAssignments); // Con recálculo si fue necesario
            setLoadedFromDB(true);
            setIsLoadingSchedule(false);
          }
          return;
        }

        // NO HAY DATOS - Generar CallTimes y EndTimes desde shifts
        const newCallTimes = {};
        const newEndTimes = {};
        shiftsData.forEach(shift => {
          newCallTimes[shift.personnel_id] = shift.shift_start.substring(0, 5);
          newEndTimes[shift.personnel_id] = shift.shift_end.substring(0, 5);
        });
        setCallTimes(newCallTimes);
        setEndTimes(newEndTimes);

        // Generar automáticos
        const newAssignments = {};
        console.log(`🔍 [AUTO-ASSIGN] Generando asignaciones para ${shiftsData.length} empleados y ${sortedPrograms.length} programas`);

        shiftsData.forEach(shift => {
          const time = shift.shift_start.substring(0, 5);
          const endTime = shift.shift_end.substring(0, 5);

          const [startHour, startMin] = time.split(':').map(Number);
          const [endHour, endMin] = endTime.split(':').map(Number);
          const shiftStartMinutes = startHour * 60 + startMin;
          const shiftEndMinutes = endHour * 60 + endMin;

          console.log(`   👤 Persona ${shift.personnel_id}: Turno ${time}-${endTime} (${shiftStartMinutes}-${shiftEndMinutes} min)`);

          let assignedCount = 0;
          sortedPrograms.forEach(program => {
            const fullTime = (program.defaultTime || program.time || '');
            const timeParts = fullTime.split('-');
            const programStart = timeParts[0].trim();

            let programEnd;
            if (timeParts.length > 1) {
              programEnd = timeParts[1].trim();
            } else {
              const [h, m] = programStart.split(':').map(Number);
              const endMinutes = h * 60 + m + 60;
              programEnd = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
            }

            const [progStartHour, progStartMin] = programStart.split(':').map(Number);
            const [progEndHour, progEndMin] = programEnd.split(':').map(Number);
            const progStartMinutes = progStartHour * 60 + progStartMin;
            const progEndMinutes = progEndHour * 60 + progEndMin;

            // 🚨 LÓGICA DE COBERTURA PARCIAL (Overlapping)
            // REGLA: Asignar si el trabajador está presente durante CUALQUIER PARTE del programa
            // FÓRMULA: (progStartMinutes < shiftEndMinutes) && (progEndMinutes > shiftStartMinutes)
            const hasOverlap = (progStartMinutes < shiftEndMinutes) && (progEndMinutes > shiftStartMinutes);

            if (hasOverlap) {
              newAssignments[`${shift.personnel_id}_${program.id}`] = true;
              assignedCount++;
              console.log(`      ✅ Asignado: ${program.name} (${programStart}-${programEnd}) - trabajador presente durante el programa`);
            } else {
              const reason = progStartMinutes >= shiftEndMinutes
                ? `programa empieza después de que el trabajador se va (${programStart} >= ${endTime})`
                : `programa termina antes de que el trabajador llegue (${programEnd} <= ${time})`;
              console.log(`      ❌ Rechazado: ${program.name} (${programStart}-${programEnd}) - ${reason}`);
            }
          });

          console.log(`   📊 Total asignado a persona ${shift.personnel_id}: ${assignedCount} programas`);
        });

        console.log(`✅ [AUTO-ASSIGN] Total de asignaciones generadas: ${Object.keys(newAssignments).length}`);

        if (!isCancelled) {
          setAssignments(newAssignments);
          setLoadedFromDB(false);
          setIsLoadingSchedule(false);
        }

      } catch (error) {
        if (!isCancelled) {
          setAssignments({});
          setLoadedFromDB(false);
          setIsLoadingSchedule(false);
        }
      }
    };

    loadEverything();

    return () => {
      isCancelled = true;
    };
  }, [dateStr]);

  // 🚫 AUTO-GUARDADO DESACTIVADO - Ahora es manual con botón "Guardar Jornada"
  // El usuario tiene control total sobre cuándo guardar
  /*
  useEffect(() => {
    // ... código de auto-save comentado para referencia futura ...
  }, [assignments, callTimes, manualCallTimes, manualAssignments, programs, autoShifts, dateStr]);
  */

  // 🔔 DETECTOR DE CAMBIOS REAL: Solo marca si hay cambios VERDADEROS (no navegación)
  useEffect(() => {
    // No marcar cambios si está cargando o actualizando desde socket
    if (isLoadingSchedule || isUpdatingFromSocket.current) {
      return;
    }

    // Si NO hay datos previos, es la primera carga → guardar snapshot y NO marcar cambios
    if (previousAssignments.current === null) {
      previousAssignments.current = JSON.stringify(assignments);
      previousCallTimes.current = JSON.stringify(callTimes);
      previousEndTimes.current = JSON.stringify(endTimes);
      previousManualCallTimes.current = JSON.stringify(manualCallTimes);
      previousManualEndTimes.current = JSON.stringify(manualEndTimes);
      previousManualAssignments.current = JSON.stringify(manualAssignments);
      return;
    }

    // Comparar estado actual con snapshot anterior
    const assignmentsChanged = JSON.stringify(assignments) !== previousAssignments.current;
    const callTimesChanged = JSON.stringify(callTimes) !== previousCallTimes.current;
    const endTimesChanged = JSON.stringify(endTimes) !== previousEndTimes.current;
    const manualCallTimesChanged = JSON.stringify(manualCallTimes) !== previousManualCallTimes.current;
    const manualEndTimesChanged = JSON.stringify(manualEndTimes) !== previousManualEndTimes.current;
    const manualAssignmentsChanged = JSON.stringify(manualAssignments) !== previousManualAssignments.current;

    // Si algo cambió de verdad, marcar como sin guardar
    if (assignmentsChanged || callTimesChanged || endTimesChanged || manualCallTimesChanged || manualEndTimesChanged || manualAssignmentsChanged) {
      console.log('🔔 [CAMBIOS DETECTADOS]', {
        assignmentsChanged,
        callTimesChanged,
        endTimesChanged,
        manualCallTimesChanged,
        manualEndTimesChanged,
        manualAssignmentsChanged
      });
      setHasUnsavedChanges(true);

      // Actualizar snapshot
      previousAssignments.current = JSON.stringify(assignments);
      previousCallTimes.current = JSON.stringify(callTimes);
      previousEndTimes.current = JSON.stringify(endTimes);
      previousManualCallTimes.current = JSON.stringify(manualCallTimes);
      previousManualEndTimes.current = JSON.stringify(manualEndTimes);
      previousManualAssignments.current = JSON.stringify(manualAssignments);
    }
  }, [assignments, callTimes, endTimes, manualCallTimes, manualEndTimes, manualAssignments, isLoadingSchedule]);

  // 💾 GUARDADO MANUAL: Función para guardar cuando el usuario presiona el botón
  const handleSaveSchedule = async () => {
    setIsSaving(true);

    try {
      // Convertir assignments al formato simple (true/false) antes de guardar
      const simpleAssignments = {};
      Object.keys(assignments).forEach(key => {
        if (assignments[key]) {
          simpleAssignments[key] = true;
        }
      });

      console.log(`💾 [GUARDADO MANUAL] Guardando ${dateStr}:`, {
        assignments: Object.keys(simpleAssignments).length,
        callTimes: Object.keys(callTimes).length,
        endTimes: Object.keys(endTimes).length,
        manualCallTimes: Object.keys(manualCallTimes).length,
        manualEndTimes: Object.keys(manualEndTimes).length,
        manualAssignments: Object.keys(manualAssignments).length,
        programs: programs.length
      });

      // PASO 1: Guardar en el endpoint daily (formato actual)
      const response = await fetch(`${API_URL}/schedule/daily/${dateStr}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignments: simpleAssignments,
          callTimes,
          endTimes,
          manualCallTimes,
          manualEndTimes,
          manualAssignments,
          programs,
          shifts: autoShifts
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(`❌ [GUARDADO MANUAL] Error del servidor:`, result);
        alert(`❌ Error al guardar: ${result.error || 'Error desconocido'}`);
        return;
      }

      console.log(`✅ [GUARDADO MANUAL] Guardado exitoso en daily/${dateStr}`);

      // PASO 2: Guardar snapshot inmutable para historial
      console.log(`📸 [SNAPSHOT] Guardando snapshot inmutable para ${dateStr}...`);

      // Preparar datos del snapshot desde autoShifts
      const snapshotShifts = autoShifts.map(shift => ({
        area: shift.area,
        personnel_id: shift.personnel_id,
        personnel_name: shift.name,
        personnel_role: shift.role || null,
        shift_number: shift.week_number || 1,
        shift_start_time: shift.shift_start,
        shift_end_time: shift.shift_end,
        shift_label: shift.original_shift || `T${shift.week_number || 1}`,
        shift_description: shift.turno_descripcion || null,
        status: 'ACTIVO',
        notes: null,
        rotation_week: shift.rotation_number || shift.week_number || null,
        is_weekend: isWeekend
      }));

      const snapshotResponse = await fetch(`${API_URL}/snapshots/save/${dateStr}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shifts: snapshotShifts,
          rotation_week: snapshotShifts[0]?.rotation_week || null,
          notes: `Guardado manual desde ScheduleTable - ${new Date().toLocaleString('es-CO')}`
        })
      });

      const snapshotResult = await snapshotResponse.json();

      if (snapshotResponse.ok) {
        console.log(`✅ [SNAPSHOT] Snapshot guardado exitosamente:`, snapshotResult);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        alert('✅ Jornada guardada exitosamente\n📸 Snapshot histórico creado');
      } else {
        console.warn(`⚠️ [SNAPSHOT] Error al guardar snapshot:`, snapshotResult);
        // No fallar si el snapshot falla - el guardado principal ya funcionó
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        alert('✅ Jornada guardada exitosamente\n⚠️ Snapshot no pudo crearse (datos guardados en formato anterior)');
      }

    } catch (error) {
      console.error('❌ [GUARDADO MANUAL] Error de red:', error);
      alert(`❌ Error de red: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date) => {
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    const months = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName} ${day} ${month} DE ${year}`;
  };



  // 🚨 FUNCIÓN RESET: Limpiar datos del día actual y forzar recarga desde BD
  const handleResetDatosHoy = async () => {
    if (!window.confirm(
      '⚠️ RESET DATOS DEL DÍA ACTUAL\n\n' +
      'Esto eliminará TODOS los datos locales de este día y recargará desde la base de datos.\n\n' +
      '🗑️ SE ELIMINARÁN:\n' +
      '• Asignaciones guardadas en memoria\n' +
      '• CallTimes modificados\n' +
      '• Datos de localStorage\n\n' +
      '✅ SE RECARGARÁ:\n' +
      '• Datos frescos desde la base de datos\n' +
      '• Turnos automáticos si no hay datos guardados\n\n' +
      '¿Continuar?'
    )) {
      return;
    }

    try {
      console.log(`🗑️ [RESET] Limpiando datos locales para ${dateStr}...`);

      // Limpiar localStorage (PRESERVANDO credenciales)
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const bypassMode = localStorage.getItem('bypass_mode');
      localStorage.clear();
      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', user);
      if (bypassMode) localStorage.setItem('bypass_mode', bypassMode);
      console.log('✅ [RESET] localStorage limpiado (credenciales preservadas)');

      // Resetear todos los estados a vacío
      setAssignments({});
      setCallTimes({});
      setEndTimes({});
      setManualCallTimes({});
      setManualEndTimes({});
      setManualAssignments({});
      setAutoShifts([]);
      setLoadedFromDB(false);
      setHasUnsavedChanges(false);

      // Resetear refs
      previousAssignments.current = null;
      previousCallTimes.current = null;
      previousEndTimes.current = null;
      previousManualCallTimes.current = null;
      previousManualEndTimes.current = null;
      previousManualAssignments.current = null;

      console.log('✅ [RESET] Estados locales reseteados');

      // Forzar recarga desde BD
      setIsLoadingSchedule(true);

      const response = await fetch(`${API_URL}/schedule/daily/${dateStr}`);
      const savedData = await response.json();

      if (savedData.found && savedData.assignments) {
        console.log(`✅ [RESET] Datos recargados desde BD: ${Object.keys(savedData.assignments).length} asignaciones`);
        setAssignments(savedData.assignments);
        setCallTimes(savedData.callTimes || {});
        setEndTimes(savedData.endTimes || {});
        setManualCallTimes(savedData.manualCallTimes || {});
        setManualEndTimes(savedData.manualEndTimes || {});
        setManualAssignments(savedData.manualAssignments || {});
        setLoadedFromDB(true);
      } else {
        console.log(`⚠️ [RESET] No hay datos guardados en BD para ${dateStr}, generando automáticos...`);

        // Obtener turnos y generar asignaciones automáticas
        const shiftsRes = await fetch(`${API_URL}/schedule/auto-shifts/${dateStr}`);
        const shiftsData = await shiftsRes.json();
        setAutoShifts(shiftsData);

        const newCallTimes = {};
        const newEndTimes = {};
        shiftsData.forEach(shift => {
          newCallTimes[shift.personnel_id] = shift.shift_start.substring(0, 5);
          newEndTimes[shift.personnel_id] = shift.shift_end.substring(0, 5);
        });
        setCallTimes(newCallTimes);
        setEndTimes(newEndTimes);

        const newAssignments = {};
        shiftsData.forEach(shift => {
          const time = shift.shift_start.substring(0, 5);
          const endTime = shift.shift_end.substring(0, 5);
          const [startHour, startMin] = time.split(':').map(Number);
          const [endHour, endMin] = endTime.split(':').map(Number);
          const shiftStartMinutes = startHour * 60 + startMin;
          const shiftEndMinutes = endHour * 60 + endMin;

          programs.forEach(program => {
            const fullTime = (program.defaultTime || program.time || '');
            const timeParts = fullTime.split('-');
            const programStart = timeParts[0].trim();
            let programEnd;
            if (timeParts.length > 1) {
              programEnd = timeParts[1].trim();
            } else {
              const [h, m] = programStart.split(':').map(Number);
              const endMinutes = h * 60 + m + 60;
              programEnd = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
            }

            const [progStartHour, progStartMin] = programStart.split(':').map(Number);
            const [progEndHour, progEndMin] = programEnd.split(':').map(Number);
            const progStartMinutes = progStartHour * 60 + progStartMin;
            const progEndMinutes = progEndHour * 60 + progEndMin;

            // 🚨 LÓGICA DE COBERTURA PARCIAL
            const hasOverlap = (progStartMinutes < shiftEndMinutes) && (progEndMinutes > shiftStartMinutes);
            if (hasOverlap) {
              newAssignments[`${shift.personnel_id}_${program.id}`] = true;
            }
          });
        });

        setAssignments(newAssignments);
        setLoadedFromDB(false);
      }

      setIsLoadingSchedule(false);

      alert(
        `✅ RESET COMPLETADO\n\n` +
        `Los datos del día ${dateStr} han sido limpiados y recargados.\n\n` +
        `Puedes comenzar a trabajar con datos frescos desde la base de datos.`
      );

    } catch (error) {
      console.error('❌ [RESET] Error:', error);
      alert(`❌ Error al resetear: ${error.message}`);
      setIsLoadingSchedule(false);
    }
  };

  const toggleAssignment = (personnelId, programId) => {
    const key = `${personnelId}_${programId}`;

    console.log(`🔄 [TOGGLE] ${key}: ${assignments[key]} → ${!assignments[key]}`);

    // Permitir asignaciones libremente (sin validaciones para CONTRIBUCIONES)
    // El usuario puede ajustar manualmente lo que necesite
    const newAssignments = {
      ...assignments,
      [key]: !assignments[key]
    };
    setAssignments(newAssignments);

    // Marcar esta asignación como manual (excepción a la regla de callTime)
    // Si se está activando (true), marcarla como manual
    // Si se está desactivando (false), quitarla de manualAssignments
    const newManualAssignments = { ...manualAssignments };
    if (newAssignments[key]) {
      newManualAssignments[key] = true;
    } else {
      delete newManualAssignments[key];
    }
    setManualAssignments(newManualAssignments);

    console.log(`✅ [TOGGLE] Total asignaciones ahora: ${Object.keys(newAssignments).length}`);
    console.log(`🔧 [TOGGLE] Asignación marcada como manual: ${key}`);

    // NO usar saveSchedule inmediato - confiar en el auto-save del useEffect
    // setTimeout(() => saveSchedule(newAssignments, callTimes), 500);
  };


  // Orden personalizado de áreas
  const areaOrder = [
    'PRODUCTORES',
    'ASISTENTES DE PRODUCCIÓN',
    'DIRECTORES DE CÁMARA',
    'VTR',
    'OPERADORES DE VMIX',
    'OPERADORES DE PANTALLAS',
    'GENERADORES DE CARACTERES',
    'OPERADORES DE SONIDO',
    'ASISTENTES DE SONIDO',
    'OPERADORES DE PROMPTER',
    'CAMARÓGRAFOS DE ESTUDIO',
    'ASISTENTES DE ESTUDIO',
    'COORDINADOR ESTUDIO',
    'ESCENOGRAFÍA',
    'ASISTENTES DE LUCES',
    'OPERADORES DE VIDEO',
    'CONTRIBUCIONES',
    'REALIZADORES',
    'CAMARÓGRAFOS DE REPORTERÍA',
    'ASISTENTES DE REPORTERÍA',
    'VESTUARIO',
    'MAQUILLAJE',
  ];

  const personnelByDept = personnel.reduce((acc, person) => {
    if (!acc[person.area]) acc[person.area] = [];
    acc[person.area].push(person);
    return acc;
  }, {});

  // Ordenar según areaOrder
  const sortedDepts = Object.entries(personnelByDept).sort((a, b) => {
    const indexA = areaOrder.indexOf(a[0]);
    const indexB = areaOrder.indexOf(b[0]);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return (
    <>
      {/* WeekSelector sticky */}
      {showWeekSelector && wrappedWeekSelectorProps && (
        <div className="week-selector-sticky">
          <WeekSelector {...wrappedWeekSelectorProps} />
        </div>
      )}

      <div className="schedule-table-container bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Encabezado */}
        <div className="bg-blue-900 text-white p-3">
          <div className="flex justify-between items-center">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-center">
              COORDINACIÓN PARA EL CUMPLIMIENTO DE ACTIVIDADES DE RTVC {formatDate(selectedDate)}
            </h2>
            {/* 📸 Indicador de Snapshot Histórico */}
            {isFromSnapshot && snapshotMetadata && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                  <Camera size={14} />
                  <span>SNAPSHOT HISTÓRICO</span>
                </div>
                <span className="text-xs text-gray-300">
                  Guardado: {new Date(snapshotMetadata.saved_at).toLocaleString('es-CO')}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Indicador de conexión WebSocket */}
            <div className="flex items-center gap-2 bg-blue-800 px-3 py-2 rounded">
              {isConnected ? (
                <>
                  <Wifi size={16} className="text-green-400" />
                  <span className="text-xs">Sincronizado</span>
                </>
              ) : (
                <>
                  <WifiOff size={16} className="text-red-400" />
                  <span className="text-xs">Desconectado</span>
                </>
              )}
            </div>

            {/* Indicador de guardado */}
            {isSaving && (
              <div className="flex items-center gap-2 bg-blue-800 px-3 py-2 rounded">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span className="text-xs">Guardando...</span>
              </div>
            )}

            {lastSaved && !isSaving && !hasUnsavedChanges && (
              <div className="text-xs text-blue-200">
                ✓ Guardado: {lastSaved.toLocaleTimeString()}
              </div>
            )}

            {/* 💾 BOTÓN GUARDAR JORNADA */}
            <button
              onClick={handleSaveSchedule}
              disabled={isSaving || !hasUnsavedChanges}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded font-medium transition-all whitespace-nowrap ${
                hasUnsavedChanges
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg animate-pulse'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              } disabled:opacity-50`}
              title={hasUnsavedChanges ? 'Hay cambios sin guardar' : 'No hay cambios pendientes'}
            >
              <span className="text-lg flex-shrink-0">💾</span>
              <span className="text-xs sm:text-sm font-bold">
                {hasUnsavedChanges ? 'Guardar Jornada' : 'Sin cambios'}
              </span>
            </button>

            {/* 🚨 BOTÓN RESET DATOS HOY */}
            <button
              onClick={handleResetDatosHoy}
              disabled={isLoadingSchedule}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Limpiar datos locales y recargar desde BD"
            >
              <span className="text-lg">🗑️</span>
              <span className="text-sm font-medium">Reset Datos Hoy</span>
            </button>

            <button
              onClick={() => generateSchedulePDF(personnel, programs, assignments, callTimes, selectedDate, programMappings)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
            >
              <Download size={18} />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="border border-gray-300 p-2 sticky left-0 bg-blue-700 z-10">NOMBRE</th>
              <th className="border border-gray-300 p-2">ACTIVIDAD</th>
              <th className="border border-gray-300 p-2">HORA LLAMADO</th>
              <th className="border border-gray-300 p-2">HORA FIN</th>
              {programs.map(program => {
                // Mostrar rango completo: "HH:MM - HH:MM" o solo "HH:MM" si no hay rango
                const timeDisplay = program.defaultTime || program.time || '--:--';
                return (
                  <th key={program.id} className="border border-gray-300 p-2 text-xs font-semibold" style={{ backgroundColor: program.color }}>
                    <div className="text-sm font-bold mb-1">{program.name}</div>
                    <div className="text-xs">{timeDisplay}</div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {sortedDepts.map(([dept, deptPersonnel]) => {
              // ordenar personal por hora de llamado
              const sortedByTime = [...deptPersonnel].sort((a, b) => {
                const timeA = callTimes[a.id] || '99:99';
                const timeB = callTimes[b.id] || '99:99';
                return (timeA || "").toString().localeCompare((timeB || "").toString());
              });

              return (
  <React.Fragment key={dept}>
    {/* Encabezado del área */}
    <tr className="bg-blue-800 text-white font-bold">
      <td colSpan={4 + programs.length} className="border border-gray-300 p-2">{dept}</td>
    </tr>

    {/* Encabezado de columnas para esta área */}
    <tr className="bg-blue-700 text-white">
      <th className="border border-gray-300 p-2 sticky left-0 bg-blue-700 z-10">NOMBRE</th>
      <th className="border border-gray-300 p-2">ACTIVIDAD</th>
      <th className="border border-gray-300 p-2">HORA LLAMADO</th>
      <th className="border border-gray-300 p-2">HORA FIN</th>
      {programs.map(program => {
        // Mostrar rango completo: "HH:MM - HH:MM" o solo "HH:MM" si no hay rango
        const timeDisplay = program.defaultTime || program.time || '--:--';
        return (
          <th key={program.id} className="border border-gray-300 p-2 text-xs font-semibold" style={{ backgroundColor: program.color }}>
            <div className="text-sm font-bold mb-1">{program.name}</div>
            <div className="text-xs">{timeDisplay}</div>
          </th>
        );
      })}
    </tr>

                  {sortedByTime.map(person => {
                    // Buscar si la persona tiene novedad "SIN CONTRATO" hoy
                    const today = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                    const hasSinContrato = novelties?.some(n => {
                      if (Number(n.personnel_id) !== Number(person.id)) return false;
                      if (n.type !== 'SIN_CONTRATO') return false;

                      // Verificar si hoy está en el rango
                      if (n.start_date && n.end_date) {
                        const startStr = n.start_date.split('T')[0];
                        const endStr = n.end_date.split('T')[0];
                        return todayStr >= startStr && todayStr <= endStr;
                      }

                      if (n.date) {
                        return n.date.split('T')[0] === todayStr;
                      }

                      return false;
                    });

                    // Validar estado del contrato para esta persona
                    const contractStatus = getContractStatus(person.id);
                    const isContractExpired = contractStatus.isExpired;

                    return (
                    <tr key={person.id} className="hover:bg-gray-50">
                      <td className={`border border-gray-300 p-2 sticky left-0 bg-white font-medium ${isContractExpired ? 'bg-red-50' : ''}`}>
                        <span className={isContractExpired ? 'text-red-700 font-bold' : ''}>
                          {person.name}
                          {isContractExpired && <span className="ml-1 text-xs">⚠️</span>}
                        </span>
                      </td>

                      <td className="border border-gray-300 p-2 text-xs">
                        {person.role}
                      </td>

                      <td className="border border-gray-300 p-2">
                        <select
                          value={hasSinContrato ? '' : (callTimes[person.id] || '')}
                          onChange={(e) => {
                            const time = e.target.value;
                            const newCallTimes = { ...callTimes, [person.id]: time };
                            setCallTimes(newCallTimes);

                            // 🚨 PILAR 1: Marcar este callTime como MANUAL (ley suprema)
                            const newManualCallTimes = { ...manualCallTimes, [person.id]: true };
                            setManualCallTimes(newManualCallTimes);

                            console.log(`⏰ [CALLTIME MANUAL] ${person.name} → ${time} (marcado como manual, inmune a regeneración)`);

                            // Si es "Seleccionar..." o "--:--" (Sin llamado), limpiar TODAS las asignaciones
                            if (time === '' || time === '--:--') {
                              const newAssignments = { ...assignments };
                              const newManualAssignments = { ...manualAssignments };

                              programs.forEach(program => {
                                const key = `${person.id}_${program.id}`;
                                delete newAssignments[key];
                                delete newManualAssignments[key];
                              });

                              setAssignments(newAssignments);
                              setManualAssignments(newManualAssignments);
                              console.log(`🗑️  [CALLTIME] Todas las asignaciones eliminadas para ${person.name}`);
                              return;
                            }

                            // NUEVA LÓGICA: Limpiar asignaciones que empiezan ANTES del nuevo callTime
                            // EXCEPTO las que son manuales (manualAssignments)
                            const newAssignments = { ...assignments };
                            const newManualAssignments = { ...manualAssignments };
                            const callMinutes = timeToMinutes(time);

                            // 🚨 BUSCAR EL TURNO REAL DE ESTA PERSONA para usar su hora de fin exacta
                            const personShift = autoShifts.find(s => s.personnel_id === person.id);
                            let endMinutes;

                            if (personShift && personShift.shift_end) {
                              // Usar la hora de fin real del turno
                              const endTime = personShift.shift_end.substring(0, 5);
                              const [endHour, endMin] = endTime.split(':').map(Number);
                              endMinutes = endHour * 60 + endMin;
                              console.log(`  ⏰ Usando hora de fin real del turno: ${endTime}`);
                            } else {
                              // Fallback: asumir 8 horas si no encontramos el turno
                              endMinutes = callMinutes + (8 * 60);
                              console.log(`  ⚠️  No se encontró turno, usando 8 horas por defecto`);
                            }

                            programs.forEach(program => {
                              const key = `${person.id}_${program.id}`;

                              // Obtener hora de inicio y fin del programa
                              const programTime = program.defaultTime || program.time || '';
                              const timeParts = programTime.split('-');
                              const programStartTime = timeParts[0].trim();

                              let programEndTime;
                              if (timeParts.length > 1) {
                                programEndTime = timeParts[1].trim();
                              } else {
                                // Asumir 1 hora si no hay hora de fin
                                const [h, m] = programStartTime.split(':').map(Number);
                                const endM = h * 60 + m + 60;
                                programEndTime = `${String(Math.floor(endM / 60)).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;
                              }

                              const programStartMinutes = timeToMinutes(programStartTime);
                              const programEndMinutes = timeToMinutes(programEndTime);

                              // 🚨 LÓGICA DE CONTENCIÓN ESTRICTA
                              // REGLA: El programa DEBE estar COMPLETAMENTE dentro del turno del trabajador
                              // FÓRMULA: (programStartMinutes >= callMinutes) && (programEndMinutes <= endMinutes)
                              const hasOverlap = (programStartMinutes >= callMinutes) && (programEndMinutes <= endMinutes);

                              if (!newManualAssignments[key]) {
                                // NO es manual: aplicar lógica de solapamiento
                                if (hasOverlap) {
                                  // Hay solapamiento: ASIGNAR
                                  newAssignments[key] = true;
                                  console.log(`  ✅ Asignando ${program.name} (${programStartTime}-${programEndTime}) - solapa con turno ${time}-${`${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`}`);
                                } else {
                                  // NO hay solapamiento: ELIMINAR si existe
                                  if (newAssignments[key]) {
                                    delete newAssignments[key];
                                    console.log(`  🧹 Eliminando ${program.name} (${programStartTime}-${programEndTime}) - NO solapa con turno`);
                                  }
                                }
                              } else {
                                // ES manual: RESPETAR (no tocar)
                                console.log(`  🔧 Manteniendo ${program.name} (${programStartTime}) - asignación manual`);
                              }
                            });

                            setAssignments(newAssignments);
                            console.log(`✅ [CALLTIME] Procesamiento completado para ${person.name}`);
                          }}
                          className="w-full text-center border-none bg-transparent"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="--:--">--:-- (Sin llamado)</option>
                          <option value="05:00">05:00</option>
                          <option value="06:00">06:00</option>
                          <option value="07:00">07:00</option>
                          <option value="08:00">08:00</option>
                          <option value="09:00">09:00</option>
                          <option value="10:00">10:00</option>
                          <option value="11:00">11:00</option>
                          <option value="12:00">12:00</option>
                          <option value="13:00">13:00</option>
                          <option value="14:00">14:00</option>
                          <option value="15:00">15:00</option>
                          <option value="16:00">16:00</option>
                          <option value="17:00">17:00</option>
                          <option value="18:00">18:00</option>
                          <option value="19:00">19:00</option>
                          <option value="20:00">20:00</option>
                          <option value="21:00">21:00</option>
                          <option value="22:00">22:00</option>
                        </select>
                      </td>

                      {/* 🆕 COLUMNA HORA FIN - Automática desde turno, editable manualmente */}
                      <td className="border border-gray-300 p-2">
                        <select
                          value={hasSinContrato ? '' : (endTimes[person.id] || '')}
                          onChange={(e) => {
                            const time = e.target.value;
                            const newEndTimes = { ...endTimes, [person.id]: time };
                            setEndTimes(newEndTimes);

                            // Marcar como manual para preservar en futuras regeneraciones
                            const newManualEndTimes = { ...manualEndTimes, [person.id]: true };
                            setManualEndTimes(newManualEndTimes);

                            console.log(`⏰ [HORA FIN MANUAL] ${person.name} → ${time} (preservada en regeneraciones)`);
                          }}
                          className={`w-full text-center border-none bg-transparent ${manualEndTimes[person.id] ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}
                          disabled={hasSinContrato}
                          title={manualEndTimes[person.id] ? 'Hora de fin manual (preservada)' : 'Hora de fin automática desde turno'}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="--:--">--:-- (Sin fin)</option>
                          <option value="00:00">00:00</option>
                          <option value="01:00">01:00</option>
                          <option value="02:00">02:00</option>
                          <option value="03:00">03:00</option>
                          <option value="04:00">04:00</option>
                          <option value="05:00">05:00</option>
                          <option value="06:00">06:00</option>
                          <option value="07:00">07:00</option>
                          <option value="08:00">08:00</option>
                          <option value="09:00">09:00</option>
                          <option value="10:00">10:00</option>
                          <option value="11:00">11:00</option>
                          <option value="12:00">12:00</option>
                          <option value="13:00">13:00</option>
                          <option value="14:00">14:00</option>
                          <option value="15:00">15:00</option>
                          <option value="16:00">16:00</option>
                          <option value="17:00">17:00</option>
                          <option value="18:00">18:00</option>
                          <option value="19:00">19:00</option>
                          <option value="20:00">20:00</option>
                          <option value="21:00">21:00</option>
                          <option value="22:00">22:00</option>
                          <option value="23:00">23:00</option>
                        </select>
                      </td>

                      {programs.map(program => {
                        const key = `${person.id}_${program.id}`;
                        const isAssigned = assignments[key];
                        const isEditing = editingCell === key;

                        // FILTRO POR CALLTIME: Verificar si este programa debe mostrarse
                        // basándose en la hora de llamado del trabajador
                        const shouldShow = shouldShowProgram(person.id, program.id, program);

                        // Buscar novedad del día para este empleado
                        const todayNovelty = novelties?.find(n => {
                          if (Number(n.personnel_id) !== Number(person.id)) return false;

                          // Crear fecha en formato local para evitar problemas de zona horaria
                          const today = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                          // Si tiene start_date y end_date, verificar si hoy está en el rango
                          if (n.start_date && n.end_date) {
                            const startStr = n.start_date.split('T')[0];
                            const endStr = n.end_date.split('T')[0];
                            return todayStr >= startStr && todayStr <= endStr;
                          }

                          // Si solo tiene date (formato antiguo), comparar directamente
                          if (n.date) {
                            return n.date.split('T')[0] === todayStr;
                          }

                          return false;
                        });

                        let cellText = '';
                        let bgColor = '#FFFFFF';
                        let textColor = '#000000';
                        let isSinContrato = false;

                        if (todayNovelty) {
                          // Verificar si la novedad es "SIN_CONTRATO"
                          if (todayNovelty.type === 'SIN_CONTRATO') {
                            // Si es sin contrato, dejar todo en blanco
                            cellText = '';
                            bgColor = '#FFFFFF';
                            textColor = '#000000';
                            isSinContrato = true;
                          } else if (todayNovelty.type === 'VIAJE') {
                            // Si es viaje, color Amarillo intenso
                            cellText = todayNovelty.description || todayNovelty.type;
                            bgColor = '#e9f907ff'; // Amarillo intenso
                            textColor = '#FFFFFF';
                          } else {
                            // Para otras novedades, mostrar la descripción o tipo
                            cellText = todayNovelty.description || todayNovelty.type;
                            bgColor = '#EF4444'; // Rojo para novedades
                            textColor = '#FFFFFF';
                          }
                        } else if (isAssigned) {
                          // IMPORTANTE: Si hay una asignación guardada, SIEMPRE mostrarla
                          // Las asignaciones guardadas en BD son la verdad absoluta

                          // Si hay nota personalizada, usarla
                          if (assignmentNotes[key]) {
                            cellText = assignmentNotes[key];
                          } else {
                            // Clasificar al personal según su cargo
                            const personnelGroup = classifyPersonnel(person.role);

                            // Obtener el mapeo del programa desde localStorage
                            const programMapping = programMappings[program.id];

                            // Obtener el recurso según el grupo del personal
                            const resource = getResourceForPersonnel(programMapping, personnelGroup);

                            // Construir el texto de la celda - solo mostrar el recurso
                            if (resource) {
                              cellText = resource;
                            } else {
                              // Si no hay recurso asignado, mostrar el nombre del programa
                              cellText = program.name;
                            }
                          }
                          bgColor = '#f1410cff'; // Naranja
                          textColor = '#FFFFFF';
                        }

                        return (
                          <td
                            key={program.id}
                            className="border border-gray-300 p-1 transition-colors"
                            style={{ backgroundColor: bgColor, color: textColor }}
                          >
                            {isEditing ? (
                              <input
                                type="text"
                                value={assignmentNotes[key] || 'ASIGNADO'}
                                onChange={(e) => {
                                  setAssignmentNotes({
                                    ...assignmentNotes,
                                    [key]: e.target.value
                                  });
                                }}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setEditingCell(null);
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingCell(null);
                                  }
                                }}
                                className="w-full text-xs text-center font-semibold bg-orange-500 text-white border-none outline-none px-1"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <div
                                className={`relative group min-h-[24px] flex items-center justify-center ${!isSinContrato ? 'cursor-pointer' : ''}`}
                                onClick={(e) => {
                                  // No permitir clicks si es sin contrato
                                  if (isSinContrato) return;

                                  if (!todayNovelty) {
                                    if (isAssigned) {
                                      // Si ya está asignado, editar texto
                                      setEditingCell(key);
                                      e.stopPropagation();
                                    } else {
                                      // Si no está asignado, toggle assignment
                                      toggleAssignment(person.id, program.id);
                                    }
                                  }
                                }}
                                onDoubleClick={(e) => {
                                  // No permitir doble click si es sin contrato
                                  if (isSinContrato) return;

                                  if (!todayNovelty && isAssigned) {
                                    // Doble click para desasignar
                                    toggleAssignment(person.id, program.id);
                                    // Limpiar la nota personalizada
                                    const newNotes = { ...assignmentNotes };
                                    delete newNotes[key];
                                    setAssignmentNotes(newNotes);
                                    e.stopPropagation();
                                  }
                                }}
                              >
                                {cellText ? (
                                  <div className="text-xs text-center font-semibold flex items-center justify-center gap-1">
                                    {cellText}
                                    {isAssigned && !todayNovelty && !isSinContrato && (
                                      <>
                                        <Edit2 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Trash2
                                          size={10}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-300 hover:text-red-500 cursor-pointer ml-1"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleAssignment(person.id, program.id);
                                            const newNotes = { ...assignmentNotes };
                                            delete newNotes[key];
                                            setAssignmentNotes(newNotes);
                                          }}
                                        />
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  !isSinContrato && (
                                    <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                      Click para asignar
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};


;  // Cierre del componente ScheduleTable
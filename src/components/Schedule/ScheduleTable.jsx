// src/components/Schedule/ScheduleTable.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Download, Edit2, Trash2, Wifi, WifiOff, Camera, RefreshCw } from 'lucide-react';
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
  defaultTime: p.time.split('-')[0].trim(), // Extraer hora de inicio
  color: p.color
}));

// Programas de fin de semana - Importados desde programs.js
const WEEKEND_PROGRAMS = WEEKEND_PROGRAMS_SOURCE.map(p => ({
  id: p.id,
  name: p.name,
  defaultTime: p.time.split('-')[0].trim(), // Extraer hora de inicio
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
  const [manualCallTimes, setManualCallTimes] = useState({}); // 🚨 PILAR 1: CallTimes manuales (ley suprema)
  const [manualAssignments, setManualAssignments] = useState({}); // Asignaciones manuales (excepciones a la regla de callTime)
  const [autoShifts, setAutoShifts] = useState([]);
  const [programMappings, setProgramMappings] = useState({});
  const [loadedFromDB, setLoadedFromDB] = useState(false); // Indica si los datos actuales vienen de BD
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // 🚨 Indica si hay cambios sin guardar
  const isUpdatingFromSocket = useRef(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // 🚨 Refs para detectar cambios REALES (no solo carga de datos)
  const previousAssignments = useRef(null);
  const previousCallTimes = useRef(null);
  const previousManualCallTimes = useRef(null);
  const previousManualAssignments = useRef(null);

  // Memoizar el string de fecha para evitar re-renders
  const dateStr = useMemo(() => {
    return `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  }, [selectedDate]);

  // Helper: Convertir "HH:MM" a minutos desde medianoche
  const timeToMinutes = (timeStr) => {
    if (!timeStr || timeStr === '--:--') return -1;
    const [hours, minutes] = timeStr.split(':').map(Number);
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

  // Configurar sincronización en tiempo real con WebSocket
  // DESACTIVADO temporalmente para evitar que recargue datos y sobrescriba cambios locales
  const { isConnected, error: socketError } = useRealtimeSync(dateStr, {
    onAssignmentCreated: (data) => {
      console.log('🔔 [WEBSOCKET] Evento ignorado - recarga automática desactivada');
      // NO recargar - confiar solo en auto-save
    },
    onAssignmentUpdated: (data) => {
      console.log('🔔 [WEBSOCKET] Evento ignorado - recarga automática desactivada');
      // NO recargar - confiar solo en auto-save
    },
    onAssignmentDeleted: (data) => {
      console.log('🔔 [WEBSOCKET] Evento ignorado - recarga automática desactivada');
      // NO recargar - confiar solo en auto-save
    }
  });

  // Función para cargar schedule desde la BD
  const loadScheduleFromDB = async () => {
    try {
      console.log('🔄 [WEBSOCKET] Recargando datos desde BD...');
      const response = await fetch(`${API_URL}/schedule/daily/${dateStr}`);
      const savedData = await response.json();

      if (savedData.found && savedData.assignments) {
        console.log(`🔄 [WEBSOCKET] Datos recibidos: ${Object.keys(savedData.assignments).length} asignaciones`);
        console.log('🔄 [WEBSOCKET] Primeras 5 keys:', Object.keys(savedData.assignments).slice(0, 5));

        setAssignments(savedData.assignments);

        // 🚨 PILAR 1: RESPETAR callTimes manuales al recibir actualización por WebSocket
        if (savedData.callTimes) {
          setCallTimes(savedData.callTimes);
        }
        if (savedData.manualCallTimes) {
          setManualCallTimes(savedData.manualCallTimes);
        }
        if (savedData.manualAssignments) {
          setManualAssignments(savedData.manualAssignments);
        }

        setLoadedFromDB(true);
        console.log('✅ [WEBSOCKET] Estado actualizado con callTimes manuales preservados');
      }
    } catch (error) {
      console.error('❌ [WEBSOCKET] Error recargando desde BD:', error);
    } finally {
      isUpdatingFromSocket.current = false;
    }
  };

  // EFECTO COMBINADO: Cargar programs Y assignments en el orden correcto
  useEffect(() => {
    let isCancelled = false;

    const loadEverything = async () => {
      // 🧹 LIMPIEZA DE ZOMBIS: Resetear todos los estados al cambiar de día
      // Esto asegura que no queden residuos del día anterior en memoria
      console.log('🧹 [ZOMBIE CLEANUP] Limpiando memoria al cargar nuevo día...');
      setAssignments({});
      setCallTimes({});
      setManualCallTimes({});
      setManualAssignments({});
      setAutoShifts([]);
      setLoadedFromDB(false);
      setHasUnsavedChanges(false); // Importante: nuevo día = sin cambios pendientes

      // Resetear refs de comparación para que el detector NO dispare en la primera carga
      previousAssignments.current = null;
      previousCallTimes.current = null;
      previousManualCallTimes.current = null;
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
        setAutoShifts(shiftsData);

        // NO usar programas de BD - siempre usar programs.js
        console.log('✅ [ScheduleTable] Usando programas de programs.js, NO de BD');

        // PASO 5: Assignments Y CallTimes - de BD o automáticos
        if (savedData.found && savedData.assignments && Object.keys(savedData.assignments).length > 0) {
          // 🚨 REGLA DE ORO: Si hay datos guardados, usarlos TAL CUAL sin modificaciones
          // La rotación automática NO debe ejecutarse sobre datos guardados
          console.log('✅ [ScheduleTable] Asignaciones cargadas desde BD:', Object.keys(savedData.assignments).length, 'assignments');
          console.log('🔑 [ScheduleTable] Primeras 10 keys:', Object.keys(savedData.assignments).slice(0, 10));

          // USAR SIEMPRE los callTimes guardados en BD - NO generarlos desde shifts
          // Los callTimes guardados son la verdad absoluta con cambios manuales del usuario
          const finalCallTimes = savedData.callTimes || {};
          const finalManualCallTimes = savedData.manualCallTimes || {}; // 🚨 PILAR 1: Cargar marcadores de manuales
          const finalManualAssignments = savedData.manualAssignments || {}; // 🚨 PILAR 3: Cargar marcadores de asignaciones manuales

          // 🚨 VALIDACIÓN CRÍTICA: ¿Hay callTimes manuales que difieren de los shifts?
          // Si sí, recalcular asignaciones automáticas con el callTime manual
          // ESTE FILTRO SE APLICA SIEMPRE, INCLUSO PARA EL DÍA HOY
          console.log(`🔍 [VALIDACIÓN HORARIO] Verificando callTimes manuales para ${dateStr}...`);
          console.log(`   📊 Total asignaciones guardadas: ${Object.keys(savedData.assignments).length}`);
          console.log(`   🔒 Total callTimes manuales: ${Object.keys(finalManualCallTimes).length}`);

          const recalculatedAssignments = { ...savedData.assignments };
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

                    // 🚨 LÓGICA DE SOLAPAMIENTO DE COBERTURA
                    // REGLA: Asignar si el trabajador está presente en CUALQUIER MOMENTO del programa
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
            setManualCallTimes(finalManualCallTimes); // 🚨 PILAR 1: Restaurar qué callTimes son manuales
            setManualAssignments(finalManualAssignments); // 🚨 PILAR 3: Restaurar qué asignaciones son manuales
            setAssignments(recalculatedAssignments); // Con recálculo si fue necesario
            setLoadedFromDB(true);
            setIsLoadingSchedule(false);
          }
          return;
        }

        // NO HAY DATOS - Generar CallTimes desde shifts
        const newCallTimes = {};
        shiftsData.forEach(shift => {
          newCallTimes[shift.personnel_id] = shift.shift_start.substring(0, 5);
        });
        setCallTimes(newCallTimes);

        // Generar automáticos
        const newAssignments = {};
        shiftsData.forEach(shift => {
          const time = shift.shift_start.substring(0, 5);
          const endTime = shift.shift_end.substring(0, 5);

          const [startHour, startMin] = time.split(':').map(Number);
          const [endHour, endMin] = endTime.split(':').map(Number);
          const shiftStartMinutes = startHour * 60 + startMin;
          const shiftEndMinutes = endHour * 60 + endMin;

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

            // 🚨 LÓGICA DE SOLAPAMIENTO DE COBERTURA (Regla del Usuario)
            // REGLA: Un programa DEBE asignarse si el trabajador está presente en CUALQUIER MOMENTO de la emisión
            // FÓRMULA: (programStartMinutes < shiftEndMinutes) && (programEndMinutes > shiftStartMinutes)
            //
            // Ejemplos correctos:
            // - Programa 05:00-10:00, Turno 09:00-17:00 → SÍ asignar (trabajador cubre de 09:00 a 10:00)
            // - Programa 12:00-14:00, Turno 13:00-19:00 → SÍ asignar (trabajador cubre de 13:00 a 14:00)
            // - Programa 18:00-20:00, Turno 08:00-16:00 → NO asignar (trabajador no está presente)
            //
            // NO rechazamos programas que empezaron antes del llamado, el trabajador los puede continuar
            const hasOverlap = (progStartMinutes < shiftEndMinutes) && (progEndMinutes > shiftStartMinutes);

            if (hasOverlap) {
              newAssignments[`${shift.personnel_id}_${program.id}`] = true;
            }
          });
        });

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
      previousManualCallTimes.current = JSON.stringify(manualCallTimes);
      previousManualAssignments.current = JSON.stringify(manualAssignments);
      return;
    }

    // Comparar estado actual con snapshot anterior
    const assignmentsChanged = JSON.stringify(assignments) !== previousAssignments.current;
    const callTimesChanged = JSON.stringify(callTimes) !== previousCallTimes.current;
    const manualCallTimesChanged = JSON.stringify(manualCallTimes) !== previousManualCallTimes.current;
    const manualAssignmentsChanged = JSON.stringify(manualAssignments) !== previousManualAssignments.current;

    // Si algo cambió de verdad, marcar como sin guardar
    if (assignmentsChanged || callTimesChanged || manualCallTimesChanged || manualAssignmentsChanged) {
      console.log('🔔 [CAMBIOS DETECTADOS]', { assignmentsChanged, callTimesChanged, manualCallTimesChanged, manualAssignmentsChanged });
      setHasUnsavedChanges(true);

      // Actualizar snapshot
      previousAssignments.current = JSON.stringify(assignments);
      previousCallTimes.current = JSON.stringify(callTimes);
      previousManualCallTimes.current = JSON.stringify(manualCallTimes);
      previousManualAssignments.current = JSON.stringify(manualAssignments);
    }
  }, [assignments, callTimes, manualCallTimes, manualAssignments, isLoadingSchedule]);

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
        manualCallTimes: Object.keys(manualCallTimes).length,
        manualAssignments: Object.keys(manualAssignments).length,
        programs: programs.length
      });

      const response = await fetch(`${API_URL}/schedule/daily/${dateStr}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignments: simpleAssignments,
          callTimes,
          manualCallTimes,
          manualAssignments,
          programs,
          shifts: autoShifts
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`✅ [GUARDADO MANUAL] Guardado exitoso para ${dateStr}`);
        setLastSaved(new Date());
        setHasUnsavedChanges(false); // Marcar como guardado
        alert('✅ Jornada guardada exitosamente');
      } else {
        console.error(`❌ [GUARDADO MANUAL] Error del servidor:`, result);
        alert(`❌ Error al guardar: ${result.error || 'Error desconocido'}`);
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

  // Función simple de guardado inmediato
  const saveSchedule = async (assignmentsToSave, callTimesToSave) => {
    try {
      const simpleAssignments = {};
      Object.keys(assignmentsToSave).forEach(key => {
        if (assignmentsToSave[key]) {
          simpleAssignments[key] = true;
        }
      });

      await fetch(`${API_URL}/schedule/daily/${dateStr}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignments: simpleAssignments,
          callTimes: callTimesToSave,
          programs,
          shifts: autoShifts
        })
      });
    } catch (error) {
      console.error('Error guardando:', error);
    }
  };

  const handleRegenerarTurnos = async () => {
    if (!window.confirm(
      '🔄 REGENERAR TURNOS (PREVIEW DINÁMICO)\n\n' +
      'Esto recalculará los turnos y asignaciones del DÍA ACTUAL con ROTACIÓN DINÁMICA.\n\n' +
      '✅ SE PRESERVAN:\n' +
      '• Asignaciones manuales\n' +
      '• CallTimes manuales\n\n' +
      '🔄 SE RECALCULAN CON LÓGICA ELÁSTICA:\n' +
      '• Conteo automático de empleados por área\n' +
      '• Distribución proporcional usando índice rotativo (i % n)\n' +
      '• Limpieza de asignaciones huérfanas\n' +
      '• Turnos según personal actual\n\n' +
      '💡 Usa el botón "Guardar Jornada" para confirmar los cambios.\n\n' +
      '¿Continuar?'
    )) {
      return;
    }

    setIsRegenerating(true);
    try {
      const fecha = dateStr;

      // 1️⃣ CONSULTAR NUEVOS TURNOS
      const shiftsRes = await fetch(`${API_URL}/schedule/auto-shifts/${fecha}`);
      const newShifts = await shiftsRes.json();

      console.log(`🔄 [REGENERAR DINÁMICO] Turnos obtenidos para ${fecha}:`, newShifts.length);

      // 2️⃣ DETECTAR PERSONAL ACTUAL (IDs que tienen turno hoy)
      const currentPersonnelIds = new Set(newShifts.map(s => s.personnel_id.toString()));
      console.log(`👥 [CONTEO DINÁMICO] Personal activo hoy: ${currentPersonnelIds.size} personas`);

      // 3️⃣ LIMPIEZA DE HUÉRFANOS: Eliminar asignaciones de empleados que ya no existen
      const cleanedAssignments = {};
      const cleanedManualAssignments = {};
      let orphansRemoved = 0;

      Object.keys(assignments).forEach(key => {
        const [personId] = key.split('_');
        if (currentPersonnelIds.has(personId)) {
          cleanedAssignments[key] = assignments[key];
        } else {
          orphansRemoved++;
          console.log(`🧹 [LIMPIEZA HUÉRFANOS] Eliminando asignación de empleado inexistente: ${key}`);
        }
      });

      Object.keys(manualAssignments).forEach(key => {
        const [personId] = key.split('_');
        if (currentPersonnelIds.has(personId)) {
          cleanedManualAssignments[key] = manualAssignments[key];
        } else {
          console.log(`🧹 [LIMPIEZA HUÉRFANOS] Eliminando manual de empleado inexistente: ${key}`);
        }
      });

      console.log(`✅ [LIMPIEZA] ${orphansRemoved} asignaciones huérfanas eliminadas`);

      // 4️⃣ RECALCULAR CALLTIMES (preservando manuales)
      const newCallTimes = {};
      newShifts.forEach(shift => {
        const personId = shift.personnel_id.toString();
        if (manualCallTimes[personId]) {
          newCallTimes[personId] = callTimes[personId]; // Preservar manual
        } else {
          newCallTimes[personId] = shift.shift_start.substring(0, 5);
        }
      });

      // 5️⃣ AGRUPAR PERSONAL POR ÁREA (para distribución dinámica)
      const personnelByArea = {};
      personnel.forEach(person => {
        if (currentPersonnelIds.has(person.id.toString())) {
          const area = person.area || 'SIN_AREA';
          if (!personnelByArea[area]) {
            personnelByArea[area] = [];
          }
          personnelByArea[area].push({
            id: person.id.toString(),
            name: person.name,
            shift: newShifts.find(s => s.personnel_id === person.id)
          });
        }
      });

      console.log('📊 [DISTRIBUCIÓN POR ÁREA]');
      Object.keys(personnelByArea).forEach(area => {
        console.log(`   ${area}: ${personnelByArea[area].length} empleados`);
      });

      // 6️⃣ DISTRIBUCIÓN DINÁMICA CON ÍNDICE ROTATIVO
      const newAssignments = {};
      let manualesPreservadas = 0;
      let automaticasRecalculadas = 0;

      // Preservar asignaciones manuales (de empleados que aún existen)
      Object.keys(cleanedManualAssignments).forEach(key => {
        if (cleanedManualAssignments[key]) {
          newAssignments[key] = cleanedAssignments[key] || true;
          manualesPreservadas++;
        }
      });

      // Nota: La distribución se hace por programa, no por área predefinida
      // Cada área procesa todos los programas y asigna según disponibilidad de horario

      // DISTRIBUCIÓN ROTATIVA POR ÁREA (CORREGIDA - FILTRAR ANTES DE ROTAR)
      Object.keys(personnelByArea).forEach(area => {
        const areaPersonnel = personnelByArea[area];
        const n = areaPersonnel.length;

        if (n === 0) return;

        console.log(`🔄 [ROTACIÓN ${area}] Distribuyendo entre ${n} empleados`);

        // Obtener programas relevantes
        const relevantPrograms = programs.filter(program => {
          return true; // Todos los programas para todas las áreas
        });

        // 🚨 CORRECCIÓN CRÍTICA: Contador rotativo POR ÁREA (no por programa global)
        // Este contador solo avanza cuando SE ASIGNA un programa, no cuando se rechaza
        let rotationCounter = 0;

        relevantPrograms.forEach((program) => {
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

          // PASO 1: Encontrar QUÉ empleados PUEDEN trabajar este programa
          const eligibleEmployees = areaPersonnel.filter(person => {
            const personId = person.id;
            const key = `${personId}_${program.id}`;

            // Respetar asignaciones manuales
            if (cleanedManualAssignments[key]) {
              return false; // No considerar para rotación automática
            }

            const shift = person.shift;
            if (!shift) return false;

            const callTime = newCallTimes[personId];
            const callMinutes = timeToMinutes(callTime);
            const endTime = shift.shift_end.substring(0, 5);
            const endMinutes = timeToMinutes(endTime);

            // LÓGICA DE SOLAPAMIENTO DE COBERTURA
            const hasOverlap = (programStartMinutes < endMinutes) && (programEndMinutes > callMinutes);
            return hasOverlap;
          });

          // PASO 2: Si HAY empleados elegibles, asignar ROTATIVAMENTE entre ellos
          if (eligibleEmployees.length > 0) {
            const employeeIndex = rotationCounter % eligibleEmployees.length;
            const assignedPerson = eligibleEmployees[employeeIndex];
            const personId = assignedPerson.id;
            const key = `${personId}_${program.id}`;

            newAssignments[key] = true;
            automaticasRecalculadas++;
            console.log(`  ✅ [ROT ${area}] Programa "${program.name}" (${programStartTime}) → Empleado ${rotationCounter % n} de ${eligibleEmployees.length} elegibles: ${assignedPerson.name}`);

            // AVANZAR contador solo cuando SE ASIGNA
            rotationCounter++;
          } else {
            console.log(`  ⚠️ [ROT ${area}] Programa "${program.name}" (${programStartTime}) → Sin empleados elegibles`);
          }
        });
      });

      console.log(`✅ [DISTRIBUCIÓN COMPLETA] ${manualesPreservadas} manuales, ${automaticasRecalculadas} automáticas`);

      // 7️⃣ ACTUALIZAR ESTADO LOCAL (no guardar en BD)
      setAutoShifts(newShifts);
      setCallTimes(newCallTimes);
      setManualAssignments(cleanedManualAssignments);
      setAssignments(newAssignments);
      setHasUnsavedChanges(true); // ✅ Activar botón de guardar

      alert(
        `✅ REGENERACIÓN DINÁMICA COMPLETADA (PREVIEW)\n\n` +
        `🔢 CONTEO DINÁMICO:\n` +
        `• ${currentPersonnelIds.size} empleados activos\n` +
        `• ${Object.keys(personnelByArea).length} áreas detectadas\n\n` +
        `🧹 LIMPIEZA:\n` +
        `• ${orphansRemoved} asignaciones huérfanas eliminadas\n\n` +
        `📊 DISTRIBUCIÓN:\n` +
        `• ${manualesPreservadas} asignaciones manuales preservadas\n` +
        `• ${automaticasRecalculadas} asignaciones automáticas recalculadas\n\n` +
        `⚠️ CAMBIOS NO GUARDADOS\n` +
        `Usa "Guardar Jornada" para confirmar.`
      );

    } catch (error) {
      console.error('❌ [REGENERAR] Error:', error);
      alert(`❌ Error al regenerar: ${error.message}`);
    } finally {
      setIsRegenerating(false);
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

  const autoAsignarReporteria = () => {
    const newAssignments = { ...assignments };
    const reporteriaPersonnel = personnel.filter(p =>
      p.area === 'CAMARÓGRAFOS DE REPORTERÍA' || p.area === 'ASISTENTES DE REPORTERÍA'
    );

    reporteriaPersonnel.forEach(person => {
      const personCallTime = callTimes[person.id];
      if (!personCallTime) return;

      const [callHour, callMin] = personCallTime.split(':').map(Number);
      const callTimeMinutes = callHour * 60 + callMin;

      programs.forEach(program => {
        const [progHour, progMin] = program.defaultTime.split(':').map(Number);
        const progTimeMinutes = progHour * 60 + progMin;

        let shouldAssign = false;

        if (personCallTime === '08:00') {
          shouldAssign = progTimeMinutes >= 360 && progTimeMinutes < 780;
        } else if (personCallTime === '13:00') {
          shouldAssign = progTimeMinutes >= 780 && progTimeMinutes <= 1290;
        }

        if (shouldAssign) {
          const key = `${person.id}_${program.id}`;
          newAssignments[key] = true;
        }
      });
    });

    setAssignments(newAssignments);
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
          <h2 className="text-lg font-bold text-center flex-1">
            COORDINACIÓN PARA EL CUMPLIMIENTO DE ACTIVIDADES DE RTVC {formatDate(selectedDate)}
          </h2>
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

            <button
              onClick={handleRegenerarTurnos}
              disabled={isRegenerating}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Regenerando...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Regenerar Turnos
                </>
              )}
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
              {programs.map(program => (
                <th key={program.id} className="border border-gray-300 p-2 text-xs font-semibold" style={{ backgroundColor: program.color }}>
                  <div className="text-sm font-bold mb-1">{program.name}</div>
                  <div className="text-xs">{program.defaultTime || program.time || '--:--'}</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedDepts.map(([dept, deptPersonnel]) => {
              // ordenar personal por hora de llamado
              const sortedByTime = [...deptPersonnel].sort((a, b) => {
                const timeA = callTimes[a.id] || '99:99';
                const timeB = callTimes[b.id] || '99:99';
                return timeA.localeCompare(timeB);
              });

              return (
  <React.Fragment key={dept}>
    {/* Encabezado del área */}
    <tr className="bg-blue-800 text-white font-bold">
      <td colSpan={3 + programs.length} className="border border-gray-300 p-2">{dept}</td>
    </tr>

    {/* Encabezado de columnas para esta área */}
    <tr className="bg-blue-700 text-white">
      <th className="border border-gray-300 p-2 sticky left-0 bg-blue-700 z-10">NOMBRE</th>
      <th className="border border-gray-300 p-2">ACTIVIDAD</th>
      <th className="border border-gray-300 p-2">HORA LLAMADO</th>
      {programs.map(program => (
        <th key={program.id} className="border border-gray-300 p-2 text-xs font-semibold" style={{ backgroundColor: program.color }}>
          <div className="text-sm font-bold mb-1">{program.name}</div>
          <div className="text-xs">{program.defaultTime || program.time || '--:--'}</div>
        </th>
      ))}
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

                              // 🚨 LÓGICA DE SOLAPAMIENTO DE COBERTURA
                              // REGLA: Asignar si el trabajador está presente en CUALQUIER MOMENTO del programa
                              // FÓRMULA: (programStartMinutes < endMinutes) && (programEndMinutes > callMinutes)
                              const hasOverlap = (programStartMinutes < endMinutes) && (programEndMinutes > callMinutes);

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
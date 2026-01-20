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
  const [manualAssignments, setManualAssignments] = useState({}); // Asignaciones manuales (excepciones a la regla de callTime)
  const [autoShifts, setAutoShifts] = useState([]);
  const [programMappings, setProgramMappings] = useState({});
  const [loadedFromDB, setLoadedFromDB] = useState(false); // Indica si los datos actuales vienen de BD
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const isUpdatingFromSocket = useRef(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

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
        if (savedData.callTimes) {
          setCallTimes(savedData.callTimes);
        }
        setLoadedFromDB(true);
        console.log('✅ [WEBSOCKET] Estado actualizado');
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
          // Usar las asignaciones guardadas en BD como base
          const finalAssignments = { ...savedData.assignments };

          console.log('✅ [ScheduleTable] Asignaciones cargadas desde BD:', Object.keys(finalAssignments).length, 'assignments');
          console.log('🔑 [ScheduleTable] Primeras 10 keys:', Object.keys(finalAssignments).slice(0, 10));

          // USAR SIEMPRE los callTimes guardados en BD - NO generarlos desde shifts
          // Los callTimes guardados son la verdad absoluta con cambios manuales del usuario
          const finalCallTimes = savedData.callTimes || {};

          // COMPLEMENTAR asignaciones faltantes basándose en callTimes y rangos de programas
          console.log('🔄 [Auto-completar] Verificando asignaciones faltantes según callTimes...');
          let assignmentsAdded = 0;

          personnel.forEach(person => {
            const personCallTime = finalCallTimes[person.id];
            if (!personCallTime || personCallTime === '--:--' || personCallTime === '') return;

            const callMinutes = timeToMinutes(personCallTime);
            const endMinutes = callMinutes + (8 * 60); // 8 horas de turno

            sortedPrograms.forEach(program => {
              const key = `${person.id}_${program.id}`;

              // Si ya existe la asignación, no hacer nada
              if (finalAssignments[key]) return;

              // Obtener hora de inicio del programa
              const programTime = program.defaultTime || program.time || '';
              const programStartTime = programTime.split('-')[0].trim();
              const programMinutes = timeToMinutes(programStartTime);

              // Si el programa está dentro del rango del turno, auto-asignar
              if (programMinutes !== -1 && callMinutes !== -1 &&
                  programMinutes >= callMinutes && programMinutes < endMinutes) {
                finalAssignments[key] = true;
                assignmentsAdded++;
                console.log(`  ✅ Auto-agregando ${person.name} → ${program.name} (${programStartTime})`);
              }
            });
          });

          if (assignmentsAdded > 0) {
            console.log(`🎯 [Auto-completar] ${assignmentsAdded} asignaciones agregadas automáticamente`);
          }

          if (!isCancelled) {
            setCallTimes(finalCallTimes);
            setAssignments(finalAssignments);
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

            const overlaps = shiftStartMinutes < progEndMinutes && shiftEndMinutes > progStartMinutes;

            if (overlaps) {
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

  // AUTO-GUARDADO con DEBOUNCE: Guarda automáticamente 1 segundo después del último cambio
  useEffect(() => {
    // No guardar si está cargando datos
    if (isLoadingSchedule) {
      return;
    }

    // No guardar si la actualización viene del socket
    if (isUpdatingFromSocket.current) {
      return;
    }

    // No guardar en el primer render
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);

      try {
        // Convertir assignments al formato simple (true/false) antes de guardar
        // IMPORTANTE: Solo incluir asignaciones que están activas (true)
        // Las asignaciones false se eliminan completamente del objeto
        const simpleAssignments = {};
        Object.keys(assignments).forEach(key => {
          if (assignments[key]) {
            simpleAssignments[key] = true;
          }
        });

        console.log(`💾 [AUTO-SAVE] Guardando ${dateStr}:`, {
          assignments: Object.keys(simpleAssignments).length,
          callTimes: Object.keys(callTimes).length,
          programs: programs.length
        });

        const response = await fetch(`${API_URL}/schedule/daily/${dateStr}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignments: simpleAssignments,
            callTimes,
            programs,
            shifts: autoShifts
          })
        });

        const result = await response.json();

        if (response.ok) {
          console.log(`✅ [AUTO-SAVE] Guardado exitoso para ${dateStr}`);
          setLastSaved(new Date());
        } else {
          console.error(`❌ [AUTO-SAVE] Error del servidor:`, result);
        }
      } catch (error) {
        console.error('❌ [AUTO-SAVE] Error de red:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [assignments, callTimes, programs, autoShifts, dateStr]);

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
      '🔄 ¿Regenerar turnos del mes?\n\n' +
      'Esta función actualiza SOLO los turnos y llamados según el personal actual.\n\n' +
      '✅ SE PRESERVAN:\n' +
      '• Todos tus programas (incluyendo eliminados)\n' +
      '• Todas las asignaciones manuales\n' +
      '• Todos tus cambios personalizados\n\n' +
      '🔄 SE ACTUALIZAN:\n' +
      '• Turnos reorganizados según nuevo personal\n' +
      '• Llamados ajustados a las nuevas rotaciones\n\n' +
      '💡 Úsalo cuando agregues nuevo personal para que el sistema\n' +
      'redistribuya automáticamente los turnos.\n\n' +
      '¿Continuar?'
    )) {
      return;
    }

    setIsRegenerating(true);
    try {
      const mes = selectedDate.getMonth() + 1;
      const anio = selectedDate.getFullYear();

      const response = await fetch(`${API_URL}/schedule/regenerar-turnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mes, anio })
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          `✅ ${result.message}\n\n` +
          `Días actualizados: ${result.diasActualizados}\n` +
          `Período: ${result.periodo}\n\n` +
          `${result.nota}`
        );
        window.location.reload();
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Error de red: ${error.message}`);
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
      {/* WeekSelector flotante */}
      {showWeekSelector && weekSelectorProps && (
        <WeekSelector {...weekSelectorProps} />
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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

            {lastSaved && !isSaving && (
              <div className="text-xs text-blue-200">
                Guardado: {lastSaved.toLocaleTimeString()}
              </div>
            )}

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

                            console.log(`⏰ [CALLTIME] Cambiando hora de llamado de ${person.name} a ${time}`);

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

                            // Calcular hora de fin basada en turno de 8 horas
                            const endMinutes = callMinutes + (8 * 60); // 8 horas después

                            programs.forEach(program => {
                              const key = `${person.id}_${program.id}`;

                              // Obtener hora de inicio del programa
                              const programTime = program.defaultTime || program.time || '';
                              const programStartTime = programTime.split('-')[0].trim();
                              const programMinutes = timeToMinutes(programStartTime);

                              // Si el programa empieza ANTES del llamado Y NO es manual, eliminarlo
                              if (programMinutes !== -1 && callMinutes !== -1 && programMinutes < callMinutes) {
                                if (!newManualAssignments[key]) {
                                  // No es manual, eliminar la asignación
                                  if (newAssignments[key]) {
                                    console.log(`  🧹 Eliminando ${program.name} (${programStartTime}) - antes de callTime ${time}`);
                                    delete newAssignments[key];
                                  }
                                } else {
                                  console.log(`  🔧 Manteniendo ${program.name} (${programStartTime}) - asignación manual`);
                                }
                              }

                              // Si el programa empieza DESPUÉS de la hora de fin del turno Y NO es manual, eliminarlo
                              if (programMinutes !== -1 && endMinutes !== -1 && programMinutes >= endMinutes) {
                                if (!newManualAssignments[key]) {
                                  // No es manual, eliminar la asignación
                                  if (newAssignments[key]) {
                                    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
                                    console.log(`  🧹 Eliminando ${program.name} (${programStartTime}) - después del turno (${endTime})`);
                                    delete newAssignments[key];
                                  }
                                } else {
                                  console.log(`  🔧 Manteniendo ${program.name} (${programStartTime}) - asignación manual`);
                                }
                              }

                              // Si el programa está DENTRO del rango del turno, asignarlo automáticamente
                              if (programMinutes !== -1 && callMinutes !== -1 &&
                                  programMinutes >= callMinutes && programMinutes < endMinutes) {
                                // Solo auto-asignar si no es una desasignación manual
                                if (!newManualAssignments[key] || newManualAssignments[key] === true) {
                                  newAssignments[key] = true;
                                  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
                                  console.log(`  ✅ Auto-asignando ${program.name} (${programStartTime}) - dentro del turno ${time}-${endTime}`);
                                }
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
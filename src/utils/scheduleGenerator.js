// src/utils/scheduleGenerator.js
import { calculateWeekShift } from '../data/shifts';
import { getWeekNumber } from './dateUtils';

/**
 * Valida si el contrato de una persona está vigente en una fecha específica
 * Esta función actúa como capa de validación externa
 */
const isContractValid = (person, dateStr) => {
  if (!person.contract_end) {
    // Sin fecha de fin = contrato indefinido
    return true;
  }

  // Parsear fecha de fin de contrato (sin timezone)
  const [year, month, day] = person.contract_end.split('T')[0].split('-');
  const contractEndDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  contractEndDate.setHours(0, 0, 0, 0);

  // Parsear fecha a validar
  const [checkYear, checkMonth, checkDay] = dateStr.split('-');
  const checkDate = new Date(parseInt(checkYear), parseInt(checkMonth) - 1, parseInt(checkDay));
  checkDate.setHours(0, 0, 0, 0);

  // Contrato válido si la fecha es menor o igual a la fecha de fin
  return checkDate <= contractEndDate;
};

export const generateWeeklySchedule = (personnel, startDate, novelties = {}) => {
  const schedule = {};
  const weekNum = getWeekNumber(startDate);

  personnel.forEach(person => {
    // Calcular turno basado en rotación semanal
    const weekShift = calculateWeekShift(person.current_shift, weekNum);

    // Generar programación para cada día de la semana
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Verificar si hay novedades para esta persona en esta fecha
      const noveltyKey = `${person.id}-${dateStr}`;
      const hasNovelty = novelties[noveltyKey];

      if (!schedule[dateStr]) {
        schedule[dateStr] = {};
      }

      if (!schedule[dateStr][person.area]) {
        schedule[dateStr][person.area] = [];
      }

      // **VALIDACIÓN DE CONTRATO (Capa Externa)**
      // Verificar si el contrato está vencido en esta fecha
      const contractValid = isContractValid(person, dateStr);

      // Determinar disponibilidad según tipo de novedad
      let available = true;
      let status = 'normal'; // normal, viaje, sin_llamado

      // Verificar novedades (la programación sigue funcionando con contrato vencido)
      if (hasNovelty) {
        // Si es VIAJE, marcar programación como ocupada (rellenar)
        if (hasNovelty.type === 'VIAJE') {
          available = false;
          status = 'viaje';
        }
        // Para otras novedades, marcar como "Sin llamado"
        else {
          available = false;
          status = 'sin_llamado';
        }
      }

      schedule[dateStr][person.area].push({
        personnel: person,
        shift: weekShift,
        novelty: hasNovelty || null,
        available,
        status,
        contractExpired: !contractValid // Flag para mostrar alerta visual (NO afecta la programación)
      });
    }
  });

  return schedule;
};

export const assignPrograms = (schedule, programs, date) => {
  // Lógica para asignar programas específicos a personal
  // basado en sus turnos y disponibilidad
  const assignments = {};
  
  programs.forEach(program => {
    const programTime = program.time.split('-')[0];
    // Encontrar personal disponible para ese horario
    // ...lógica de asignación
  });
  
  return assignments;
};

export const optimizeSchedule = (schedule) => {
  // Algoritmo para optimizar la distribución de personal
  // considerando carga de trabajo, descansos, etc.
  return schedule;
};

export const validateSchedule = (schedule) => {
  const errors = [];
  const warnings = [];
  
  // Validar que cada área tenga el mínimo de personal
  // Validar que no haya conflictos de horarios
  // Validar que se respeten las novedades
  
  return { valid: errors.length === 0, errors, warnings };
};

export const exportScheduleToCSV = (schedule) => {
  let csv = 'Fecha,Área,Nombre,Rol,Turno,Programa,Ubicación,Novedad\n';
  
  Object.keys(schedule).forEach(date => {
    Object.keys(schedule[date]).forEach(area => {
      schedule[date][area].forEach(entry => {
        csv += `${date},${area},${entry.personnel.name},${entry.personnel.role},`;
        csv += `${entry.shift},${entry.program || ''},${entry.location || ''},`;
        csv += `${entry.novelty ? entry.novelty.type: ''}\n`;
      });
    });
  });
  
  return csv;
};

export const exportScheduleToJSON = (schedule) => {
  return JSON.stringify(schedule, null, 2);
};

export const compareSchedules = (schedule1, schedule2) => {
  const differences = [];
  
  Object.keys(schedule1).forEach(date => {
    if (!schedule2[date]) {
      differences.push({
        type: 'DATE_MISSING',
        date,
        message: `Fecha ${date} no existe en el segundo horario`
      });
      return;
    }
    
    Object.keys(schedule1[date]).forEach(area => {
      if (!schedule2[date][area]) {
        differences.push({
          type: 'AREA_MISSING',
          date,
          area,
          message: `Área ${area} no existe en la fecha ${date} del segundo horario`
        });
        return;
      }
      
      // Comparar personal asignado
      schedule1[date][area].forEach(entry1 => {
        const entry2 = schedule2[date][area].find(
          e => e.personnel.id === entry1.personnel.id
        );
        
        if (!entry2) {
          differences.push({
            type: 'PERSON_MISSING',
            date,
            area,
            person: entry1.personnel.name,
            message: `${entry1.personnel.name} no está en el segundo horario`
          });
        } else if (entry1.shift !== entry2.shift) {
          differences.push({
            type: 'SHIFT_CHANGED',
            date,
            area,
            person: entry1.personnel.name,
            from: entry1.shift,
            to: entry2.shift
          });
        }
      });
    });
  });
  
  return differences;
};

export const getScheduleStats = (schedule) => {
  const stats = {
    totalDays: Object.keys(schedule).length,
    totalAssignments: 0,
    byArea: {},
    byShift: {},
    withNovelties: 0
  };
  
  Object.values(schedule).forEach(day => {
    Object.keys(day).forEach(area => {
      if (!stats.byArea[area]) {
        stats.byArea[area] = 0;
      }
      stats.byArea[area] += day[area].length;
      stats.totalAssignments += day[area].length;
      
      day[area].forEach(entry => {
        if (!stats.byShift[entry.shift]) {
          stats.byShift[entry.shift] = 0;
        }
        stats.byShift[entry.shift]++;
        
        if (entry.novelty) {
          stats.withNovelties++;
        }
      });
    });
  });
  
  return stats;
};
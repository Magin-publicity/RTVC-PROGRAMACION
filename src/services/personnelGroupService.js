// src/services/personnelGroupService.js
// Servicio para gestionar grupos personalizados de personal por semana

/**
 * Obtiene la clave de semana en formato YYYY-WW
 */
function getWeekKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();

  // Calcular número de semana ISO
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * Obtiene los grupos personalizados para una semana específica y área
 * @param {Date} date - Fecha de la semana
 * @param {string} area - Nombre del área
 * @returns {Object} Objeto con personId: grupoNumber
 */
export function getWeeklyGroups(date, area) {
  try {
    const weekKey = getWeekKey(date);
    const storageKey = `weekly_groups_${weekKey}_${area}`;
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error al leer grupos semanales:', error);
    return {};
  }
}

/**
 * Guarda el grupo de una persona para una semana específica
 * @param {Date} date - Fecha de la semana
 * @param {string} area - Nombre del área
 * @param {number} personId - ID de la persona
 * @param {number} groupNumber - Número de grupo (1-4)
 */
export function setPersonWeeklyGroup(date, area, personId, groupNumber) {
  try {
    const weekKey = getWeekKey(date);
    const storageKey = `weekly_groups_${weekKey}_${area}`;

    const currentGroups = getWeeklyGroups(date, area);
    currentGroups[personId] = groupNumber;

    localStorage.setItem(storageKey, JSON.stringify(currentGroups));
    console.log(`✅ Grupo actualizado: ${personId} → Grupo ${groupNumber} (Semana ${weekKey})`);

    return true;
  } catch (error) {
    console.error('Error al guardar grupo semanal:', error);
    return false;
  }
}

/**
 * Cambia el grupo de múltiples personas a la vez
 * @param {Date} date - Fecha de la semana
 * @param {string} area - Nombre del área
 * @param {Array<number>} personIds - Array de IDs de personas
 * @param {number} groupNumber - Número de grupo (1-4)
 */
export function setBulkWeeklyGroups(date, area, personIds, groupNumber) {
  try {
    const weekKey = getWeekKey(date);
    const storageKey = `weekly_groups_${weekKey}_${area}`;

    const currentGroups = getWeeklyGroups(date, area);

    personIds.forEach(personId => {
      currentGroups[personId] = groupNumber;
    });

    localStorage.setItem(storageKey, JSON.stringify(currentGroups));
    console.log(`✅ Grupos actualizados en bloque: ${personIds.length} personas → Grupo ${groupNumber} (Semana ${weekKey})`);

    return true;
  } catch (error) {
    console.error('Error al guardar grupos en bloque:', error);
    return false;
  }
}

/**
 * Elimina el grupo personalizado de una persona (vuelve al grupo por defecto)
 * @param {Date} date - Fecha de la semana
 * @param {string} area - Nombre del área
 * @param {number} personId - ID de la persona
 */
export function removePersonWeeklyGroup(date, area, personId) {
  try {
    const weekKey = getWeekKey(date);
    const storageKey = `weekly_groups_${weekKey}_${area}`;

    const currentGroups = getWeeklyGroups(date, area);
    delete currentGroups[personId];

    localStorage.setItem(storageKey, JSON.stringify(currentGroups));
    console.log(`✅ Grupo personalizado eliminado: ${personId} (Semana ${weekKey})`);

    return true;
  } catch (error) {
    console.error('Error al eliminar grupo semanal:', error);
    return false;
  }
}

/**
 * Limpia todos los grupos personalizados de una semana específica
 * @param {Date} date - Fecha de la semana
 * @param {string} area - Nombre del área (opcional, si no se pasa limpia todas las áreas)
 */
export function clearWeeklyGroups(date, area = null) {
  try {
    const weekKey = getWeekKey(date);

    if (area) {
      const storageKey = `weekly_groups_${weekKey}_${area}`;
      localStorage.removeItem(storageKey);
      console.log(`✅ Grupos semanales limpiados: ${area} (Semana ${weekKey})`);
    } else {
      // Limpiar todas las áreas de la semana
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`weekly_groups_${weekKey}_`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`✅ Grupos semanales limpiados: todas las áreas (Semana ${weekKey})`);
    }

    return true;
  } catch (error) {
    console.error('Error al limpiar grupos semanales:', error);
    return false;
  }
}

/**
 * Obtiene el grupo por defecto basado en la posición
 * @param {string} area - Nombre del área
 * @param {number} personIndex - Índice de la persona en la lista (0-based)
 * @returns {number|null} Número de grupo o null si no aplica
 */
export function getDefaultGroup(area, personIndex) {
  // Usar numeración consecutiva para todas las áreas (sin grupos)
  return null;
}

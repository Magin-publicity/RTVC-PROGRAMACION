// src/services/scheduleHistoryService.js

const STORAGE_KEY = 'rtvc_schedule_history';

/**
 * Servicio para gestionar el historial de programación por fecha
 */
export const scheduleHistoryService = {
  /**
   * Guarda la programación de un día específico
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @param {Object} scheduleData - Datos de la programación del día
   */
  saveDay(date, scheduleData) {
    try {
      const history = this.getAll();

      history[date] = {
        date,
        programs: scheduleData.programs,
        assignments: scheduleData.assignments,
        shifts: scheduleData.shifts,
        savedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Error al guardar historial de programación:', error);
      return false;
    }
  },

  /**
   * Obtiene la programación de un día específico
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @returns {Object|null} - Datos de la programación o null si no existe
   */
  getDay(date) {
    try {
      const history = this.getAll();
      return history[date] || null;
    } catch (error) {
      console.error('Error al obtener historial de programación:', error);
      return null;
    }
  },

  /**
   * Obtiene todo el historial
   * @returns {Object} - Objeto con todas las fechas guardadas
   */
  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error al obtener historial completo:', error);
      return {};
    }
  },

  /**
   * Obtiene las fechas que tienen historial guardado
   * @returns {Array} - Array de fechas en formato YYYY-MM-DD
   */
  getSavedDates() {
    try {
      const history = this.getAll();
      return Object.keys(history).sort();
    } catch (error) {
      console.error('Error al obtener fechas guardadas:', error);
      return [];
    }
  },

  /**
   * Elimina el historial de un día específico
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @returns {boolean} - true si se eliminó correctamente
   */
  deleteDay(date) {
    try {
      const history = this.getAll();
      delete history[date];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Error al eliminar historial:', error);
      return false;
    }
  },

  /**
   * Limpia todo el historial
   * @returns {boolean} - true si se limpió correctamente
   */
  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error al limpiar historial:', error);
      return false;
    }
  },

  /**
   * Obtiene estadísticas del historial
   * @returns {Object} - Estadísticas del historial
   */
  getStats() {
    try {
      const history = this.getAll();
      const dates = Object.keys(history);

      return {
        totalDays: dates.length,
        oldestDate: dates.length > 0 ? dates.sort()[0] : null,
        newestDate: dates.length > 0 ? dates.sort().reverse()[0] : null
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { totalDays: 0, oldestDate: null, newestDate: null };
    }
  }
};

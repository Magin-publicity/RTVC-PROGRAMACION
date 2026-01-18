// src/services/changeLogService.js

const STORAGE_KEY = 'rtvc_change_logs';

/**
 * Servicio para registrar todos los cambios en la programación
 */
export const changeLogService = {
  /**
   * Registra un cambio en la programación
   * @param {Object} change - Datos del cambio
   * @param {string} change.date - Fecha de la programación (YYYY-MM-DD)
   * @param {string} change.type - Tipo de cambio (assignment, program_time, program_master, program_status)
   * @param {string} change.entity - Entidad afectada (personnel_id, program_id)
   * @param {any} change.previousValue - Valor anterior
   * @param {any} change.newValue - Valor nuevo
   * @param {string} change.user - Usuario que hizo el cambio
   */
  logChange(change) {
    try {
      const logs = this.getAll();

      const logEntry = {
        id: Date.now() + Math.random(), // ID único
        timestamp: new Date().toISOString(),
        date: change.date,
        type: change.type,
        entity: change.entity,
        entityName: change.entityName || '',
        previousValue: change.previousValue,
        newValue: change.newValue,
        user: change.user,
        description: this.generateDescription(change)
      };

      logs.push(logEntry);

      // Mantener solo los últimos 1000 logs para no saturar localStorage
      const limitedLogs = logs.slice(-1000);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedLogs));
      console.log('📝 Log registrado:', logEntry);

      return logEntry;
    } catch (error) {
      console.error('❌ Error registrando cambio:', error);
      return null;
    }
  },

  /**
   * Genera una descripción legible del cambio
   */
  generateDescription(change) {
    const userName = change.user || 'Usuario desconocido';

    switch (change.type) {
      case 'assignment':
        if (change.newValue === true) {
          return `${userName} asignó ${change.entityName} al programa`;
        } else {
          return `${userName} removió la asignación de ${change.entityName} del programa`;
        }

      case 'program_time':
        return `${userName} cambió el horario del programa de "${change.previousValue}" a "${change.newValue}"`;

      case 'program_master':
        const prevMaster = change.previousValue || 'Sin asignar';
        const newMaster = change.newValue || 'Sin asignar';
        return `${userName} cambió el Master del programa de "${prevMaster}" a "${newMaster}"`;

      case 'program_studio':
        const prevStudio = change.previousValue || 'Sin asignar';
        const newStudio = change.newValue || 'Sin asignar';
        return `${userName} cambió el Estudio del programa de "${prevStudio}" a "${newStudio}"`;

      case 'program_status':
        return `${userName} marcó el programa como "${change.newValue}"`;

      case 'program_created':
        return `${userName} creó el programa "${change.entityName}"`;

      case 'program_deleted':
        return `${userName} eliminó el programa "${change.entityName}"`;

      default:
        return `${userName} realizó un cambio en ${change.type}`;
    }
  },

  /**
   * Obtiene todos los logs
   * @returns {Array} - Array de logs
   */
  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener logs:', error);
      return [];
    }
  },

  /**
   * Obtiene logs de una fecha específica
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @returns {Array} - Array de logs de esa fecha
   */
  getByDate(date) {
    try {
      const logs = this.getAll();
      return logs.filter(log => log.date === date);
    } catch (error) {
      console.error('Error al obtener logs por fecha:', error);
      return [];
    }
  },

  /**
   * Obtiene logs de un usuario específico
   * @param {string} user - Nombre del usuario
   * @returns {Array} - Array de logs del usuario
   */
  getByUser(user) {
    try {
      const logs = this.getAll();
      return logs.filter(log => log.user === user);
    } catch (error) {
      console.error('Error al obtener logs por usuario:', error);
      return [];
    }
  },

  /**
   * Obtiene logs de un rango de fechas
   * @param {string} startDate - Fecha inicial (YYYY-MM-DD)
   * @param {string} endDate - Fecha final (YYYY-MM-DD)
   * @returns {Array} - Array de logs en el rango
   */
  getByDateRange(startDate, endDate) {
    try {
      const logs = this.getAll();
      return logs.filter(log => {
        return log.date >= startDate && log.date <= endDate;
      }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error al obtener logs por rango de fechas:', error);
      return [];
    }
  },

  /**
   * Obtiene estadísticas de cambios
   * @returns {Object} - Estadísticas de los logs
   */
  getStats() {
    try {
      const logs = this.getAll();

      const stats = {
        totalChanges: logs.length,
        changesByType: {},
        changesByUser: {},
        changesByDate: {},
        recentChanges: logs.slice(-10).reverse()
      };

      logs.forEach(log => {
        // Por tipo
        stats.changesByType[log.type] = (stats.changesByType[log.type] || 0) + 1;

        // Por usuario
        stats.changesByUser[log.user] = (stats.changesByUser[log.user] || 0) + 1;

        // Por fecha
        stats.changesByDate[log.date] = (stats.changesByDate[log.date] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        totalChanges: 0,
        changesByType: {},
        changesByUser: {},
        changesByDate: {},
        recentChanges: []
      };
    }
  },

  /**
   * Limpia todos los logs
   * @returns {boolean} - true si se limpió correctamente
   */
  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error al limpiar logs:', error);
      return false;
    }
  },

  /**
   * Limpia logs antiguos (más de 30 días)
   * @returns {number} - Cantidad de logs eliminados
   */
  clearOldLogs() {
    try {
      const logs = this.getAll();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const filteredLogs = logs.filter(log => {
        return new Date(log.timestamp) > thirtyDaysAgo;
      });

      const removedCount = logs.length - filteredLogs.length;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLogs));

      return removedCount;
    } catch (error) {
      console.error('Error al limpiar logs antiguos:', error);
      return 0;
    }
  }
};

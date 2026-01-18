// src/services/programMappingService.js

const STORAGE_KEY = 'rtvc_program_mappings';

/**
 * Servicio para gestionar los mapeos de programas a recursos (Estudio/Master)
 */
export const programMappingService = {
  /**
   * Obtiene todos los mapeos de programas
   * @returns {Object} - Objeto con mapeos: { programId: { studioResource: number, masterResource: number } }
   */
  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error al obtener mapeos de programas:', error);
      return {};
    }
  },

  /**
   * Obtiene el mapeo de un programa específico
   * @param {number} programId - ID del programa
   * @returns {Object|null} - Mapeo del programa o null si no existe
   */
  get(programId) {
    const mappings = this.getAll();
    return mappings[programId] || null;
  },

  /**
   * Guarda el mapeo de un programa
   * @param {number} programId - ID del programa
   * @param {Object} mapping - Mapeo { studioResource: number, masterResource: number }
   */
  save(programId, mapping) {
    try {
      const mappings = this.getAll();
      mappings[programId] = {
        studioResource: mapping.studioResource || null,
        masterResource: mapping.masterResource || null,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
      return true;
    } catch (error) {
      console.error('Error al guardar mapeo de programa:', error);
      return false;
    }
  },

  /**
   * Elimina el mapeo de un programa
   * @param {number} programId - ID del programa
   */
  delete(programId) {
    try {
      const mappings = this.getAll();
      delete mappings[programId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
      return true;
    } catch (error) {
      console.error('Error al eliminar mapeo de programa:', error);
      return false;
    }
  },

  /**
   * Limpia todos los mapeos
   */
  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error al limpiar mapeos:', error);
      return false;
    }
  }
};

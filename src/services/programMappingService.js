// src/services/programMappingService.js

const API_URL = '/api/routes/program-mappings';
const STORAGE_KEY = 'rtvc_program_mappings';

/**
 * Servicio para gestionar los mapeos de programas a recursos (Estudio/Master)
 * AHORA USA BASE DE DATOS en lugar de localStorage
 */
export const programMappingService = {
  /**
   * Obtiene todos los mapeos de programas desde la base de datos
   * @returns {Promise<Object>} - Objeto con mapeos: { programId: { studioResource: number, masterResource: number } }
   */
  async getAll() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const mappings = await response.json();
      return mappings;
    } catch (error) {
      console.error('Error al obtener mapeos de programas desde BD:', error);
      // Fallback a localStorage si falla la BD
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
      } catch (localError) {
        console.error('Error al obtener mapeos desde localStorage:', localError);
        return {};
      }
    }
  },

  /**
   * Obtiene el mapeo de un programa específico
   * @param {number} programId - ID del programa
   * @returns {Promise<Object|null>} - Mapeo del programa o null si no existe
   */
  async get(programId) {
    const mappings = await this.getAll();
    return mappings[programId] || null;
  },

  /**
   * Guarda el mapeo de un programa en la base de datos
   * @param {number} programId - ID del programa
   * @param {Object} mapping - Mapeo { studioResource: number, masterResource: number }
   * @returns {Promise<boolean>} - true si se guardó exitosamente
   */
  async save(programId, mapping) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          programId: parseInt(programId),
          studioResource: mapping.studioResource || null,
          masterResource: mapping.masterResource || null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Asignación guardada en BD:', programId, result);
      return true;
    } catch (error) {
      console.error('Error al guardar mapeo de programa en BD:', error);
      // Fallback a localStorage si falla la BD
      try {
        const mappings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        mappings[programId] = {
          studioResource: mapping.studioResource || null,
          masterResource: mapping.masterResource || null,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
        console.log('⚠️ Guardado en localStorage como fallback');
        return true;
      } catch (localError) {
        console.error('Error guardando en localStorage:', localError);
        return false;
      }
    }
  },

  /**
   * Elimina el mapeo de un programa
   * @param {number} programId - ID del programa
   * @returns {Promise<boolean>} - true si se eliminó exitosamente
   */
  async delete(programId) {
    try {
      const response = await fetch(`${API_URL}/${programId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Asignación eliminada de BD:', programId);
      return true;
    } catch (error) {
      console.error('Error al eliminar mapeo de programa:', error);
      return false;
    }
  },

  /**
   * Migra datos desde localStorage a la base de datos
   * Solo necesario ejecutar una vez
   */
  async migrateFromLocalStorage() {
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (!localData) {
        console.log('ℹ️ No hay datos en localStorage para migrar');
        return { success: true, migrated: 0 };
      }

      const mappings = JSON.parse(localData);

      const response = await fetch(`${API_URL}/migrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mappings })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Migración completada:', result);

      // Limpiar localStorage después de migrar exitosamente
      localStorage.removeItem(STORAGE_KEY);

      return result;
    } catch (error) {
      console.error('Error al migrar datos:', error);
      return { success: false, error: error.message };
    }
  }
};

// src/services/customProgramsService.js

const STORAGE_KEY = 'rtvc_custom_programs';

/**
 * Servicio para gestionar programas personalizados agregados por el usuario
 */
export const customProgramsService = {
  /**
   * Obtiene todos los programas personalizados
   * @returns {Array} - Array de programas personalizados
   */
  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const programs = data ? JSON.parse(data) : [];
      console.log('📦 [customProgramsService.getAll] Programas cargados:', programs.length, programs.map(p => p.name));
      return programs;
    } catch (error) {
      console.error('Error al obtener programas personalizados:', error);
      return [];
    }
  },

  /**
   * Agrega un nuevo programa personalizado
   * @param {Object} program - Programa a agregar
   * @returns {Object} - Programa agregado con ID asignado
   */
  add(program) {
    try {
      const programs = this.getAll();
      console.log('📦 [customProgramsService.add] Programas existentes:', programs.length);

      // Generar ID único (números mayores a 1000 para evitar conflictos)
      const newId = programs.length > 0
        ? Math.max(...programs.map(p => p.id)) + 1
        : 1001;

      const newProgram = {
        ...program,
        id: newId,
        isCustom: true, // Marcar como personalizado
        createdAt: new Date().toISOString()
      };

      console.log('📦 [customProgramsService.add] Nuevo programa a guardar:', newProgram);

      programs.push(newProgram);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));

      // Verificar que se guardó correctamente
      const saved = localStorage.getItem(STORAGE_KEY);
      console.log('📦 [customProgramsService.add] Guardado en localStorage:', saved ? 'OK' : 'ERROR');
      console.log('📦 [customProgramsService.add] Total programas guardados:', JSON.parse(saved || '[]').length);

      return newProgram;
    } catch (error) {
      console.error('Error al agregar programa personalizado:', error);
      throw error;
    }
  },

  /**
   * Elimina un programa personalizado
   * @param {number} programId - ID del programa a eliminar
   * @returns {boolean} - true si se eliminó correctamente
   */
  delete(programId) {
    try {
      console.log('🗑️ [customProgramsService.delete] Eliminando programa ID:', programId);
      const programs = this.getAll();
      console.log('🗑️ [customProgramsService.delete] Programas antes de eliminar:', programs.length);
      const filteredPrograms = programs.filter(p => p.id !== programId);
      console.log('🗑️ [customProgramsService.delete] Programas después de eliminar:', filteredPrograms.length);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPrograms));
      return true;
    } catch (error) {
      console.error('Error al eliminar programa personalizado:', error);
      return false;
    }
  },

  /**
   * Actualiza un programa personalizado
   * @param {number} programId - ID del programa
   * @param {Object} updates - Campos a actualizar
   * @returns {Object|null} - Programa actualizado o null
   */
  update(programId, updates) {
    try {
      const programs = this.getAll();
      const index = programs.findIndex(p => p.id === programId);

      if (index === -1) return null;

      programs[index] = {
        ...programs[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
      return programs[index];
    } catch (error) {
      console.error('Error al actualizar programa personalizado:', error);
      return null;
    }
  },

  /**
   * Limpia todos los programas personalizados
   */
  clearAll() {
    try {
      console.log('⚠️⚠️⚠️ [customProgramsService.clearAll] LIMPIANDO TODOS LOS PROGRAMAS!!!');
      console.trace('Stack trace de clearAll:');
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error al limpiar programas personalizados:', error);
      return false;
    }
  }
};

// src/services/routeGroupsService.js
const API_URL = '/api';

export const routeGroupsService = {
  /**
   * Obtener todos los grupos de rutas
   */
  async getAll(shiftType = null) {
    try {
      const url = shiftType
        ? `${API_URL}/route-groups?shift_type=${shiftType}`
        : `${API_URL}/route-groups`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Error obteniendo grupos');

      return await response.json();
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  /**
   * Obtener un grupo específico por ID
   */
  async getById(id) {
    try {
      const response = await fetch(`${API_URL}/route-groups/${id}`);
      if (!response.ok) throw new Error('Error obteniendo grupo');

      return await response.json();
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo grupo de rutas
   */
  async create(groupData) {
    try {
      const response = await fetch(`${API_URL}/route-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error creando grupo');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  /**
   * Actualizar un grupo existente
   */
  async update(id, groupData) {
    try {
      const response = await fetch(`${API_URL}/route-groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error actualizando grupo');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  /**
   * Eliminar un grupo
   */
  async delete(id) {
    try {
      const response = await fetch(`${API_URL}/route-groups/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error eliminando grupo');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }
};

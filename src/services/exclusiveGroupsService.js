// src/services/exclusiveGroupsService.js
// Servicio para gestión de Grupos Exclusivos (MASTER, MÓVIL, PUESTO FIJO)

const API_URL = '/api';

export const exclusiveGroupsService = {
  // Obtener todos los grupos
  async getAll(groupType = null, activeOnly = true) {
    const params = new URLSearchParams();
    if (groupType) params.append('group_type', groupType);
    if (activeOnly) params.append('active_only', 'true');

    const res = await fetch(`${API_URL}/exclusive-groups?${params}`);
    if (!res.ok) throw new Error('Error obteniendo grupos exclusivos');
    return res.json();
  },

  // Obtener un grupo por ID
  async getById(id) {
    const res = await fetch(`${API_URL}/exclusive-groups/${id}`);
    if (!res.ok) throw new Error('Grupo no encontrado');
    return res.json();
  },

  // Crear nuevo grupo
  async create(data) {
    const res = await fetch(`${API_URL}/exclusive-groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error creando grupo');
    }
    return res.json();
  },

  // Actualizar grupo
  async update(id, data) {
    const res = await fetch(`${API_URL}/exclusive-groups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error actualizando grupo');
    }
    return res.json();
  },

  // Eliminar grupo
  async delete(id) {
    const res = await fetch(`${API_URL}/exclusive-groups/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error eliminando grupo');
    return res.json();
  },

  // Asignar grupo a una fecha
  async assign(groupId, assignmentDate, shiftType = 'ALL_DAY', notes = null) {
    const res = await fetch(`${API_URL}/exclusive-groups/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: groupId,
        assignment_date: assignmentDate,
        shift_type: shiftType,
        notes
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error asignando grupo');
    }
    return res.json();
  },

  // Obtener asignaciones de una fecha
  async getAssignments(date) {
    const res = await fetch(`${API_URL}/exclusive-groups/assignments/${date}`);
    if (!res.ok) throw new Error('Error obteniendo asignaciones');
    return res.json();
  },

  // Verificar si personal está bloqueado por grupo exclusivo
  async checkBlocked(date, personnelIds) {
    const ids = Array.isArray(personnelIds) ? personnelIds.join(',') : personnelIds;
    const res = await fetch(`${API_URL}/exclusive-groups/check-blocked/${date}?personnel_ids=${ids}`);
    if (!res.ok) throw new Error('Error verificando bloqueo');
    return res.json();
  },

  // Obtener masters disponibles
  async getMasters() {
    const res = await fetch(`${API_URL}/exclusive-groups/aux/masters`);
    if (!res.ok) throw new Error('Error obteniendo masters');
    return res.json();
  },

  // Obtener vehículos disponibles
  async getVehicles() {
    const res = await fetch(`${API_URL}/exclusive-groups/aux/vehicles`);
    if (!res.ok) throw new Error('Error obteniendo vehículos');
    return res.json();
  },

  // Obtener conductores disponibles
  async getDrivers() {
    const res = await fetch(`${API_URL}/exclusive-groups/aux/drivers`);
    if (!res.ok) throw new Error('Error obteniendo conductores');
    return res.json();
  }
};

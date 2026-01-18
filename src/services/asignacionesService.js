// src/services/asignacionesService.js
import api from './api';

// ============== ASIGNACIONES REPORTERÍA ==============

// Obtener todas las asignaciones de reportería
export const getAsignacionesReporteria = async (fecha = null) => {
  try {
    const url = fecha
      ? `/asignaciones-reporteria?fecha=${fecha}`
      : '/asignaciones-reporteria';
    const data = await api.get(url);
    return data;
  } catch (error) {
    console.error('Error al obtener asignaciones de reportería:', error);
    throw error;
  }
};

// Obtener asignaciones de reportería por fecha (agrupadas)
export const getAsignacionesReporteriaByFecha = async (fecha) => {
  try {
    const data = await api.get(`/asignaciones-reporteria/fecha/${fecha}`);
    return data;
  } catch (error) {
    console.error('Error al obtener asignaciones por fecha:', error);
    throw error;
  }
};

// Obtener disponibilidad de reportería
export const getDisponibilidadReporteria = async (fecha) => {
  try {
    const data = await api.get(`/asignaciones-reporteria/disponibilidad/${fecha}`);
    return data;
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    throw error;
  }
};

// Crear asignación de reportería
export const createAsignacionReporteria = async (asignacion) => {
  try {
    const response = await api.post('/asignaciones-reporteria', asignacion);
    return response;
  } catch (error) {
    console.error('Error al crear asignación:', error);
    const errorMessage = error.message || 'Error desconocido';
    throw new Error(errorMessage);
  }
};

// Actualizar asignación de reportería
export const updateAsignacionReporteria = async (id, asignacion) => {
  try {
    const data = await api.put(`/asignaciones-reporteria/${id}`, asignacion);
    return data;
  } catch (error) {
    console.error('Error al actualizar asignación:', error);
    throw error;
  }
};

// Eliminar asignación de reportería
export const deleteAsignacionReporteria = async (id) => {
  try {
    const data = await api.delete(`/asignaciones-reporteria/${id}`);
    return data;
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    throw error;
  }
};

// ============== ASIGNACIONES REALIZADORES ==============

// Obtener todas las asignaciones de realizadores
export const getAsignacionesRealizadores = async (fecha = null) => {
  try {
    const url = fecha
      ? `/asignaciones-realizadores?fecha=${fecha}`
      : '/asignaciones-realizadores';
    const data = await api.get(url);
    return data;
  } catch (error) {
    console.error('Error al obtener asignaciones de realizadores:', error);
    throw error;
  }
};

// Obtener asignaciones de realizadores por fecha (agrupadas)
export const getAsignacionesRealizadoresByFecha = async (fecha) => {
  try {
    const data = await api.get(`/asignaciones-realizadores/fecha/${fecha}`);
    return data;
  } catch (error) {
    console.error('Error al obtener asignaciones por fecha:', error);
    throw error;
  }
};

// Obtener disponibilidad de realizadores
export const getDisponibilidadRealizadores = async (fecha) => {
  try {
    const data = await api.get(`/asignaciones-realizadores/disponibilidad/${fecha}`);
    return data;
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    throw error;
  }
};

// Crear asignación de realizador
export const createAsignacionRealizador = async (asignacion) => {
  try {
    const response = await api.post('/asignaciones-realizadores', asignacion);
    return response;
  } catch (error) {
    console.error('Error al crear asignación:', error);
    const errorMessage = error.message || 'Error desconocido';
    throw new Error(errorMessage);
  }
};

// Actualizar asignación de realizador
export const updateAsignacionRealizador = async (id, asignacion) => {
  try {
    const data = await api.put(`/asignaciones-realizadores/${id}`, asignacion);
    return data;
  } catch (error) {
    console.error('Error al actualizar asignación:', error);
    throw error;
  }
};

// Eliminar asignación de realizador
export const deleteAsignacionRealizador = async (id) => {
  try {
    const data = await api.delete(`/asignaciones-realizadores/${id}`);
    return data;
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    throw error;
  }
};

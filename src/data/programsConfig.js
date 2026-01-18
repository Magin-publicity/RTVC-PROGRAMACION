// src/data/programsConfig.js

// Programas fijos (pueden modificarse horarios)
export const FIXED_PROGRAMS = [
  { id: 'calentado', name: 'Calentado', defaultTime: '06:00', color: '#4CAF50' },
  { id: 'avance1', name: 'Avance Informativo', defaultTime: '09:00', color: '#2196F3' },
  { id: 'emision_manana', name: 'Emisión RTVC Noticias', defaultTime: '09:30', color: '#FF9800' },
  { id: 'avance2', name: 'Avance Informativo', defaultTime: '12:00', color: '#2196F3' },
  { id: 'emision_central', name: 'Emisión Central', defaultTime: '12:30', color: '#FF9800' },
  { id: 'noches_opinion', name: 'Noches de Opinión', defaultTime: '18:00', color: '#9C27B0' },
  { id: 'ultima_emision', name: 'Última Emisión', defaultTime: '19:00', color: '#FF9800' }
];

// Programas variables (se agregan según necesidad)
export const VARIABLE_PROGRAMS_LIBRARY = [
  { id: 'festival', name: 'Festival', defaultTime: '15:00', color: '#E91E63' },
  { id: 'especial', name: 'Especial', defaultTime: '14:00', color: '#FF5722' },
  { id: 'dialogos_caribe', name: 'Diálogos del Caribe', defaultTime: '16:00', color: '#00BCD4' },
  { id: 'senal_investigativa', name: 'Señal Investigativa', defaultTime: '20:00', color: '#607D8B' },
  { id: 'noticracia', name: 'Noticracia', defaultTime: '21:00', color: '#795548' },
  { id: 'parte_contraparte', name: 'Parte y Contraparte', defaultTime: '22:00', color: '#FFC107' }
];

// Función para crear un nuevo programa personalizado
export const createCustomProgram = (name, time, color = '#757575') => ({
  id: `custom_${Date.now()}`,
  name,
  defaultTime: time,
  color,
  isCustom: true
});

// Obtener programas activos para una fecha
export const getActiveProgramsForDate = (date, customPrograms = []) => {
  // Por defecto, incluir todos los programas fijos
  const activePrograms = [...FIXED_PROGRAMS];
  
  // Agregar programas personalizados para esa fecha
  if (customPrograms && customPrograms.length > 0) {
    activePrograms.push(...customPrograms);
  }
  
  return activePrograms.sort((a, b) => {
    // Ordenar por hora
    return a.defaultTime.localeCompare(b.defaultTime);
  });
};

// Estados de asignación de personal
export const ASSIGNMENT_STATUS = {
  ASSIGNED: 'assigned',
  AVAILABLE: 'available',
  ON_LEAVE: 'on_leave',
  UNAVAILABLE: 'unavailable'
};

export const ASSIGNMENT_COLORS = {
  [ASSIGNMENT_STATUS.ASSIGNED]: '#FFA500', // Naranja
  [ASSIGNMENT_STATUS.AVAILABLE]: '#FFFFFF', // Blanco
  [ASSIGNMENT_STATUS.ON_LEAVE]: '#FFD700', // Amarillo
  [ASSIGNMENT_STATUS.UNAVAILABLE]: '#D3D3D3' // Gris
};
// src/data/departments.js

export const DEPARTMENTS = {
  PRODUCTORES: {
    id: 'productores',
    name: 'PRODUCTORES',
    color: '#3B82F6',
    icon: '📋',
    roles: ['Productor de Emisión', 'Producción', 'Productora'],
    minStaff: 4,
    maxStaff: 8
  },

  ASISTENTES_PRODUCCION: {
    id: 'asistentes_produccion',
    name: 'ASISTENTES DE PRODUCCIÓN',
    color: '#60A5FA',
    icon: '📝',
    roles: ['Asistente de producción'],
    minStaff: 3,
    maxStaff: 6
  },
  
  DIRECTORES_CAMARA: {
    id: 'directores_camara',
    name: 'DIRECTORES DE CÁMARA',
    color: '#8B5CF6',
    icon: '🎥',
    roles: ['Director de Cámaras'],
    minStaff: 2,
    maxStaff: 4
  },

  REALIZADORES: {
    id: 'realizadores',
    name: 'REALIZADORES',
    color: '#7C3AED',
    icon: '🎬',
    roles: ['Realizador'],
    minStaff: 4,
    maxStaff: 8
  },
  
  VTR: {
    id: 'vtr',
    name: 'VTR',
    color: '#EC4899',
    icon: '📹',
    roles: ['Operador de VTR'],
    minStaff: 2,
    maxStaff: 3
  },
  
  OPERADORES_VMIX: {
    id: 'operadores_vmix',
    name: 'OPERADORES DE VMIX',
    color: '#10B981',
    icon: '🖥️',
    roles: ['Operador de Vmix'],
    minStaff: 2,
    maxStaff: 5
  },

  OPERADORES_PANTALLAS: {
    id: 'operadores_pantallas',
    name: 'OPERADORES DE PANTALLAS',
    color: '#34D399',
    icon: '📱',
    roles: ['Operador de Pantallas'],
    minStaff: 2,
    maxStaff: 5
  },
  
  GENERADORES_CARACTERES: {
    id: 'generadores_caracteres',
    name: 'GENERADORES DE CARACTERES',
    color: '#F59E0B',
    icon: '📝',
    roles: ['Generador de Caracteres'],
    minStaff: 2,
    maxStaff: 4
  },
  
  OPERADORES_SONIDO: {
    id: 'operadores_sonido',
    name: 'OPERADORES DE SONIDO',
    color: '#EF4444',
    icon: '🎵',
    roles: ['Operador consola de sonido', 'Operador de sonido'],
    minStaff: 3,
    maxStaff: 5
  },

  ASISTENTES_SONIDO: {
    id: 'asistentes_sonido',
    name: 'ASISTENTES DE SONIDO',
    color: '#F87171',
    icon: '🎧',
    roles: ['Asistente de sonido'],
    minStaff: 3,
    maxStaff: 6
  },
  
  OPERADORES_PROMPTER: {
    id: 'operadores_prompter',
    name: 'OPERADORES DE PROMPTER',
    color: '#6366F1',
    icon: '📺',
    roles: ['Operador de teleprompter'],
    minStaff: 2,
    maxStaff: 3
  },
  
  CAMAROGRAFOS_ESTUDIO: {
    id: 'camarografos_estudio',
    name: 'CAMARÓGRAFOS DE ESTUDIO',
    color: '#14B8A6',
    icon: '🎬',
    roles: ['Camarógrafo de estudio'],
    minStaff: 4,
    maxStaff: 20
  },

  ASISTENTES_ESTUDIO: {
    id: 'asistentes_estudio',
    name: 'ASISTENTES DE ESTUDIO',
    color: '#06B6D4',
    icon: '🎯',
    roles: ['Asistente de estudio'],
    minStaff: 2,
    maxStaff: 5
  },

  COORDINADOR_ESTUDIO: {
    id: 'coordinador_estudio',
    name: 'COORDINADOR ESTUDIO',
    color: '#F97316',
    icon: '👔',
    roles: ['Coordinador estudio'],
    minStaff: 1,
    maxStaff: 1
  },
  
  ESCENOGRAFIA: {
    id: 'escenografia',
    name: 'ESCENOGRAFÍA',
    color: '#84CC16',
    icon: '🎨',
    roles: ['Escenógrafo', 'Asistente de Escenografía'],
    minStaff: 2,
    maxStaff: 4
  },
  
  ASISTENTES_LUCES: {
    id: 'asistentes_luces',
    name: 'ASISTENTES DE LUCES',
    color: '#FBBF24',
    icon: '💡',
    roles: ['Asistente de luces'],
    minStaff: 2,
    maxStaff: 3
  },
  
  OPERADORES_VIDEO: {
    id: 'operadores_video',
    name: 'OPERADORES DE VIDEO',
    color: '#A855F7',
    icon: '🎞️',
    roles: ['Operador de video'],
    minStaff: 2,
    maxStaff: 3
  },
  
  CONTRIBUCIONES: {
    id: 'contribuciones',
    name: 'CONTRIBUCIONES',
    color: '#06B6D4',
    icon: '📡',
    roles: ['Contribuciones'],
    minStaff: 1,
    maxStaff: 2
  },

  CAMAROGRAFOS_REPORTERIA: {
    id: 'camarografos_reporteria',
    name: 'CAMARÓGRAFOS DE REPORTERÍA',
    color: '#DC2626',
    icon: '📰',
    roles: ['Camarógrafo de reportería'],
    minStaff: 10,
    maxStaff: 20
  },

  ASISTENTES_REPORTERIA: {
    id: 'asistentes_reporteria',
    name: 'ASISTENTES DE REPORTERÍA',
    color: '#F97316',
    icon: '🎙️',
    roles: ['Asistente de reportería'],
    minStaff: 5,
    maxStaff: 10
  },

  VESTUARIO: {
    id: 'vestuario',
    name: 'VESTUARIO',
    color: '#DB2777',
    icon: '👗',
    roles: ['Vestuario'],
    minStaff: 2,
    maxStaff: 3
  },
  
  MAQUILLAJE: {
    id: 'maquillaje',
    name: 'MAQUILLAJE',
    color: '#E879F9',
    icon: '💄',
    roles: ['Maquillaje'],
    minStaff: 2,
    maxStaff: 3
  }
};

export const getDepartmentByRole = (role) => {
  for (const dept in DEPARTMENTS) {
    if (DEPARTMENTS[dept].roles.includes(role)) {
      return DEPARTMENTS[dept];
    }
  }
  return null;
};

export const getDepartmentColor = (departmentId) => {
  const dept = Object.values(DEPARTMENTS).find(d => d.id === departmentId);
  return dept ? dept.color : '#6B7280';
};

export const getAllDepartments = () => {
  return Object.values(DEPARTMENTS);
};

export const getDepartmentById = (id) => {
  return Object.values(DEPARTMENTS).find(d => d.id === id);
};
// src/data/departments.js

export const DEPARTMENTS = {
  PRODUCCION: {
    id: 'produccion',
    name: 'PRODUCCIÓN',
    color: '#3B82F6',
    icon: '📋',
    roles: [
      'Productor de Emisión',
      'Producción',
      'Productora',
      'Asistente de producción'
    ],
    minStaff: 3,
    maxStaff: 8
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
  
  VTR: {
    id: 'vtr',
    name: 'VTR',
    color: '#EC4899',
    icon: '📹',
    roles: ['Operador de VTR'],
    minStaff: 2,
    maxStaff: 3
  },
  
  VMIX_PANTALLAS: {
    id: 'vmix_pantallas',
    name: 'OPERADOR DE VMIX Y PANTALLAS',
    color: '#10B981',
    icon: '🖥️',
    roles: ['Operador de Vmix', 'Operador de Pantallas'],
    minStaff: 2,
    maxStaff: 4
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
  
  OPERADORES_AUDIO: {
    id: 'operadores_audio',
    name: 'OPERADORES DE AUDIO',
    color: '#EF4444',
    icon: '🎵',
    roles: ['Operador consola de sonido', 'Asistente de sonido'],
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
    name: 'CAMARÓGRAFOS Y ASISTENTES DE ESTUDIO',
    color: '#14B8A6',
    icon: '🎬',
    roles: ['Camarógrafo de estudio', 'Asistente de estudio'],
    minStaff: 4,
    maxStaff: 12
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
    name: 'CAMARÓGRAFOS Y ASISTENTES DE REPORTERÍA',
    color: '#DC2626',
    icon: '📰',
    roles: ['Camarógrafo de reportería', 'Asistente de reportería', 'REALIZADOR'],
    minStaff: 4,
    maxStaff: 15
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
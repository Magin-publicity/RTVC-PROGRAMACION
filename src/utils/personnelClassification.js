// src/utils/personnelClassification.js

// Clasificación de personal según su cargo
export const PERSONNEL_GROUPS = {
  ESTUDIO: 'ESTUDIO',
  MASTER: 'MASTER',
  INDEPENDIENTE: 'INDEPENDIENTE'
};

// Mapeo de cargos a grupos
const CARGO_TO_GROUP = {
  // Grupo ESTUDIO - Cámaras y asistentes en piso de estudio
  'Camarógrafo': PERSONNEL_GROUPS.ESTUDIO,
  'Camarógrafo de estudio': PERSONNEL_GROUPS.ESTUDIO,
  'Camarógrafo de reportería': PERSONNEL_GROUPS.ESTUDIO,
  'Asistente de Cámara': PERSONNEL_GROUPS.ESTUDIO,
  'Asistente de estudio': PERSONNEL_GROUPS.ESTUDIO,
  'Asistente de reportería': PERSONNEL_GROUPS.ESTUDIO,
  'Asistente de Reportería': PERSONNEL_GROUPS.ESTUDIO,
  'Asistente de Escenografía': PERSONNEL_GROUPS.ESTUDIO,
  'Asistente de luces': PERSONNEL_GROUPS.ESTUDIO,
  'Coordinador': PERSONNEL_GROUPS.ESTUDIO,
  'Coordinador estudio': PERSONNEL_GROUPS.ESTUDIO,
  'Escenógrafo': PERSONNEL_GROUPS.ESTUDIO,

  // Grupo MASTER - Control master y producción
  'VTR': PERSONNEL_GROUPS.MASTER,
  'Operador de VTR': PERSONNEL_GROUPS.MASTER,
  'Director': PERSONNEL_GROUPS.MASTER,
  'Director de Cámaras': PERSONNEL_GROUPS.MASTER,
  'Realizador': PERSONNEL_GROUPS.MASTER,
  'Operador de Sonido': PERSONNEL_GROUPS.MASTER,
  'Operador consola de sonido': PERSONNEL_GROUPS.MASTER,
  'Asistente de sonido': PERSONNEL_GROUPS.MASTER,
  'Generador de Caracteres': PERSONNEL_GROUPS.MASTER,
  'Productor': PERSONNEL_GROUPS.MASTER,
  'Producción': PERSONNEL_GROUPS.MASTER,
  'Productor de Emisión': PERSONNEL_GROUPS.MASTER,
  'Productora': PERSONNEL_GROUPS.MASTER,
  'Teleprompter': PERSONNEL_GROUPS.MASTER,
  'Operador de teleprompter': PERSONNEL_GROUPS.MASTER,
  'Asistente de Producción': PERSONNEL_GROUPS.MASTER,
  'Asistente de producción': PERSONNEL_GROUPS.MASTER,
  'Pantallas': PERSONNEL_GROUPS.MASTER,
  'Operador de Pantallas': PERSONNEL_GROUPS.MASTER,
  'VMix': PERSONNEL_GROUPS.MASTER,
  'Operador de Vmix': PERSONNEL_GROUPS.MASTER,
  'Contribuciones': PERSONNEL_GROUPS.MASTER,
  'Operador de Video': PERSONNEL_GROUPS.MASTER,
  'Operador de video': PERSONNEL_GROUPS.MASTER,

  // Grupo ESTUDIO - Agregados: Maquillaje y Vestuario
  'Maquilladora': PERSONNEL_GROUPS.ESTUDIO,
  'Maquillaje': PERSONNEL_GROUPS.ESTUDIO,
  'Vestuario': PERSONNEL_GROUPS.ESTUDIO
};

/**
 * Clasifica un empleado según su cargo
 * @param {string} role - Cargo del empleado
 * @returns {string} - Grupo al que pertenece (ESTUDIO, MASTER, INDEPENDIENTE)
 */
export const classifyPersonnel = (role) => {
  if (!role) return PERSONNEL_GROUPS.INDEPENDIENTE;

  // Buscar coincidencia exacta
  if (CARGO_TO_GROUP[role]) {
    return CARGO_TO_GROUP[role];
  }

  // Buscar coincidencia parcial (case insensitive)
  const roleLower = role.toLowerCase();
  for (const [cargo, group] of Object.entries(CARGO_TO_GROUP)) {
    if (roleLower.includes(cargo.toLowerCase()) || cargo.toLowerCase().includes(roleLower)) {
      return group;
    }
  }

  // Por defecto, independiente
  return PERSONNEL_GROUPS.INDEPENDIENTE;
};

/**
 * Obtiene el nombre del recurso según el grupo y el mapeo del programa
 * @param {object} programMapping - Mapeo del programa {studioResource, masterResource}
 * @param {string} personnelGroup - Grupo del personal (ESTUDIO, MASTER, INDEPENDIENTE)
 * @returns {string|null} - Nombre del recurso o null si no aplica
 */
export const getResourceForPersonnel = (programMapping, personnelGroup) => {
  if (!programMapping) return null;

  switch (personnelGroup) {
    case PERSONNEL_GROUPS.ESTUDIO:
      return programMapping.studioResource ? `Estudio ${programMapping.studioResource}` : null;
    case PERSONNEL_GROUPS.MASTER:
      return programMapping.masterResource ? `Master ${programMapping.masterResource}` : null;
    case PERSONNEL_GROUPS.INDEPENDIENTE:
    default:
      return null; // No muestra ubicación
  }
};

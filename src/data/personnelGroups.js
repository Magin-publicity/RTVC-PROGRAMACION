// src/data/personnelGroups.js
// Configuración de grupos por área

export const personnelGroups = {
  'CAMARÓGRAFOS DE ESTUDIO': {
    // Grupo 1 - 6 personas
    'Cesar Jimenez': 1,
    'Alexander Quiñonez': 1,
    'Angel Zapata': 1,
    'Carlos López': 1,
    'Jorge Jaramillo': 1,
    'William Mosquera': 1,

    // Grupo 2 - 5 personas
    'Juan Sacristán': 2,
    'Raul Ramírez': 2,
    'Carlos García': 2,
    'Luis Bernal': 2,
    'Andrés López': 2,

    // Grupo 3 - 4 personas
    'Ernesto Corchuelo': 3,
    'Pedro Niño': 3,
    'John Loaiza': 3,
    'John Jiménez': 3,

    // Grupo 4 - 5 personas
    'Sebastián Hernández': 4,
    'Jefferson Pérez': 4,
    'Samuel Romero': 4,
    'Oscar González': 4,
    'John Daminston': 4
  },

  'CAMARÓGRAFOS DE REPORTERÍA': {
    // Grupo 1 - 9 personas
    'Andrés Ramírez': 1,
    'Edgar Castillo': 1,
    'Edgar Nieto': 1,
    'William Ruiz': 1,
    'Carlos Wilches': 1,
    'Ramiro Balaguera': 1,
    'Victor Vargas': 1,
    'Cesar Morales': 1,
    'Erick Velásquez': 1,

    // Grupo 2 - 9 personas
    'Julián Luna': 2,
    'William Uribe': 2,
    'Álvaro Díaz': 2,
    'John Buitrago': 2,
    'Enrique Muñoz': 2,
    'Didier Buitrago': 2,
    'Floresmiro Luna': 2,
    'Leonel Cifuentes': 2,
    'Marco Solórzano': 2
  }
};

/**
 * Obtiene el número de grupo de una persona en un área específica
 * @param {string} area - Nombre del área
 * @param {string} personName - Nombre de la persona
 * @returns {number|null} Número de grupo o null si no está definido
 */
export function getPersonGroup(area, personName) {
  if (!personnelGroups[area]) return null;
  return personnelGroups[area][personName] || null;
}

/**
 * Obtiene todas las personas de un grupo específico en un área
 * @param {string} area - Nombre del área
 * @param {number} groupNumber - Número de grupo
 * @returns {Array<string>} Array de nombres
 */
export function getGroupMembers(area, groupNumber) {
  if (!personnelGroups[area]) return [];
  return Object.entries(personnelGroups[area])
    .filter(([_, group]) => group === groupNumber)
    .map(([name, _]) => name);
}

/**
 * Cuenta cuántos grupos hay en un área
 * @param {string} area - Nombre del área
 * @returns {number} Número de grupos
 */
export function getGroupCount(area) {
  if (!personnelGroups[area]) return 0;
  const groups = Object.values(personnelGroups[area]);
  return Math.max(...groups);
}

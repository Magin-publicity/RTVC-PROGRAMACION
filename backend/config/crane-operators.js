// backend/config/crane-operators.js
// Configuración de Grupos y Operadores de Grúa dentro de Camarógrafos de Estudio
// Los 20 camarógrafos están organizados en 4 grupos (A, B, C, D) de 5 personas cada uno
// Cada grupo rota de forma independiente

// 🏗️ OPERADORES DE GRÚA - Organizados en 4 grupos por horario para facilitar relevos
const CRANE_OPERATORS_GROUPS = {
  'GRUPO_1_MADRUGADA': {
    timeRange: '05:00 - 11:00',
    shift: '05:00',
    operators: ['John Loaiza'],
    icon: '🌅'
  },
  'GRUPO_2_MAÑANA': {
    timeRange: '09:00 - 15:00',
    shift: '09:00',
    operators: ['Carlos García', 'Luis Bernal'],
    icon: '☀️'
  },
  'GRUPO_3_TARDE': {
    timeRange: '13:00 - 19:00',
    shift: '13:00',
    operators: ['Raul Ramírez'],
    icon: '🌤️'
  },
  'GRUPO_4_NOCHE': {
    timeRange: '16:00 - 22:00',
    shift: '16:00',
    operators: ['Carlos A. López', 'Jefferson Pérez'],
    icon: '🌆'
  }
};

// Lista plana de todos los operadores (para compatibilidad)
const CRANE_OPERATORS = [
  'Carlos García',
  'John Loaiza',
  'Luis Bernal',
  'Jefferson Pérez',
  'Raul Ramírez',
  'Carlos A. López'
];

// Función helper para verificar si una persona es operador de grúa
// Compara de forma case-insensitive y tolerante a variaciones de ortografía
const isCraneOperator = (personName) => {
  if (!personName) return false;

  const normalizedName = personName.trim().toLowerCase();

  return CRANE_OPERATORS.some(craneName => {
    const normalizedCraneName = craneName.toLowerCase();
    // Comparación exacta o parcial (por si hay variaciones como "Jhon" vs "John", "Carlos López" vs "Carlos A. López")
    return normalizedName === normalizedCraneName ||
           normalizedName.includes(normalizedCraneName.replace('john', 'jhon')) ||
           normalizedName.includes(normalizedCraneName.replace('jhon', 'john')) ||
           normalizedName.replace(/\s+/g, ' ').includes(craneName.replace('A. ', '').toLowerCase());
  });
};

// Obtener el grupo de un operador de grúa
const getCraneOperatorGroup = (personName) => {
  if (!isCraneOperator(personName)) return null;

  for (const [groupKey, groupData] of Object.entries(CRANE_OPERATORS_GROUPS)) {
    if (groupData.operators.some(op =>
      personName.toLowerCase().includes(op.toLowerCase().replace('a. ', '')) ||
      op.toLowerCase().includes(personName.toLowerCase().replace('a. ', ''))
    )) {
      return {
        key: groupKey,
        ...groupData
      };
    }
  }

  return null;
};

// GRUPOS DE ROTACIÓN - Cada grupo rota de forma independiente
// John Loaiza -> GRUPO A
// Jorge Jaramillo -> GRUPO B (sin operador de grúa específico)
// Luis Bernal & Jefferson Pérez -> GRUPO C (co-líderes)
// Carlos García -> GRUPO D

const ROTATION_GROUPS = {
  'A': {
    letter: 'A',
    craneOperator: 'John Loaiza',
    color: '#FF6B6B',
    icon: '🔴'
  },
  'B': {
    letter: 'B',
    craneOperator: null,  // Sin operador de grúa específico
    color: '#4ECDC4',
    icon: '🔵'
  },
  'C': {
    letter: 'C',
    craneOperator: 'Luis Bernal',
    craneOperator2: 'Jefferson Pérez',
    color: '#45B7D1',
    icon: '🟢'
  },
  'D': {
    letter: 'D',
    craneOperator: 'Carlos García',
    color: '#FFA07A',
    icon: '🟡'
  }
};

module.exports = {
  CRANE_OPERATORS,
  CRANE_OPERATORS_GROUPS,
  ROTATION_GROUPS,
  isCraneOperator,
  getCraneOperatorGroup
};

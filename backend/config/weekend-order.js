// Orden fijo del personal para fines de semana (sábado y domingo)
// Este orden NO rota, siempre es el mismo
// Basado en documento: COORDINACIÓN PERSONAL 14 DE DICIEMBRE 2025

const WEEKEND_PERSONNEL_ORDER = {
  'PRODUCTORES': [
    { name: 'Marilú Durán', shift: '08:00-16:00' },
    { name: 'Angela Cabezas', shift: '08:00-16:00' }
  ],
  'ASISTENTES DE PRODUCCIÓN': [
    { name: 'Angela Cabezas', shift: '08:00-16:00' },
    { name: 'Marilú Durán', shift: '08:00-16:00' }
  ],
  'DIRECTORES DE CÁMARA': [
    { name: 'Andrés Patiño', shift: '08:00-16:00' },
    { name: 'Diego Gamboa', shift: '14:00-22:00' }
  ],
  'VTR': [
    { name: 'David Córdoba', shift: '08:00-16:00' },
    { name: 'Juan Zorrilla', shift: '14:00-22:00' }
  ],
  'OPERADORES DE VMIX': [
    { name: 'Ronald Ortiz', shift: '09:00-17:00' },
    { name: 'Sofía Fajardo', shift: '09:00-17:00' }
  ],
  'OPERADORES DE PANTALLAS': [
    { name: 'Paola Borrero', shift: '08:00-16:00' },
    { name: 'Dary Segura', shift: '14:00-22:00' }
  ],
  'GENERADORES DE CARACTERES': [
    { name: 'Maria Jose Escobar', shift: '08:00-16:00' },
    { name: 'Diana Ospina', shift: '14:00-22:00' }
  ],
  'OPERADORES DE SONIDO': [
    { name: 'Oscar Bernal', shift: '08:00-16:00' },
    { name: 'Harold Barrero', shift: '14:00-22:00' }
  ],
  'ASISTENTES DE SONIDO': [
    { name: 'Jimmy Estupiñán', shift: '08:00-16:00' },
    { name: 'Jaime Rueda', shift: '14:00-22:00' }
  ],
  'OPERADORES DE PROMPTER': [
    { name: 'Duván Díaz', shift: '08:00-16:00' },
    { name: 'Kevin Alejandro Lerma', shift: '14:00-22:00' }
  ],
  'CAMARÓGRAFOS DE ESTUDIO': [
    { name: 'Cesar Jimenez', shift: '08:00-16:00' },
    { name: 'Jorge Jaramillo', shift: '08:00-16:00' },
    { name: 'Ernesto Corchuelo', shift: '08:00-16:00' },
    { name: 'John Daminston', shift: '08:00-16:00' }
  ],
  'ASISTENTES DE ESTUDIO': [
    { name: 'Julio Vega', shift: '14:00-22:00' },
    { name: 'José Peña', shift: '08:00-16:00' }
  ],
  'COORDINADOR ESTUDIO': [
    { name: 'Coordinador 1', shift: '08:00-16:00' },
    { name: 'Coordinador 2', shift: '14:00-22:00' }
  ],
  'ESCENOGRAFÍA': [
    { name: 'Rafael López', shift: '08:00-16:00' },
    { name: 'Nestor Peña', shift: '08:00-16:00' }
  ],
  'ASISTENTES DE LUCES': [
    { name: 'Jaiver Galeano', shift: '08:00-16:00' },
    { name: 'Santiago Espinosa', shift: '14:00-22:00' }
  ],
  'OPERADORES DE VIDEO': [
    { name: 'Horacio Suárez', shift: '08:00-16:00' },
    { name: 'Iván Aristizábal', shift: '14:00-22:00' }
  ],
  'CONTRIBUCIONES': [
    { name: 'Carolina Benavides', shift: '08:00-16:00' },
    { name: 'Adrian Contreras', shift: '14:00-22:00' }
  ],
  'REALIZADORES': [
    { name: 'Laura Vargas', shift: '08:00-16:00' },
    { name: 'David Patarroyo', shift: '14:00-22:00' }
  ],
  'CAMARÓGRAFOS DE REPORTERÍA': [
    { name: 'Andrés Ramírez', shift: '08:00-16:00' },
    { name: 'Ramiro Balaguera', shift: '14:00-22:00' },
    { name: 'Cesar Morales', shift: '14:00-22:00' }
  ],
  'ASISTENTES DE REPORTERÍA': [
    { name: 'Johan Daniel Moreno', shift: '08:00-16:00' },
    { name: 'José Mesa', shift: '08:00-16:00' },
    { name: 'Walter Murillo', shift: '14:00-22:00' }
  ],
  'VESTUARIO': [
    { name: 'Mariluz Beltrán', shift: '08:00-16:00' },
    { name: 'Mercedes Malagón', shift: '14:00-22:00' }
  ],
  'MAQUILLAJE': [
    { name: 'Ana Villalba', shift: '08:00-16:00' },
    { name: 'María Espinosa', shift: '14:00-22:00' }
  ]
};

module.exports = { WEEKEND_PERSONNEL_ORDER };

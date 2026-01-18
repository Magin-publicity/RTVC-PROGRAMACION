// Sistema de rotación de fin de semana basado en números
// Cada persona tiene un número y rota secuencialmente
// Cada fin de semana vienen 2 personas (consecutivas en el orden)

const WEEKEND_PERSONNEL_NUMBERED = {
  'PRODUCTORES': [
    { number: 1, name: 'Rocio Ruiz', shift: '08:00-16:00' },
    { number: 2, name: 'Luis Fajardo', shift: '14:00-22:00' },
    { number: 3, name: 'Juan Carlos Boada', shift: '08:00-16:00' },
    { number: 4, name: 'Marilú Durán', shift: '14:00-22:00' },
    { number: 5, name: 'Leidy Guzmán', shift: '08:00-16:00' },
    { number: 6, name: 'Luis Solano', shift: '14:00-22:00' }
  ],
  'ASISTENTES DE PRODUCCIÓN': [
    { number: 1, name: 'Laura Ávila', shift: '08:00-16:00' },
    { number: 2, name: 'Sebastián Arango', shift: '14:00-22:00' },
    { number: 3, name: 'Nicolle Diaz', shift: '08:00-16:00' },
    { number: 4, name: 'Isabella Rojas', shift: '14:00-22:00' },
    { number: 5, name: 'Angela Cabezas', shift: '08:00-16:00' }
  ],
  'DIRECTORES DE CÁMARA': [
    { number: 1, name: 'Andrés Patiño', shift: '08:00-16:00' },
    { number: 2, name: 'Diego Gamboa', shift: '14:00-22:00' },
    { number: 3, name: 'Eduardo Contreras', shift: '08:00-16:00' },
    { number: 4, name: 'Alejandro La Torre', shift: '14:00-22:00' },
    { number: 5, name: 'Camilo Hernández', shift: '08:00-16:00' }
  ],
  'VTR': [
    { number: 1, name: 'Alfredo Méndez', shift: '08:00-16:00' },
    { number: 2, name: 'David Córdoba', shift: '14:00-22:00' },
    { number: 3, name: 'Henry Villarraga', shift: '08:00-16:00' },
    { number: 4, name: 'William Aldana', shift: '14:00-22:00' }
  ],
  'OPERADORES DE VMIX': [
    { number: 1, name: 'Sofía Fajardo', shift: '08:00-16:00' },
    { number: 2, name: 'Ronald Ortiz', shift: '14:00-22:00' },
    { number: 3, name: 'Vanesa Castañeda', shift: '08:00-16:00' },
    { number: 4, name: 'Kevin Fonseca', shift: '14:00-22:00' }
  ],
  'OPERADORES DE PANTALLAS': [
    { number: 1, name: 'Leidy Salazar', shift: '08:00-16:00' },
    { number: 2, name: 'Paola Borrero', shift: '14:00-22:00' },
    { number: 3, name: 'Dary Segura', shift: '08:00-16:00' },
    { number: 4, name: 'Ashlei Montero', shift: '14:00-22:00' }
  ],
  'GENERADORES DE CARACTERES': [
    { number: 1, name: 'Dayana Rodríguez', shift: '08:00-16:00' },
    { number: 2, name: 'Diana Ospina', shift: '14:00-22:00' },
    { number: 3, name: 'María Suárez', shift: '08:00-16:00' },
    { number: 4, name: 'Santiago Ortiz', shift: '14:00-22:00' },
    { number: 5, name: 'Santiago Rico', shift: '08:00-16:00' },
    { number: 6, name: 'Maria Jose Escobar', shift: '14:00-22:00' }
  ],
  'OPERADORES DE SONIDO': [
    { number: 1, name: 'Lenin Gutiérrez', shift: '08:00-16:00' },
    { number: 2, name: 'Harold Barrero', shift: '14:00-22:00' },
    { number: 3, name: 'Wilmar Matiz', shift: '08:00-16:00' },
    { number: 4, name: 'Oscar Bernal', shift: '14:00-22:00' }
  ],
  'ASISTENTES DE SONIDO': [
    { number: 1, name: 'Wilson Cano', shift: '08:00-16:00' },
    { number: 2, name: 'Marcela Vélez', shift: '14:00-22:00' },
    { number: 3, name: 'Jimmy Estupiñán', shift: '08:00-16:00' },
    { number: 4, name: 'Luis Fonseca', shift: '14:00-22:00' },
    { number: 5, name: 'Jaime Rueda', shift: '14:00-22:00' }
  ],
  'OPERADORES DE PROMPTER': [
    { number: 1, name: 'Katherine Montoya', shift: '08:00-16:00' },
    { number: 2, name: 'Lina Rodríguez', shift: '14:00-22:00' },
    { number: 3, name: 'Duván Díaz', shift: '08:00-16:00' },
    { number: 4, name: 'Kevin Alejandro Lerma', shift: '14:00-22:00' }
  ],
  'CAMARÓGRAFOS DE ESTUDIO': [
    // Rotación por grupos de 4 que alternan entre AM y PM
    // Grupo 0 (índices 0-3)
    { number: 1, name: 'Cesar Jimenez', shift: '08:00-16:00' },
    { number: 2, name: 'Alexander Quiñonez', shift: '08:00-16:00' },
    { number: 3, name: 'Angel Zapata', shift: '08:00-16:00' },
    { number: 4, name: 'Carlos López', shift: '08:00-16:00' },
    // Grupo 1 (índices 4-7)
    { number: 5, name: 'Jorge Jaramillo', shift: '08:00-16:00' },
    { number: 6, name: 'William Mosquera', shift: '08:00-16:00' },
    { number: 7, name: 'Juan Sacristán', shift: '08:00-16:00' },
    { number: 8, name: 'Raul Ramírez', shift: '08:00-16:00' },
    // Grupo 2 (índices 8-11)
    { number: 9, name: 'Carlos García', shift: '08:00-16:00' },
    { number: 10, name: 'Luis Bernal', shift: '08:00-16:00' },
    { number: 11, name: 'Andrés López', shift: '08:00-16:00' },
    { number: 12, name: 'Ernesto Corchuelo', shift: '08:00-16:00' },
    // Grupo 3 (índices 12-15)
    { number: 13, name: 'Pedro Niño', shift: '08:00-16:00' },
    { number: 14, name: 'John Loaiza', shift: '08:00-16:00' },
    { number: 15, name: 'John Jiménez', shift: '08:00-16:00' },
    { number: 16, name: 'Sebastián Hernández', shift: '08:00-16:00' },
    // Grupo 4 (índices 16-19)
    { number: 17, name: 'Jefferson Pérez', shift: '08:00-16:00' },
    { number: 18, name: 'Samuel Romero', shift: '08:00-16:00' },
    { number: 19, name: 'Oscar González', shift: '08:00-16:00' },
    { number: 20, name: 'John Daminston', shift: '08:00-16:00' }
  ],
  'ASISTENTES DE ESTUDIO': [
    { number: 1, name: 'José Peña', shift: '08:00-16:00' },
    { number: 2, name: 'Diego González', shift: '14:00-22:00' },
    { number: 3, name: 'Julio Vega', shift: '14:00-22:00' },
    { number: 4, name: 'Rodolfo Saldaña', shift: '08:00-16:00' },
    { number: 5, name: 'Carlos Orlando Espinel', shift: '08:00-16:00' }
  ],
  'ESCENOGRAFÍA': [
    { number: 1, name: 'Néstor Peña', shift: '08:00-16:00' },
    { number: 2, name: 'Rafael López', shift: '14:00-22:00' },
    { number: 3, name: 'John Forero', shift: '08:00-16:00' },
    { number: 4, name: 'Jacson Urrego', shift: '14:00-22:00' },
    { number: 5, name: 'Joaquín Alonso', shift: '08:00-16:00' },
    { number: 6, name: 'Marco Rivera', shift: '14:00-22:00' }
  ],
  'ASISTENTES DE LUCES': [
    { number: 1, name: 'Santiago Espinosa', shift: '08:00-16:00' },
    { number: 2, name: 'Jaiver Galeano', shift: '14:00-22:00' },
    { number: 3, name: 'Santiago Torres', shift: '08:00-16:00' },
    { number: 4, name: 'Julio López', shift: '14:00-22:00' }
  ],
  'OPERADORES DE VIDEO': [
    { number: 1, name: 'Iván Aristizábal', shift: '08:00-16:00' },
    { number: 2, name: 'Horacio Suárez', shift: '14:00-22:00' },
    { number: 3, name: 'Pedro Torres', shift: '08:00-16:00' },
    { number: 4, name: 'Leonardo Castro', shift: '14:00-22:00' }
  ],
  'CONTRIBUCIONES': [
    { number: 1, name: 'Michael Torres', shift: '08:00-16:00' },
    { number: 2, name: 'Carolina Benavides', shift: '14:00-22:00' },
    { number: 3, name: 'Adrian Contreras', shift: '08:00-16:00' }
  ],
  'REALIZADORES': [
    { number: 1, name: 'Laura Vargas', shift: '08:00-16:00' },
    { number: 2, name: 'Óscar Ortega', shift: '14:00-22:00' },
    { number: 3, name: 'Guillermo Solarte', shift: '08:00-16:00' },
    { number: 4, name: 'Wílmer Salamanca', shift: '14:00-22:00' },
    { number: 5, name: 'David Patarroyo', shift: '08:00-16:00' },
    { number: 6, name: 'Alexander Valencia', shift: '14:00-22:00' }
  ],
  'CAMARÓGRAFOS DE REPORTERÍA': [
    // 8 personas trabajando cada fin de semana: 4 turno AM + 4 turno PM
    // Total de personal para rotación: 18 personas
    // Rotación: cada fin de semana toma 8 consecutivos del pool (4 AM + 4 PM)
    { number: 1, name: 'Andrés Ramírez' },
    { number: 2, name: 'Edgar Castillo' },
    { number: 3, name: 'Edgar Nieto' },
    { number: 4, name: 'William Ruiz' },
    { number: 5, name: 'Carlos Wilches' },
    { number: 6, name: 'Ramiro Balaguera' },
    { number: 7, name: 'Victor Vargas' },
    { number: 8, name: 'Cesar Morales' },
    { number: 9, name: 'Erick Velásquez' },
    { number: 10, name: 'Julián Luna' },
    { number: 11, name: 'William Uribe' },
    { number: 12, name: 'Álvaro Díaz' },
    { number: 13, name: 'John Buitrago' },
    { number: 14, name: 'Enrique Muñoz' },
    { number: 15, name: 'Didier Buitrago' },
    { number: 16, name: 'Floresmiro Luna' },
    { number: 17, name: 'Leonel Cifuentes' },
    { number: 18, name: 'Marco Solórzano' }
  ],
  'ASISTENTES DE REPORTERÍA': [
    // 4 personas trabajando cada fin de semana: 2 turno AM + 2 turno PM
    // Total de personal para rotación: 8 personas
    // Rotación: cada fin de semana toma 4 consecutivos del pool (2 AM + 2 PM)
    { number: 1, name: 'Johan Moreno' },
    { number: 2, name: 'José Mesa' },
    { number: 3, name: 'Brayan Munera' },
    { number: 4, name: 'Jhonatan Andres Ramirez' },
    { number: 5, name: 'Walter Murillo' },
    { number: 6, name: 'Pablo Preciado' },
    { number: 7, name: 'Brayan Rodríguez' },
    { number: 8, name: 'Camilo Umaña' }
  ],
  'VESTUARIO': [
    { number: 1, name: 'Mercedes Malagón', shift: '08:00-16:00' },
    { number: 2, name: 'Carlos Acosta', shift: '14:00-22:00' },
    { number: 3, name: 'Yineth Tovar', shift: '08:00-16:00' },
    { number: 4, name: 'Dora Rincón', shift: '14:00-22:00' },
    { number: 5, name: 'Mariluz Beltrán', shift: '08:00-16:00' }
  ],
  'MAQUILLAJE': [
    { number: 1, name: 'Ana Villalba', shift: '08:00-16:00' },
    { number: 2, name: 'María Espinosa', shift: '14:00-22:00' },
    { number: 3, name: 'Catalina Acevedo', shift: '08:00-16:00' },
    { number: 4, name: 'Lady Ortiz', shift: '14:00-22:00' },
    { number: 5, name: 'Bibiana González', shift: '08:00-16:00' }
  ]
};

module.exports = { WEEKEND_PERSONNEL_NUMBERED };

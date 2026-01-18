-- backend/database/seeds.sql
-- Datos iniciales para el sistema (versión con TRUNCATE segura)

-- 🔄 Limpiar tablas antes de insertar nuevos datos
TRUNCATE TABLE schedules RESTART IDENTITY CASCADE;
TRUNCATE TABLE novelties RESTART IDENTITY CASCADE;
TRUNCATE TABLE personnel RESTART IDENTITY CASCADE;

-- PRODUCCIÓN
INSERT INTO personnel (name, role, area, current_shift, active) VALUES
('Luis Fajardo', 'Productor de Emisión', 'PRODUCCIÓN', '08:00', true),
('Rocio Ruiz', 'Productor de Emisión', 'PRODUCCIÓN', '08:00', true),
('Marilú Durán', 'Productor de Emisión', 'PRODUCCIÓN', '05:00', true),
('Luis Solano', 'Producción', 'PRODUCCIÓN', '14:00', true),
('Juan Carlos Boada', 'Producción', 'PRODUCCIÓN', '15:00', true),
('Leidy Guzmán', 'Productora', 'PRODUCCIÓN', '08:00', true),

-- ASISTENTES DE PRODUCCIÓN
('Laura Ávila', 'Asistente de producción', 'PRODUCCIÓN', '05:00', true),
('Isabella Rojas', 'Asistente de producción', 'PRODUCCIÓN', '08:00', true),
('Sebastián Arango', 'Asistente de producción', 'PRODUCCIÓN', '15:00', true),
('Nicolle Diaz', 'Asistente de producción', 'PRODUCCIÓN', '08:00', true),
('Angela Cabezas', 'Asistente de producción', 'PRODUCCIÓN', '08:00', true),

-- DIRECTORES DE CÁMARA
('Alejandro La Torre', 'Director de Cámaras', 'DIRECTORES DE CÁMARA', '05:00', true),
('Eduardo Contreras', 'Director de Cámaras', 'DIRECTORES DE CÁMARA', '08:00', true),
('Diego Gamboa', 'Director de Cámaras', 'DIRECTORES DE CÁMARA', '10:00', true),
('Camilo Hernández', 'Director de Cámaras', 'DIRECTORES DE CÁMARA', '14:00', true),
('Andrés Patiño', 'Director de Cámaras', 'DIRECTORES DE CÁMARA', '13:00', true),
('Julián Jiménez', 'Director de Cámaras', 'DIRECTORES DE CÁMARA', '18:00', true),

-- VTR
('David Córdoba', 'Operador de VTR', 'VTR', '05:00', true),
('Alfredo Méndez', 'Operador de VTR', 'VTR', '08:00', true),
('Juan Zorrilla', 'Operador de VTR', 'VTR', '11:00', true),
('Henry Villarraga', 'Operador de VTR', 'VTR', '13:00', true),
('William Aldana', 'Operador de VTR', 'VTR', '17:00', true),

-- OPERADOR DE VMIX Y PANTALLAS
('Sofía Fajardo', 'Operador de Vmix', 'OPERADOR DE VMIX Y PANTALLAS', '05:00', true),
('Ronald Ortiz', 'Operador de Vmix', 'OPERADOR DE VMIX Y PANTALLAS', '11:00', true),
('Kevin Fonseca', 'Operador de Vmix', 'OPERADOR DE VMIX Y PANTALLAS', '13:00', true),
('Vanesa Castañeda', 'Operador de Vmix', 'OPERADOR DE VMIX Y PANTALLAS', '17:00', true),
('Dary Segura', 'Operador de Pantallas', 'OPERADOR DE VMIX Y PANTALLAS', '05:00', true),
('Leidy Salazar', 'Operador de Pantallas', 'OPERADOR DE VMIX Y PANTALLAS', '11:00', true),
('Paola Borrero', 'Operador de Pantallas', 'OPERADOR DE VMIX Y PANTALLAS', '17:00', true),
('Ashlei Montero', 'Operador de Pantallas', 'OPERADOR DE VMIX Y PANTALLAS', '14:00', true),

-- GENERADORES DE CARACTERES
('Maria Jose Escobar', 'Generador de Caracteres', 'GENERADORES DE CARACTERES', '05:00', true),
('Diana Ospina', 'Generador de Caracteres', 'GENERADORES DE CARACTERES', '08:00', true),
('Santiago Rico', 'Generador de Caracteres', 'GENERADORES DE CARACTERES', '10:00', true),
('Santiago Ortiz', 'Generador de Caracteres', 'GENERADORES DE CARACTERES', '14:00', true),
('María Suárez', 'Generador de Caracteres', 'GENERADORES DE CARACTERES', '13:00', true),
('Dayana Rodríguez', 'Generador de Caracteres', 'GENERADORES DE CARACTERES', '18:00', true),

-- OPERADORES DE AUDIO
('Oscar Bernal', 'Operador consola de sonido', 'OPERADORES DE AUDIO', '05:00', true),
('Lenin Gutiérrez', 'Operador consola de sonido', 'OPERADORES DE AUDIO', '08:00', true),
('Harold Barrero', 'Operador consola de sonido', 'OPERADORES DE AUDIO', '11:00', true),
('Jhon Valencia', 'Operador consola de sonido', 'OPERADORES DE AUDIO', '13:00', true),
('Wilmar Matiz', 'Operador consola de sonido', 'OPERADORES DE AUDIO', '17:00', true),

-- ASISTENTES DE AUDIO
('Jaime Rueda', 'Asistente de sonido', 'OPERADORES DE AUDIO', '05:00', true),
('Marcela Vélez', 'Asistente de sonido', 'OPERADORES DE AUDIO', '11:00', true),
('Wilson Cano', 'Asistente de sonido', 'OPERADORES DE AUDIO', '11:00', true),
('Luis Fonseca', 'Asistente de sonido', 'OPERADORES DE AUDIO', '15:00', true),
('Jimmy Estupiñán', 'Asistente de sonido', 'OPERADORES DE AUDIO', '17:00', true),

-- OPERADORES DE PROMPTER
('Lina Rodríguez', 'Operador de teleprompter', 'OPERADORES DE PROMPTER', '05:00', true),
('Duván Díaz', 'Operador de teleprompter', 'OPERADORES DE PROMPTER', '11:00', true),
('Katherine Montoya', 'Operador de teleprompter', 'OPERADORES DE PROMPTER', '13:00', true),
('Kevin Alejandro Lerma', 'Operador de teleprompter', 'OPERADORES DE PROMPTER', '17:00', true),

-- CAMARÓGRAFOS DE ESTUDIO
('Oscar González', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '05:00', true),
('Juan Sacristán', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '05:00', true),
('Cesar Jimenez', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '05:00', true),
('John Jiménez', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '05:00', true),
('John Loaiza', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '05:00', true),
('Angel Zapata', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '05:00', true),
('Alexander Quiñonez', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '10:00', true),
('Pedro Niño', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '11:00', true),
('Jefferson Pérez', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '11:00', true),
('William Mosquera', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '11:00', true),
('John Daminston', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '11:00', true),
('Samuel Romero', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '14:00', true),
('Luis Bernal', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '13:00', true),
('Ernesto Corchuelo', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '13:00', true),
('Jorge Jaramillo', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '13:00', true),
('Carlos García', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '13:00', true),
('Andrés López', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '17:00', true),
('Carlos López', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '17:00', true),
('Sebastián Hernández', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '17:00', true),
('Raul Ramírez', 'Camarógrafo de estudio', 'CAMARÓGRAFOS DE ESTUDIO', '17:00', true),

--ASISTENTES DE ESTUDIO
('José Peña', 'Asistente de estudio', 'ASISTENTES DE ESTUDIO', '05:00', true),
('Carlos Orlando Espinel', 'Asistente de estudio', 'ASISTENTES DE ESTUDIO', '11:00', true),
('Diego González', 'Asistente de estudio', 'ASISTENTES DE ESTUDIO', '11:00', true),
('Rodolfo Saldaña', 'Asistente de estudio', 'ASISTENTES DE ESTUDIO', '17:00', true),
('Julio Vega', 'Asistente de estudio', 'ASISTENTES DE ESTUDIO', '15:00', true),

-- COORDINADOR ESTUDIO
('Diego Zambrano', 'Coordinador estudio', 'COORDINADOR ESTUDIO', '05:00', true),

-- ESCENOGRAFÍA
('Jacson Urrego', 'Asistente de Escenografía', 'ESCENOGRAFÍA', '05:00', true),
('Rafael López', 'Asistente de Escenografía', 'ESCENOGRAFÍA', '11:00', true),
('Néstor Peña', 'Asistente de Escenografía', 'ESCENOGRAFÍA', '17:00', true),
('John Forero', 'Asistente de Escenografía', 'ESCENOGRAFÍA', '17:00', true),
('Marco Rivera', 'Asistente de Escenografía', 'ESCENOGRAFÍA', '07:00', true),
('Joaquín Alonso', 'Escenógrafo', 'ESCENOGRAFÍA', '07:00', true),

-- ASISTENTES DE LUCES
('Santiago Espinosa', 'Asistente de luces', 'ASISTENTES DE LUCES', '05:00', true),
('Jaiver Galeano', 'Asistente de luces', 'ASISTENTES DE LUCES', '05:00', true),
('Santiago Torres', 'Asistente de luces', 'ASISTENTES DE LUCES', '12:00', true),
('Julio López', 'Asistente de luces', 'ASISTENTES DE LUCES', '17:00', true),

-- OPERADORES DE VIDEO
('Leonardo Castro', 'Operador de video', 'OPERADORES DE VIDEO', '05:00', true),
('Iván Aristizábal', 'Operador de video', 'OPERADORES DE VIDEO', '10:00', true),
('Pedro Torres', 'Operador de video', 'OPERADORES DE VIDEO', '14:00', true),
('Horacio Suárez', 'Operador de video', 'OPERADORES DE VIDEO', '18:00', true),

-- CONTRIBUCIONES
('Adrian Contreras', 'Contribuciones', 'CONTRIBUCIONES', '05:00', true),
('Michael Torres', 'Contribuciones', 'CONTRIBUCIONES', '11:00', true),
('Carolina Benavides', 'Contribuciones', 'CONTRIBUCIONES', '17:00', true),

-- CAMARÓGRAFOS DE REPORTERÍA
('Álvaro Díaz', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '06:00', true),
('Victor Vargas', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '06:00', true),
('Erick Velásquez', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '18:00', true),
('Andrés Ramírez', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '06:00', true),
('Edgar Castillo', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '05:00', true),
('Marco Solórzano', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '06:00', true),
('Ramiro Balaguera', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '06:00', true),
('Leonel Cifuentes', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '06:00', true),
('Didier Buitrago', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '06:00', true),
('William Ruiz', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '13:00', true),
('Carlos Wilches', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '13:00', true),
('Cesar Morales', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '13:00', true),
('Julián Luna', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '06:00', true),
('Enrique Muñoz', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '15:00', true),
('William Uribe', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '13:00', true),
('John Buitrago', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '13:00', true),
('Floresmiro Luna', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '06:00', true),
('Edgar Nieto', 'Camarógrafo de reportería', 'CAMARÓGRAFOS DE REPORTERÍA', '06:00', true),

--REALIZADORES
('Óscar Ortega', 'Realizador', 'REALIZADORES', '08:00', true),
('Laura Vargas', 'Realizador', 'REALIZADORES', '08:00', true),
('Alexander Valencia', 'Realizador', 'REALIZADORES', '08:00', true),
('Guillermo Solarte', 'Realizador', 'REALIZADORES', '08:00', true),
('Wílmer Salamanca', 'Realizador', 'REALIZADORES', '13:00', true),
('David Patarroyo', 'Realizador', 'REALIZADORES', '13:00', true),

--ASISTENTES DE REPORTERÍA
('Brayan Rodríguez', 'Asistente de reportería', 'ASISTENTES DE REPORTERÍA', '06:00', true),
('Camilo Umaña', 'Asistente de reportería', 'ASISTENTES DE REPORTERÍA', '06:00', true),
('Brayan Munera', 'Asistente de Reportería', 'ASISTENTES DE REPORTERÍA', '06:00', true),
('Pablo Preciado', 'Asistente de reportería', 'ASISTENTES DE REPORTERÍA', '06:00', true),
('Walter Murillo', 'Asistente de reportería', 'ASISTENTES DE REPORTERÍA', '06:00', true),
('Johan Moreno', 'Asistente de reportería', 'ASISTENTES DE REPORTERÍA', '13:00', true),
('Jhonatan Andres Ramirez', 'Asistente de reportería', 'ASISTENTES DE REPORTERÍA', '13:00', true),
('José Mesa', 'Asistente de reportería', 'ASISTENTES DE REPORTERÍA', '13:00', true),

-- VESTUARIO
('Yineth Tovar', 'Vestuario', 'VESTUARIO', '05:00', true),
('Dora Rincón', 'Vestuario', 'VESTUARIO', '10:00', true),
('Mercedes Malagón', 'Vestuario', 'VESTUARIO', '11:00', true),
('Carlos Acosta', 'Vestuario', 'VESTUARIO', '16:00', true),
('Mariluz Beltrán', 'Vestuario', 'VESTUARIO', '17:00', true),

-- MAQUILLAJE
('Lady Ortiz', 'Maquillaje', 'MAQUILLAJE', '05:00', true),
('Catalina Acevedo', 'Maquillaje', 'MAQUILLAJE', '11:00', true),
('María Espinosa', 'Maquillaje', 'MAQUILLAJE', '17:00', true),
('Bibiana González', 'Maquillaje', 'MAQUILLAJE', '08:00', true),
('Ana Villalba', 'Maquillaje', 'MAQUILLAJE', '08:00', true)
;
-- (continúa igual...)

-- NOVEDADES DE PRUEBA
INSERT INTO novelties (personnel_id, date, type, description)
VALUES
(1, CURRENT_DATE - INTERVAL '2 days', 'Incapacidad', 'Reposo médico 3 días'),
(5, CURRENT_DATE - INTERVAL '1 day', 'Retraso', 'Llegada tardía por tráfico'),
(10, CURRENT_DATE, 'Sin contrato', 'Contrato vencido temporalmente');

-- PROGRAMACIÓN DE PRUEBA
INSERT INTO schedules (personnel_id, date, program, shift_time, location, notes)
VALUES
(1, CURRENT_DATE, 'Noticiero 6AM', 'Mañana', 'Estudio A', 'Emisión principal'),
(2, CURRENT_DATE, 'Magazine Cultural', 'Tarde', 'Estudio B', 'Turno especial'),
(3, CURRENT_DATE + INTERVAL '1 day', 'Noticias Noche', 'Noche', 'Estudio A', 'Turno nocturno');



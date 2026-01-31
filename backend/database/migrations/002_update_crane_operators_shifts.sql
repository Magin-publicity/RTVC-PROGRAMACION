-- Migración: Reorganizar turnos de Operadores de Grúa
-- Fecha: 2026-01-29
-- Propósito: Organizar operadores de grúa en 4 grupos por horario para facilitar relevos

-- GRUPO 1 (05:00 - 11:00): 1 operador
UPDATE personnel
SET current_shift = '05:00'
WHERE name = 'Carlos García'
  AND area = 'CAMARÓGRAFOS DE ESTUDIO';

-- GRUPO 2 (09:00 - 15:00): 2 operadores
UPDATE personnel
SET current_shift = '09:00'
WHERE name IN ('John Loaiza', 'Luis Bernal')
  AND area = 'CAMARÓGRAFOS DE ESTUDIO';

-- GRUPO 3 (13:00 - 19:00): 2 operadores
UPDATE personnel
SET current_shift = '13:00'
WHERE name IN ('Raul Ramírez', 'Jefferson Pérez')
  AND area = 'CAMARÓGRAFOS DE ESTUDIO';

-- GRUPO 4 (16:00 - 22:00): 1 operador
UPDATE personnel
SET current_shift = '16:00'
WHERE name = 'Carlos López'
  AND area = 'CAMARÓGRAFOS DE ESTUDIO';

-- Verificar cambios
SELECT
  name,
  current_shift as turno_actualizado,
  area
FROM personnel
WHERE name IN (
  'Carlos García',
  'John Loaiza',
  'Luis Bernal',
  'Raul Ramírez',
  'Jefferson Pérez',
  'Carlos López'
)
AND area = 'CAMARÓGRAFOS DE ESTUDIO'
ORDER BY current_shift, name;

-- Migración: Sistema de Grupos Fijos para Reportería
-- Grupo A: 08:00-13:00 (9 camarógrafos + sus asistentes)
-- Grupo B: 13:00-20:00 (9 camarógrafos + sus asistentes)

-- 1. Actualizar campo turno para que sea más específico
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS grupo_reporteria VARCHAR(10);

COMMENT ON COLUMN personnel.grupo_reporteria IS 'Grupo fijo de reportería: GRUPO_A (08:00-13:00) o GRUPO_B (13:00-20:00)';

-- 2. Asignar camarógrafos a grupos
-- GRUPO A: Primeros 9 camarógrafos (08:00-13:00)
WITH camarografos_ordenados AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) as rn
  FROM personnel
  WHERE area = 'CAMARÓGRAFOS DE REPORTERÍA' AND active = true
)
UPDATE personnel
SET grupo_reporteria = 'GRUPO_A',
    turno = 'MAÑANA'
WHERE id IN (
  SELECT id FROM camarografos_ordenados WHERE rn <= 9
);

-- GRUPO B: Siguientes 9 camarógrafos (13:00-20:00)
WITH camarografos_ordenados AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) as rn
  FROM personnel
  WHERE area = 'CAMARÓGRAFOS DE REPORTERÍA' AND active = true
)
UPDATE personnel
SET grupo_reporteria = 'GRUPO_B',
    turno = 'TARDE'
WHERE id IN (
  SELECT id FROM camarografos_ordenados WHERE rn > 9 AND rn <= 18
);

-- 3. Asignar asistentes a grupos
-- GRUPO A: Primeros 4 asistentes (08:00-13:00)
WITH asistentes_ordenados AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) as rn
  FROM personnel
  WHERE area = 'ASISTENTES DE REPORTERÍA' AND active = true
)
UPDATE personnel
SET grupo_reporteria = 'GRUPO_A',
    turno = 'MAÑANA'
WHERE id IN (
  SELECT id FROM asistentes_ordenados WHERE rn <= 4
);

-- GRUPO B: Siguientes 4 asistentes (13:00-20:00)
WITH asistentes_ordenados AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) as rn
  FROM personnel
  WHERE area = 'ASISTENTES DE REPORTERÍA' AND active = true
)
UPDATE personnel
SET grupo_reporteria = 'GRUPO_B',
    turno = 'TARDE'
WHERE id IN (
  SELECT id FROM asistentes_ordenados WHERE rn > 4 AND rn <= 8
);

-- 4. Crear tabla para espacios de salida predefinidos
CREATE TABLE IF NOT EXISTS reporteria_espacios_salida (
  id SERIAL PRIMARY KEY,
  personnel_id INTEGER REFERENCES personnel(id) ON DELETE CASCADE,
  numero_espacio INTEGER CHECK (numero_espacio IN (1, 2, 3)),
  fecha DATE NOT NULL,
  hora_salida TIME,
  hora_llegada TIME,
  conductor VARCHAR(255),
  periodista VARCHAR(255),
  ubicacion VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(personnel_id, fecha, numero_espacio)
);

COMMENT ON TABLE reporteria_espacios_salida IS 'Espacios de salida predefinidos (3 por empleado por día) para evitar duplicados';
COMMENT ON COLUMN reporteria_espacios_salida.numero_espacio IS 'Número del espacio de salida: 1, 2 o 3';

CREATE INDEX idx_espacios_fecha ON reporteria_espacios_salida(fecha);
CREATE INDEX idx_espacios_personnel ON reporteria_espacios_salida(personnel_id);

-- 5. Verificar asignación de grupos
SELECT
  area,
  grupo_reporteria,
  turno,
  COUNT(*) as cantidad,
  STRING_AGG(name, ', ' ORDER BY name) as personal
FROM personnel
WHERE area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
  AND active = true
GROUP BY area, grupo_reporteria, turno
ORDER BY area, grupo_reporteria;

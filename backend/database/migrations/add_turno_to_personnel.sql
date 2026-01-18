-- Agregar campo turno a la tabla personnel
-- Turno puede ser 'mañana' (8:00-13:00) o 'tarde' (13:00-20:00)

ALTER TABLE personnel ADD COLUMN IF NOT EXISTS turno VARCHAR(20) DEFAULT 'mañana';

-- Comentario en la columna
COMMENT ON COLUMN personnel.turno IS 'Turno de trabajo: mañana (8:00-13:00) o tarde (13:00-20:00)';

-- Índice para búsquedas por turno
CREATE INDEX IF NOT EXISTS idx_personnel_turno ON personnel(turno);

-- Actualizar registros existentes para distribuir equitativamente entre turnos
-- La mitad se queda en mañana, la otra mitad pasa a tarde
WITH numbered_personnel AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY area ORDER BY id) as row_num,
         COUNT(*) OVER (PARTITION BY area) as total_count
  FROM personnel
  WHERE area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA', 'REALIZADORES DE TELEVISIÓN')
)
UPDATE personnel
SET turno = 'tarde'
WHERE id IN (
  SELECT id
  FROM numbered_personnel
  WHERE row_num > CEILING(total_count::numeric / 2)
);

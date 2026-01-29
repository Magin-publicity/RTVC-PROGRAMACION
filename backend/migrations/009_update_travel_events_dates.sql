-- Migración para actualizar travel_events: cambiar 'date' a 'start_date' y 'end_date'

-- 0. Eliminar la vista primero (para evitar dependencias con columna 'date')
DROP VIEW IF EXISTS travel_events_with_details;

-- 1. Agregar las nuevas columnas
ALTER TABLE travel_events
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- 2. Migrar datos existentes (si hay)
UPDATE travel_events
SET start_date = date, end_date = date
WHERE start_date IS NULL;

-- 3. Hacer las columnas NOT NULL
ALTER TABLE travel_events
ALTER COLUMN start_date SET NOT NULL,
ALTER COLUMN end_date SET NOT NULL;

-- 4. Eliminar la columna antigua 'date'
ALTER TABLE travel_events DROP COLUMN IF EXISTS date;

-- 5. Eliminar índice antiguo y crear nuevos
DROP INDEX IF EXISTS idx_travel_events_date;
CREATE INDEX IF NOT EXISTS idx_travel_events_start_date ON travel_events(start_date);
CREATE INDEX IF NOT EXISTS idx_travel_events_end_date ON travel_events(end_date);
CREATE INDEX IF NOT EXISTS idx_travel_events_date_range ON travel_events(start_date, end_date);

-- 6. Recrear la vista con las nuevas columnas
CREATE VIEW travel_events_with_details AS
SELECT
  te.id,
  te.start_date,
  te.end_date,
  te.event_name,
  te.event_type,
  te.destination,
  te.departure_time,
  te.estimated_return,
  te.status,
  te.description,
  te.created_at,
  -- Contar personal
  COUNT(DISTINCT tep.id) as personnel_count,
  -- Contar equipos
  COUNT(DISTINCT tee.id) as equipment_count,
  -- Arrays de personal y equipos (PostgreSQL JSON)
  json_agg(DISTINCT jsonb_build_object(
    'personnel_id', tep.personnel_id,
    'name', tep.personnel_name,
    'role', tep.role
  )) FILTER (WHERE tep.id IS NOT NULL) as personnel,
  json_agg(DISTINCT jsonb_build_object(
    'equipment_type', tee.equipment_type,
    'reference', tee.equipment_reference
  )) FILTER (WHERE tee.id IS NOT NULL) as equipment
FROM travel_events te
LEFT JOIN travel_event_personnel tep ON te.id = tep.travel_event_id
LEFT JOIN travel_event_equipment tee ON te.id = tee.travel_event_id
GROUP BY te.id, te.start_date, te.end_date, te.event_name, te.event_type, te.destination,
         te.departure_time, te.estimated_return, te.status, te.description, te.created_at;

COMMENT ON VIEW travel_events_with_details IS 'Vista consolidada de comisiones con personal y equipos (con rango de fechas)';

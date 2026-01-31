-- Migración 010: Añadir columnas para viajes largos en despachos
-- Fecha: 2026-01-31
-- Descripción: Añade fecha_inicio, fecha_fin y destino para manejar despachos de varios días

-- Añadir columnas nuevas
ALTER TABLE press_dispatches
ADD COLUMN IF NOT EXISTS fecha_inicio DATE,
ADD COLUMN IF NOT EXISTS fecha_fin DATE,
ADD COLUMN IF NOT EXISTS destino TEXT;

-- Migrar datos existentes: usar la columna 'date' como fecha_inicio y fecha_fin
UPDATE press_dispatches
SET fecha_inicio = date,
    fecha_fin = date,
    destino = destination
WHERE fecha_inicio IS NULL;

-- Hacer las columnas NOT NULL después de migrar datos
ALTER TABLE press_dispatches
ALTER COLUMN fecha_inicio SET NOT NULL,
ALTER COLUMN fecha_fin SET NOT NULL;

-- Añadir constraint para asegurar que fecha_fin >= fecha_inicio
ALTER TABLE press_dispatches
ADD CONSTRAINT check_fecha_fin_after_inicio
CHECK (fecha_fin >= fecha_inicio);

-- Crear índice para búsquedas de rangos de fechas
CREATE INDEX IF NOT EXISTS idx_press_dispatches_date_range
ON press_dispatches(fecha_inicio, fecha_fin);

-- Comentarios
COMMENT ON COLUMN press_dispatches.fecha_inicio IS 'Fecha de inicio del despacho (para viajes largos)';
COMMENT ON COLUMN press_dispatches.fecha_fin IS 'Fecha de fin del despacho (para viajes largos)';
COMMENT ON COLUMN press_dispatches.destino IS 'Destino del despacho (duplicado de destination para claridad)';

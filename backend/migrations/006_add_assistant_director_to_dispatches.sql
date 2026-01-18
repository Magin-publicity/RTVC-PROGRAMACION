-- Migración para agregar Asistentes de Reportería y Realizadores al módulo de despachos

-- Agregar campos para Asistente de Reportería
ALTER TABLE press_dispatches
ADD COLUMN IF NOT EXISTS assistant_id INTEGER REFERENCES personnel(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assistant_name VARCHAR(255);

-- Agregar campos para Realizador/Director
ALTER TABLE press_dispatches
ADD COLUMN IF NOT EXISTS director_id INTEGER REFERENCES personnel(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS director_name VARCHAR(255);

-- Comentarios para documentación
COMMENT ON COLUMN press_dispatches.assistant_id IS 'ID del asistente de reportería asignado';
COMMENT ON COLUMN press_dispatches.assistant_name IS 'Nombre del asistente de reportería';
COMMENT ON COLUMN press_dispatches.director_id IS 'ID del realizador/director asignado';
COMMENT ON COLUMN press_dispatches.director_name IS 'Nombre del realizador/director';

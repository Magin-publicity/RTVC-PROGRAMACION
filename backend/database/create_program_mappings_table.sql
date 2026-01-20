-- Tabla para almacenar las asignaciones de Estudio/Master a Programas
CREATE TABLE IF NOT EXISTS program_mappings (
  program_id INTEGER PRIMARY KEY,
  studio_resource INTEGER,
  master_resource INTEGER,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_program_mappings_updated
ON program_mappings(updated_at DESC);

-- Comentarios para documentación
COMMENT ON TABLE program_mappings IS 'Asignaciones de recursos de Estudio y Master para cada programa';
COMMENT ON COLUMN program_mappings.program_id IS 'ID del programa (debe coincidir con programs.js)';
COMMENT ON COLUMN program_mappings.studio_resource IS 'Número de recurso de Estudio asignado';
COMMENT ON COLUMN program_mappings.master_resource IS 'Número de recurso de Master asignado';
COMMENT ON COLUMN program_mappings.updated_at IS 'Última actualización de la asignación';
COMMENT ON COLUMN program_mappings.created_at IS 'Fecha de creación de la asignación';

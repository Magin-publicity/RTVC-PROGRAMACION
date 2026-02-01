-- Migración 011: Multiselección de personal y retorno de conductor
-- Fecha: 2026-01-31
-- Descripción: Permite múltiples camarógrafos/asistentes por despacho y gestiona retorno de conductor

-- 1. Crear tabla de relación personal-despacho (many-to-many)
CREATE TABLE IF NOT EXISTS press_dispatch_personnel (
  id SERIAL PRIMARY KEY,
  dispatch_id INTEGER NOT NULL REFERENCES press_dispatches(id) ON DELETE CASCADE,
  personnel_id INTEGER NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'CAMERAMAN', 'ASSISTANT', 'SUPPORT'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(dispatch_id, personnel_id, role)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_dispatch_personnel_dispatch ON press_dispatch_personnel(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_personnel_person ON press_dispatch_personnel(personnel_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_personnel_role ON press_dispatch_personnel(role);

-- 2. Añadir campo para indicar si conductor/vehículo retornan
ALTER TABLE press_dispatches
ADD COLUMN IF NOT EXISTS conductor_retorna BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hora_retorno_conductor TIME;

-- 3. Comentarios
COMMENT ON TABLE press_dispatch_personnel IS 'Relación many-to-many entre despachos y personal (camarógrafos, asistentes, personal de apoyo)';
COMMENT ON COLUMN press_dispatch_personnel.role IS 'Rol del personal en el despacho: CAMERAMAN, ASSISTANT, SUPPORT';
COMMENT ON COLUMN press_dispatches.conductor_retorna IS 'Indica si el conductor y vehículo retornan al canal después de dejar al personal';
COMMENT ON COLUMN press_dispatches.hora_retorno_conductor IS 'Hora estimada de retorno del conductor (calculada: hora_salida + 1h)';

-- 4. Migrar datos existentes de cameraman_id y assistant_id a la nueva tabla
-- Solo si tienen valores no nulos
INSERT INTO press_dispatch_personnel (dispatch_id, personnel_id, role)
SELECT id, cameraman_id, 'CAMERAMAN'
FROM press_dispatches
WHERE cameraman_id IS NOT NULL
ON CONFLICT (dispatch_id, personnel_id, role) DO NOTHING;

INSERT INTO press_dispatch_personnel (dispatch_id, personnel_id, role)
SELECT id, assistant_id, 'ASSISTANT'
FROM press_dispatches
WHERE assistant_id IS NOT NULL
ON CONFLICT (dispatch_id, personnel_id, role) DO NOTHING;

-- 5. Nota: NO eliminamos las columnas antiguas (cameraman_id, assistant_id) aún
-- para mantener compatibilidad durante la transición

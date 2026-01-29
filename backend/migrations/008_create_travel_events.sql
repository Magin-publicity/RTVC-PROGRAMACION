-- Migración para módulo de Gestión de VIAJES & EVENTOS

-- ========================================
-- TABLA: travel_events (Comisiones de Viaje y Eventos)
-- ========================================
CREATE TABLE IF NOT EXISTS travel_events (
  id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL, -- Fecha de inicio del viaje/evento
  end_date DATE NOT NULL, -- Fecha de fin del viaje/evento
  event_name VARCHAR(255) NOT NULL, -- Nombre del evento o viaje
  event_type VARCHAR(50) NOT NULL, -- VIAJE_FUERA_CIUDAD, VIAJE_LOCAL, EVENTO
  destination TEXT NOT NULL, -- Destino o ubicación
  departure_time TIME, -- Hora de salida
  estimated_return TIME, -- Hora estimada de regreso
  status VARCHAR(50) DEFAULT 'PROGRAMADO', -- PROGRAMADO, EN_CURSO, FINALIZADO, CANCELADO
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- ========================================
-- TABLA: travel_event_personnel (Personal asignado a comisiones)
-- ========================================
CREATE TABLE IF NOT EXISTS travel_event_personnel (
  id SERIAL PRIMARY KEY,
  travel_event_id INTEGER REFERENCES travel_events(id) ON DELETE CASCADE,
  personnel_id INTEGER REFERENCES personnel(id) ON DELETE CASCADE,
  personnel_name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL, -- Rol en la comisión (Cámara, Asistente, Periodista, etc.)
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(travel_event_id, personnel_id)
);

-- ========================================
-- TABLA: travel_event_equipment (Equipos asignados a comisiones)
-- ========================================
CREATE TABLE IF NOT EXISTS travel_event_equipment (
  id SERIAL PRIMARY KEY,
  travel_event_id INTEGER REFERENCES travel_events(id) ON DELETE CASCADE,
  equipment_type VARCHAR(50) NOT NULL, -- LIVEU, CAMARA, MICROFONO, etc.
  equipment_reference VARCHAR(100), -- Ej: LU-001, CAM-005
  liveu_id INTEGER REFERENCES liveu_equipment(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABLA: travel_event_reliefs (Relevos generados por viajes)
-- ========================================
-- Cuando una Dupla de Reportería sale de viaje, libera su puesto en Estudio
CREATE TABLE IF NOT EXISTS travel_event_reliefs (
  id SERIAL PRIMARY KEY,
  travel_event_id INTEGER REFERENCES travel_events(id) ON DELETE CASCADE,
  original_personnel_id INTEGER REFERENCES personnel(id) ON DELETE CASCADE,
  original_assignment_type VARCHAR(100) NOT NULL, -- Ej: ESTUDIO_5, REPORTERIA_DUPLA
  relieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_travel_events_start_date ON travel_events(start_date);
CREATE INDEX idx_travel_events_end_date ON travel_events(end_date);
CREATE INDEX idx_travel_events_date_range ON travel_events(start_date, end_date);
CREATE INDEX idx_travel_events_status ON travel_events(status);
CREATE INDEX idx_travel_events_type ON travel_events(event_type);
CREATE INDEX idx_travel_event_personnel_event ON travel_event_personnel(travel_event_id);
CREATE INDEX idx_travel_event_personnel_person ON travel_event_personnel(personnel_id);
CREATE INDEX idx_travel_event_equipment_event ON travel_event_equipment(travel_event_id);
CREATE INDEX idx_travel_event_reliefs_event ON travel_event_reliefs(travel_event_id);

-- Triggers para actualizar updated_at
CREATE TRIGGER update_travel_events_modtime
    BEFORE UPDATE ON travel_events
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Comentarios para documentación
COMMENT ON TABLE travel_events IS 'Registro de comisiones de viaje y eventos con personal asignado';
COMMENT ON TABLE travel_event_personnel IS 'Personal asignado a cada comisión de viaje/evento';
COMMENT ON TABLE travel_event_equipment IS 'Equipos (LiveU, cámaras) asignados a comisiones';
COMMENT ON TABLE travel_event_reliefs IS 'Registro de relevos automáticos cuando personal de dupla sale de viaje';

-- ========================================
-- VISTA: travel_events_with_details
-- ========================================
-- Vista consolidada con toda la información de una comisión
CREATE OR REPLACE VIEW travel_events_with_details AS
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

COMMENT ON VIEW travel_events_with_details IS 'Vista consolidada de comisiones con personal y equipos';

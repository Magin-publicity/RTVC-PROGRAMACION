-- Migración para Sistema de Despacho Inteligente con LiveU y Estado Logístico

-- ========================================
-- TABLA: liveu_equipment (Equipos LiveU)
-- ========================================
CREATE TABLE IF NOT EXISTS liveu_equipment (
  id SERIAL PRIMARY KEY,
  equipment_code VARCHAR(50) UNIQUE NOT NULL, -- Ej: LU-001, LU-002
  serial_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'DISPONIBLE', -- DISPONIBLE, EN_TERRENO, REPARACION, MANTENIMIENTO
  notes TEXT,
  last_maintenance DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para liveu_equipment
CREATE INDEX idx_liveu_status ON liveu_equipment(status);
CREATE INDEX idx_liveu_active ON liveu_equipment(is_active);

-- ========================================
-- TABLA: personnel_logistics_status (Estado Logístico del Personal)
-- ========================================
-- Esta tabla NO modifica horarios ni rotaciones, solo controla ubicación física
CREATE TABLE IF NOT EXISTS personnel_logistics_status (
  id SERIAL PRIMARY KEY,
  personnel_id INTEGER REFERENCES personnel(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  logistics_status VARCHAR(50) DEFAULT 'EN_CANAL', -- EN_CANAL, EN_TERRENO, DESCANSO
  dispatch_id INTEGER REFERENCES press_dispatches(id) ON DELETE SET NULL, -- Vincula con el despacho actual
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(personnel_id, date)
);

-- Índices para personnel_logistics_status
CREATE INDEX idx_logistics_date ON personnel_logistics_status(date);
CREATE INDEX idx_logistics_status ON personnel_logistics_status(logistics_status);
CREATE INDEX idx_logistics_personnel ON personnel_logistics_status(personnel_id, date);

-- ========================================
-- MODIFICACIONES A press_dispatches
-- ========================================
-- Agregar campo para LiveU asignado
ALTER TABLE press_dispatches
ADD COLUMN IF NOT EXISTS liveu_id INTEGER REFERENCES liveu_equipment(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS liveu_code VARCHAR(50);

-- ========================================
-- INSERTAR EQUIPOS LIVEU INICIALES (11 unidades)
-- ========================================
INSERT INTO liveu_equipment (equipment_code, serial_number, status) VALUES
  ('LU-001', 'SN-20231001', 'DISPONIBLE'),
  ('LU-002', 'SN-20231002', 'DISPONIBLE'),
  ('LU-003', 'SN-20231003', 'DISPONIBLE'),
  ('LU-004', 'SN-20231004', 'DISPONIBLE'),
  ('LU-005', 'SN-20231005', 'DISPONIBLE'),
  ('LU-006', 'SN-20231006', 'DISPONIBLE'),
  ('LU-007', 'SN-20231007', 'DISPONIBLE'),
  ('LU-008', 'SN-20231008', 'DISPONIBLE'),
  ('LU-009', 'SN-20231009', 'DISPONIBLE'),
  ('LU-010', 'SN-20231010', 'DISPONIBLE'),
  ('LU-011', 'SN-20231011', 'DISPONIBLE')
ON CONFLICT (equipment_code) DO NOTHING;

-- ========================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- ========================================

-- Trigger para actualizar updated_at en liveu_equipment
CREATE TRIGGER update_liveu_equipment_modtime
    BEFORE UPDATE ON liveu_equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Trigger para actualizar updated_at en personnel_logistics_status
CREATE TRIGGER update_logistics_status_modtime
    BEFORE UPDATE ON personnel_logistics_status
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- ========================================
-- FUNCIÓN: Sincronizar estado logístico al crear/actualizar despacho
-- ========================================
CREATE OR REPLACE FUNCTION sync_logistics_on_dispatch()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar estado del periodista
  IF NEW.journalist_id IS NOT NULL THEN
    INSERT INTO personnel_logistics_status (personnel_id, date, logistics_status, dispatch_id)
    VALUES (NEW.journalist_id, NEW.date,
      CASE
        WHEN NEW.status IN ('EN_RUTA', 'PROGRAMADO') THEN 'EN_TERRENO'
        WHEN NEW.status = 'FINALIZADO' THEN 'EN_CANAL'
        ELSE 'EN_CANAL'
      END,
      NEW.id)
    ON CONFLICT (personnel_id, date)
    DO UPDATE SET
      logistics_status = CASE
        WHEN NEW.status IN ('EN_RUTA', 'PROGRAMADO') THEN 'EN_TERRENO'
        WHEN NEW.status = 'FINALIZADO' THEN 'EN_CANAL'
        ELSE 'EN_CANAL'
      END,
      dispatch_id = NEW.id,
      updated_at = CURRENT_TIMESTAMP;
  END IF;

  -- Actualizar estado del camarógrafo
  IF NEW.cameraman_id IS NOT NULL THEN
    INSERT INTO personnel_logistics_status (personnel_id, date, logistics_status, dispatch_id)
    VALUES (NEW.cameraman_id, NEW.date,
      CASE
        WHEN NEW.status IN ('EN_RUTA', 'PROGRAMADO') THEN 'EN_TERRENO'
        WHEN NEW.status = 'FINALIZADO' THEN 'EN_CANAL'
        ELSE 'EN_CANAL'
      END,
      NEW.id)
    ON CONFLICT (personnel_id, date)
    DO UPDATE SET
      logistics_status = CASE
        WHEN NEW.status IN ('EN_RUTA', 'PROGRAMADO') THEN 'EN_TERRENO'
        WHEN NEW.status = 'FINALIZADO' THEN 'EN_CANAL'
        ELSE 'EN_CANAL'
      END,
      dispatch_id = NEW.id,
      updated_at = CURRENT_TIMESTAMP;
  END IF;

  -- Actualizar estado del asistente
  IF NEW.assistant_id IS NOT NULL THEN
    INSERT INTO personnel_logistics_status (personnel_id, date, logistics_status, dispatch_id)
    VALUES (NEW.assistant_id, NEW.date,
      CASE
        WHEN NEW.status IN ('EN_RUTA', 'PROGRAMADO') THEN 'EN_TERRENO'
        WHEN NEW.status = 'FINALIZADO' THEN 'EN_CANAL'
        ELSE 'EN_CANAL'
      END,
      NEW.id)
    ON CONFLICT (personnel_id, date)
    DO UPDATE SET
      logistics_status = CASE
        WHEN NEW.status IN ('EN_RUTA', 'PROGRAMADO') THEN 'EN_TERRENO'
        WHEN NEW.status = 'FINALIZADO' THEN 'EN_CANAL'
        ELSE 'EN_CANAL'
      END,
      dispatch_id = NEW.id,
      updated_at = CURRENT_TIMESTAMP;
  END IF;

  -- Actualizar estado del realizador
  IF NEW.director_id IS NOT NULL THEN
    INSERT INTO personnel_logistics_status (personnel_id, date, logistics_status, dispatch_id)
    VALUES (NEW.director_id, NEW.date,
      CASE
        WHEN NEW.status IN ('EN_RUTA', 'PROGRAMADO') THEN 'EN_TERRENO'
        WHEN NEW.status = 'FINALIZADO' THEN 'EN_CANAL'
        ELSE 'EN_CANAL'
      END,
      NEW.id)
    ON CONFLICT (personnel_id, date)
    DO UPDATE SET
      logistics_status = CASE
        WHEN NEW.status IN ('EN_RUTA', 'PROGRAMADO') THEN 'EN_TERRENO'
        WHEN NEW.status = 'FINALIZADO' THEN 'EN_CANAL'
        ELSE 'EN_CANAL'
      END,
      dispatch_id = NEW.id,
      updated_at = CURRENT_TIMESTAMP;
  END IF;

  -- Actualizar estado del LiveU
  IF NEW.liveu_id IS NOT NULL THEN
    UPDATE liveu_equipment
    SET status = CASE
      WHEN NEW.status IN ('EN_RUTA', 'PROGRAMADO') THEN 'EN_TERRENO'
      WHEN NEW.status = 'FINALIZADO' THEN 'DISPONIBLE'
      ELSE 'DISPONIBLE'
    END
    WHERE id = NEW.liveu_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para sincronización
DROP TRIGGER IF EXISTS sync_logistics_after_dispatch ON press_dispatches;
CREATE TRIGGER sync_logistics_after_dispatch
  AFTER INSERT OR UPDATE ON press_dispatches
  FOR EACH ROW
  EXECUTE FUNCTION sync_logistics_on_dispatch();

-- ========================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ========================================
COMMENT ON TABLE liveu_equipment IS 'Inventario de equipos LiveU para transmisión en terreno';
COMMENT ON TABLE personnel_logistics_status IS 'Estado logístico del personal (EN_CANAL/EN_TERRENO) - NO afecta horarios ni rotaciones';
COMMENT ON COLUMN press_dispatches.liveu_id IS 'LiveU asignado al despacho';
COMMENT ON FUNCTION sync_logistics_on_dispatch() IS 'Sincroniza automáticamente estados logísticos al crear/actualizar despachos';

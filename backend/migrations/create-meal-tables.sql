-- ========================================
-- MIGRACIÓN: Módulo de Gestión de Alimentación
-- ========================================
-- Fecha: 2026-01-11
-- Propósito: Crear tablas para gestión de desayunos, almuerzos y cenas
-- ========================================

-- Tabla: meal_services
-- Almacena los tipos de servicio disponibles (Desayuno, Almuerzo, Cena)
CREATE TABLE IF NOT EXISTS meal_services (
  id SERIAL PRIMARY KEY,
  service_name VARCHAR(50) NOT NULL UNIQUE, -- 'DESAYUNO', 'ALMUERZO', 'CENA'
  service_time TIME NOT NULL, -- Hora de referencia del servicio
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: meal_requests
-- Registros diarios de quién solicita cada servicio
CREATE TABLE IF NOT EXISTS meal_requests (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES meal_services(id) ON DELETE CASCADE,
  service_date DATE NOT NULL, -- Fecha del servicio
  personnel_id INTEGER REFERENCES personnel(id) ON DELETE SET NULL, -- Puede ser NULL para invitados
  personnel_name VARCHAR(255) NOT NULL, -- Nombre (editable para invitados)
  cargo VARCHAR(100), -- Cargo/posición del personal
  scheduled_time TIME, -- Hora de programación (desde schedule)
  status VARCHAR(50) DEFAULT 'POR_CONFIRMAR', -- 'POR_CONFIRMAR', 'CONFIRMADO', 'CANCELADO'
  is_guest BOOLEAN DEFAULT false, -- Indica si es invitado/externo
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_meal_request UNIQUE (service_id, service_date, personnel_id, personnel_name)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_meal_requests_service_date ON meal_requests(service_id, service_date);
CREATE INDEX IF NOT EXISTS idx_meal_requests_personnel ON meal_requests(personnel_id);
CREATE INDEX IF NOT EXISTS idx_meal_requests_date ON meal_requests(service_date);
CREATE INDEX IF NOT EXISTS idx_meal_requests_status ON meal_requests(status);

-- Insertar servicios predefinidos
INSERT INTO meal_services (service_name, service_time, description) VALUES
  ('DESAYUNO', '06:00:00', 'Servicio de desayuno matinal para personal de madrugada'),
  ('ALMUERZO', '12:00:00', 'Servicio de almuerzo para personal del mediodía'),
  ('CENA', '18:00:00', 'Servicio de cena para personal de tarde/noche')
ON CONFLICT (service_name) DO NOTHING;

-- Comentarios en tablas
COMMENT ON TABLE meal_services IS 'Catálogo de servicios alimenticios disponibles';
COMMENT ON TABLE meal_requests IS 'Solicitudes diarias de servicios de alimentación por persona';

COMMENT ON COLUMN meal_requests.personnel_id IS 'ID del personal (NULL para invitados/externos)';
COMMENT ON COLUMN meal_requests.personnel_name IS 'Nombre editable (permite invitados no registrados)';
COMMENT ON COLUMN meal_requests.cargo IS 'Cargo/posición: Graficación, Editores, Capilla, Ingesta, etc.';
COMMENT ON COLUMN meal_requests.is_guest IS 'TRUE si es personal externo/invitado';
COMMENT ON COLUMN meal_requests.scheduled_time IS 'Hora de programación (importada desde schedule)';

-- ========================================
-- FIN DE MIGRACIÓN
-- ========================================

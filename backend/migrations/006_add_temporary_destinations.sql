-- Migración para manejar destinos temporales y direcciones de emergencia

-- Agregar columna para destinos temporales en daily_transport_assignments
ALTER TABLE daily_transport_assignments
ADD COLUMN IF NOT EXISTS temporary_destination TEXT,
ADD COLUMN IF NOT EXISTS temporary_address_type VARCHAR(50), -- HOME, AIRPORT, HOTEL, OTHER
ADD COLUMN IF NOT EXISTS temporary_address_notes TEXT,
ADD COLUMN IF NOT EXISTS temporary_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS temporary_lng DECIMAL(11, 8);

-- Tabla para registrar direcciones de emergencia frecuentes por persona
CREATE TABLE IF NOT EXISTS emergency_addresses (
  id SERIAL PRIMARY KEY,
  personnel_id INTEGER REFERENCES personnel(id) ON DELETE CASCADE,
  address_type VARCHAR(50) NOT NULL, -- AIRPORT, HOTEL, FAMILY, OTHER
  address TEXT NOT NULL,
  barrio VARCHAR(255),
  localidad VARCHAR(255),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  notes TEXT,
  usage_count INTEGER DEFAULT 0, -- Contador de cuántas veces se ha usado
  last_used_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_emergency_addresses_personnel ON emergency_addresses(personnel_id);
CREATE INDEX idx_daily_transport_temp_dest ON daily_transport_assignments(date, shift_type)
  WHERE temporary_destination IS NOT NULL;

-- Comentarios
COMMENT ON COLUMN daily_transport_assignments.temporary_destination IS 'Destino temporal solo para este día (ej: aeropuerto, hotel)';
COMMENT ON COLUMN daily_transport_assignments.temporary_address_type IS 'Tipo de destino temporal';
COMMENT ON TABLE emergency_addresses IS 'Direcciones de emergencia frecuentes por persona (aeropuertos, hoteles, familia)';

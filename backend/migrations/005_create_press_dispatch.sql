-- Migración para módulo de Flota en Base y Reportería

-- Tabla para registrar disponibilidad de vehículos después de rutas AM
CREATE TABLE IF NOT EXISTS fleet_availability (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  vehicle_id INTEGER REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
  available_from TIME NOT NULL, -- Hora en que termina la ruta y queda disponible
  status VARCHAR(50) DEFAULT 'DISPONIBLE', -- DISPONIBLE, EN_SERVICIO, FUERA_DE_SERVICIO
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, vehicle_id)
);

-- Tabla para despachos de prensa
CREATE TABLE IF NOT EXISTS press_dispatches (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  vehicle_id INTEGER REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
  journalist_id INTEGER REFERENCES personnel(id) ON DELETE SET NULL,
  journalist_name VARCHAR(255) NOT NULL, -- Nombre del periodista
  cameraman_id INTEGER REFERENCES personnel(id) ON DELETE SET NULL,
  cameraman_name VARCHAR(255), -- Nombre del camarógrafo
  driver_name VARCHAR(255) NOT NULL, -- Conductor asignado
  vehicle_plate VARCHAR(50) NOT NULL, -- Placa del vehículo
  destination TEXT NOT NULL, -- Destino del servicio
  departure_time TIME NOT NULL, -- Hora de salida
  estimated_return TIME, -- Hora estimada de regreso
  actual_return TIME, -- Hora real de regreso
  status VARCHAR(50) DEFAULT 'PROGRAMADO', -- PROGRAMADO, EN_RUTA, FINALIZADO, CANCELADO
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_fleet_availability_date ON fleet_availability(date);
CREATE INDEX idx_fleet_availability_status ON fleet_availability(status);
CREATE INDEX idx_press_dispatches_date ON press_dispatches(date);
CREATE INDEX idx_press_dispatches_status ON press_dispatches(status);
CREATE INDEX idx_press_dispatches_vehicle ON press_dispatches(vehicle_id, date);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fleet_availability_modtime
    BEFORE UPDATE ON fleet_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_press_dispatches_modtime
    BEFORE UPDATE ON press_dispatches
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Comentarios para documentación
COMMENT ON TABLE fleet_availability IS 'Disponibilidad diaria de vehículos para reportería después de rutas AM';
COMMENT ON TABLE press_dispatches IS 'Registro de despachos de vehículos para periodistas y reportería';

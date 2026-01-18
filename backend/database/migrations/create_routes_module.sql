-- ============================================================================
-- MÓDULO DE GESTIÓN DE RUTAS Y REPORTERÍA
-- Migración para crear las tablas necesarias del sistema de rutas
-- Fecha: 2026-01-10
-- ============================================================================

-- Tabla principal de asignaciones de transporte diarias
CREATE TABLE IF NOT EXISTS daily_transport_assignments (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  shift_type VARCHAR(10) NOT NULL CHECK (shift_type IN ('AM', 'PM')),
  personnel_id INTEGER REFERENCES personnel(id) ON DELETE CASCADE,
  personnel_name VARCHAR(255) NOT NULL,
  personnel_role VARCHAR(100),
  personnel_area VARCHAR(100),
  transport_mode VARCHAR(20) NOT NULL DEFAULT 'RUTA' CHECK (transport_mode IN ('RUTA', 'PROPIO')),
  direccion TEXT,
  barrio VARCHAR(100),
  localidad VARCHAR(100),
  route_id INTEGER,
  vehicle_id INTEGER,
  pickup_order INTEGER,
  estimated_time TIME,
  is_express BOOLEAN DEFAULT false,
  confirmed_by_admin BOOLEAN DEFAULT false,
  program_title VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, shift_type, personnel_id)
);

-- Tabla de rutas optimizadas
CREATE TABLE IF NOT EXISTS optimized_routes (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  shift_type VARCHAR(10) NOT NULL CHECK (shift_type IN ('AM', 'PM')),
  route_number INTEGER NOT NULL,
  zone VARCHAR(50),
  vehicle_id INTEGER,
  driver_name VARCHAR(255),
  total_passengers INTEGER DEFAULT 0,
  total_distance_km DECIMAL(10, 2),
  estimated_duration_minutes INTEGER,
  start_time TIME,
  end_time TIME,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, shift_type, route_number)
);

-- Tabla de vehículos de la flota
CREATE TABLE IF NOT EXISTS fleet_vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_code VARCHAR(50) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  driver_name VARCHAR(255),
  driver_phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'IN_ROUTE', 'MAINTENANCE', 'REPORTING')),
  current_location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de geocoding cache (para evitar llamadas repetidas a Google API)
CREATE TABLE IF NOT EXISTS address_geocoding_cache (
  id SERIAL PRIMARY KEY,
  address TEXT NOT NULL,
  formatted_address TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  zone VARCHAR(50),
  is_valid BOOLEAN DEFAULT true,
  last_verified TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(address)
);

-- Tabla de distancias precalculadas (cache de Distance Matrix API)
CREATE TABLE IF NOT EXISTS distance_matrix_cache (
  id SERIAL PRIMARY KEY,
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  distance_km DECIMAL(10, 2),
  duration_minutes INTEGER,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(origin_address, destination_address)
);

-- Tabla de alertas del sistema
CREATE TABLE IF NOT EXISTS route_alerts (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  shift_type VARCHAR(10) NOT NULL,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('INVALID_ADDRESS', 'INSUFFICIENT_VEHICLES', 'REST_VIOLATION', 'OVERCAPACITY', 'ROUTE_TOO_LONG')),
  severity VARCHAR(20) DEFAULT 'WARNING' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  message TEXT NOT NULL,
  personnel_id INTEGER REFERENCES personnel(id) ON DELETE SET NULL,
  route_id INTEGER REFERENCES optimized_routes(id) ON DELETE SET NULL,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de configuración del módulo
CREATE TABLE IF NOT EXISTS routes_configuration (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar configuración por defecto
INSERT INTO routes_configuration (config_key, config_value, description) VALUES
  ('MAX_PASSENGERS_PER_VEHICLE', '4', 'Máximo de pasajeros por vehículo'),
  ('MAX_ROUTE_DURATION_MINUTES', '60', 'Duración máxima de ruta en minutos'),
  ('GOOGLE_API_KEY', '', 'API Key de Google Distance Matrix'),
  ('AM_SHIFT_START', '05:00', 'Hora de inicio turno AM'),
  ('PM_SHIFT_END', '22:00', 'Hora de fin turno PM'),
  ('RTVC_ADDRESS', 'Cra 45 # 26-33, Bogotá, Colombia', 'Dirección de RTVC'),
  ('AUTO_RESET_ENABLED', 'true', 'Activar reset automático diario')
ON CONFLICT (config_key) DO NOTHING;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_transport_date_shift ON daily_transport_assignments(date, shift_type);
CREATE INDEX IF NOT EXISTS idx_transport_personnel ON daily_transport_assignments(personnel_id);
CREATE INDEX IF NOT EXISTS idx_routes_date_shift ON optimized_routes(date, shift_type);
CREATE INDEX IF NOT EXISTS idx_alerts_date_unresolved ON route_alerts(date, resolved) WHERE NOT resolved;
CREATE INDEX IF NOT EXISTS idx_geocoding_address ON address_geocoding_cache(address);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_transport_assignments_updated_at ON daily_transport_assignments;
CREATE TRIGGER update_transport_assignments_updated_at BEFORE UPDATE ON daily_transport_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_routes_updated_at ON optimized_routes;
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON optimized_routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON fleet_vehicles;
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON fleet_vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vista para facilitar consultas de rutas completas
CREATE OR REPLACE VIEW v_daily_routes AS
SELECT
  r.id as route_id,
  r.date,
  r.shift_type,
  r.route_number,
  r.zone,
  r.total_passengers,
  r.total_distance_km,
  r.estimated_duration_minutes,
  r.status as route_status,
  v.vehicle_code,
  v.driver_name,
  v.driver_phone,
  json_agg(
    json_build_object(
      'personnel_id', t.personnel_id,
      'name', t.personnel_name,
      'role', t.personnel_role,
      'area', t.personnel_area,
      'address', t.direccion,
      'pickup_order', t.pickup_order,
      'estimated_time', t.estimated_time,
      'transport_mode', t.transport_mode,
      'is_express', t.is_express
    ) ORDER BY t.pickup_order
  ) as passengers
FROM optimized_routes r
LEFT JOIN fleet_vehicles v ON r.vehicle_id = v.id
LEFT JOIN daily_transport_assignments t ON t.route_id = r.id AND t.date = r.date AND t.shift_type = r.shift_type
GROUP BY r.id, r.date, r.shift_type, r.route_number, r.zone, r.total_passengers,
         r.total_distance_km, r.estimated_duration_minutes, r.status,
         v.vehicle_code, v.driver_name, v.driver_phone;

COMMENT ON TABLE daily_transport_assignments IS 'Asignaciones diarias de transporte por empleado';
COMMENT ON TABLE optimized_routes IS 'Rutas optimizadas con agrupación de pasajeros';
COMMENT ON TABLE fleet_vehicles IS 'Vehículos disponibles en la flota';
COMMENT ON TABLE address_geocoding_cache IS 'Cache de direcciones geocodificadas';
COMMENT ON TABLE distance_matrix_cache IS 'Cache de distancias y tiempos entre puntos';
COMMENT ON TABLE route_alerts IS 'Alertas generadas por el sistema de rutas';
COMMENT ON TABLE routes_configuration IS 'Configuración del módulo de rutas';

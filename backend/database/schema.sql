-- database/schema.sql
-- Script de creación de base de datos RTVC Scheduling

-- Crear base de datos (ejecutar como superusuario)
-- CREATE DATABASE rtvc_scheduling;

-- Conectar a la base de datos
\c rtvc_scheduling;

-- ========================================
-- TABLA: schedules (Horarios)
-- ========================================
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    programa VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_horario CHECK (hora_fin > hora_inicio)
);

-- Índices para schedules
CREATE INDEX idx_schedules_fecha ON schedules(fecha);
CREATE INDEX idx_schedules_tipo ON schedules(tipo);
CREATE INDEX idx_schedules_fecha_hora ON schedules(fecha, hora_inicio);

-- ========================================
-- TABLA: personnel (Personal)
-- ========================================
CREATE TABLE IF NOT EXISTS personnel (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cargo VARCHAR(150) NOT NULL,
    area VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefono VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para personnel
CREATE INDEX idx_personnel_nombre ON personnel(nombre);
CREATE INDEX idx_personnel_area ON personnel(area);
CREATE INDEX idx_personnel_cargo ON personnel(cargo);
CREATE INDEX idx_personnel_activo ON personnel(activo);
CREATE INDEX idx_personnel_email ON personnel(email);

-- ========================================
-- TABLA: novelties (Novedades)
-- ========================================
CREATE TABLE IF NOT EXISTS novelties (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    responsable VARCHAR(255),
    prioridad VARCHAR(50) DEFAULT 'media',
    resuelto BOOLEAN DEFAULT false,
    solucion TEXT,
    fecha_resolucion TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_prioridad CHECK (prioridad IN ('baja', 'media', 'alta', 'crítica'))
);

-- Índices para novelties
CREATE INDEX idx_novelties_fecha ON novelties(fecha);
CREATE INDEX idx_novelties_tipo ON novelties(tipo);
CREATE INDEX idx_novelties_resuelto ON novelties(resuelto);
CREATE INDEX idx_novelties_prioridad ON novelties(prioridad);

-- ========================================
-- TABLA: reports (Reportes)
-- ========================================
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    contenido JSONB NOT NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generado_por VARCHAR(255),
    parametros JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para reports
CREATE INDEX idx_reports_tipo ON reports(tipo);
CREATE INDEX idx_reports_fecha ON reports(fecha_generacion);
CREATE INDEX idx_reports_contenido ON reports USING GIN (contenido);

-- ========================================
-- FUNCIONES Y TRIGGERS
-- ========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON personnel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_novelties_updated_at BEFORE UPDATE ON novelties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ========================================

-- Insertar personal de ejemplo
INSERT INTO personnel (nombre, cargo, area, email, telefono) VALUES
    ('Juan Pérez', 'Director', 'Dirección', 'juan.perez@rtvc.gov.co', '3001234567'),
    ('María García', 'Productora', 'Producción', 'maria.garcia@rtvc.gov.co', '3007654321'),
    ('Carlos López', 'Técnico', 'Técnica', 'carlos.lopez@rtvc.gov.co', '3009876543')
ON CONFLICT (email) DO NOTHING;

-- Insertar horarios de ejemplo
INSERT INTO schedules (fecha, hora_inicio, hora_fin, programa, tipo, descripcion) VALUES
    ('2025-11-05', '08:00:00', '10:00:00', 'Noticias Mañana', 'Informativo', 'Programa informativo matutino'),
    ('2025-11-05', '10:00:00', '12:00:00', 'Entretenimiento', 'Variedades', 'Show de entretenimiento'),
    ('2025-11-05', '18:00:00', '20:00:00', 'Noticias Tarde', 'Informativo', 'Noticiero principal')
ON CONFLICT DO NOTHING;

-- Insertar novedades de ejemplo
INSERT INTO novelties (fecha, hora, tipo, descripcion, prioridad, resuelto) VALUES
    ('2025-11-04', '14:30:00', 'Técnico', 'Falla en equipo de transmisión', 'alta', false),
    ('2025-11-03', '09:15:00', 'Programación', 'Cambio de horario solicitado', 'media', true)
ON CONFLICT DO NOTHING;

-- ========================================
-- PERMISOS Y ROLES (OPCIONAL)
-- ========================================

-- Crear usuario de aplicación (cambiar password)
-- CREATE USER rtvc_app WITH PASSWORD 'tu_password_seguro';
-- GRANT CONNECT ON DATABASE rtvc_scheduling TO rtvc_app;
-- GRANT USAGE ON SCHEMA public TO rtvc_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rtvc_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rtvc_app;

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista de horarios del día
CREATE OR REPLACE VIEW schedules_today AS
SELECT * FROM schedules
WHERE fecha = CURRENT_DATE
ORDER BY hora_inicio;

-- Vista de novedades pendientes
CREATE OR REPLACE VIEW novelties_pending AS
SELECT * FROM novelties
WHERE resuelto = false
ORDER BY fecha DESC, 
    CASE prioridad
        WHEN 'crítica' THEN 1
        WHEN 'alta' THEN 2
        WHEN 'media' THEN 3
        WHEN 'baja' THEN 4
    END;

-- Vista de personal activo
CREATE OR REPLACE VIEW personnel_active AS
SELECT * FROM personnel
WHERE activo = true
ORDER BY nombre;

-- ========================================
-- INFORMACIÓN DEL SCHEMA
-- ========================================

-- Mostrar todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

COMMENT ON TABLE schedules IS 'Tabla de horarios de programación';
COMMENT ON TABLE personnel IS 'Tabla de personal de RTVC';
COMMENT ON TABLE novelties IS 'Tabla de novedades y reportes';
COMMENT ON TABLE reports IS 'Tabla de reportes generados';
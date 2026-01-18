-- Migración: Gestión de Estudios, Masters y Asignación de Personal
-- Creado: 2025-12-13

-- Tabla de Estudios
CREATE TABLE IF NOT EXISTS estudios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  descripcion TEXT,
  capacidad INTEGER,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'mantenimiento')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Masters (Salas de Control)
CREATE TABLE IF NOT EXISTS masters (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  tipo VARCHAR(50) CHECK (tipo IN ('master_principal', 'master_secundario', 'sala_edicion')),
  descripcion TEXT,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'mantenimiento')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Programas
CREATE TABLE IF NOT EXISTS programas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  id_estudio INTEGER REFERENCES estudios(id) ON DELETE SET NULL,
  id_master INTEGER REFERENCES masters(id) ON DELETE SET NULL,
  horario_inicio TIME NOT NULL,
  horario_fin TIME NOT NULL,
  dias_semana VARCHAR(50), -- JSON array: ["lunes", "martes", ...]
  tipo VARCHAR(50) CHECK (tipo IN ('noticiero', 'magazine', 'debate', 'entretenimiento', 'especial', 'otro')),
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'pausado')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT horario_valido CHECK (horario_fin > horario_inicio)
);

-- Tabla de Asignaciones de Personal
CREATE TABLE IF NOT EXISTS personal_asignado (
  id SERIAL PRIMARY KEY,
  id_personal INTEGER NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
  id_programa INTEGER REFERENCES programas(id) ON DELETE CASCADE,
  id_estudio INTEGER REFERENCES estudios(id) ON DELETE SET NULL,
  id_master INTEGER REFERENCES masters(id) ON DELETE SET NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  rol VARCHAR(100), -- Rol específico para esta asignación (ej: "Camarógrafo principal", "Realizador")
  estado VARCHAR(20) DEFAULT 'programado' CHECK (estado IN ('programado', 'en_curso', 'completado', 'cancelado')),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT asignacion_horario_valido CHECK (hora_fin > hora_inicio),
  CONSTRAINT asignacion_unica UNIQUE (id_personal, fecha, hora_inicio, hora_fin)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_programas_estudio ON programas(id_estudio);
CREATE INDEX IF NOT EXISTS idx_programas_master ON programas(id_master);
CREATE INDEX IF NOT EXISTS idx_programas_estado ON programas(estado);
CREATE INDEX IF NOT EXISTS idx_personal_asignado_fecha ON personal_asignado(fecha);
CREATE INDEX IF NOT EXISTS idx_personal_asignado_personal ON personal_asignado(id_personal);
CREATE INDEX IF NOT EXISTS idx_personal_asignado_programa ON personal_asignado(id_programa);
CREATE INDEX IF NOT EXISTS idx_personal_asignado_estudio ON personal_asignado(id_estudio);
CREATE INDEX IF NOT EXISTS idx_personal_asignado_master ON personal_asignado(id_master);
CREATE INDEX IF NOT EXISTS idx_personal_asignado_estado ON personal_asignado(estado);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_estudios_updated_at BEFORE UPDATE ON estudios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_masters_updated_at BEFORE UPDATE ON masters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programas_updated_at BEFORE UPDATE ON programas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_asignado_updated_at BEFORE UPDATE ON personal_asignado
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Datos de ejemplo (opcionales)
INSERT INTO estudios (nombre, codigo, descripcion, capacidad) VALUES
  ('Estudio 1', 'E1', 'Estudio principal para noticieros', 50),
  ('Estudio 2', 'E2', 'Estudio secundario para programas magazine', 30),
  ('Estudio 3', 'E3', 'Estudio pequeño para entrevistas', 15)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO masters (nombre, codigo, tipo, descripcion) VALUES
  ('Master Principal A', 'MA', 'master_principal', 'Sala de control principal'),
  ('Master Principal B', 'MB', 'master_principal', 'Sala de control secundaria'),
  ('Sala de Edición 1', 'SE1', 'sala_edicion', 'Sala de edición y post-producción')
ON CONFLICT (codigo) DO NOTHING;

COMMENT ON TABLE estudios IS 'Estudios de televisión disponibles';
COMMENT ON TABLE masters IS 'Salas de control y masters técnicos';
COMMENT ON TABLE programas IS 'Programas de televisión y su asignación a estudios/masters';
COMMENT ON TABLE personal_asignado IS 'Asignaciones diarias de personal operativo a programas y estudios';

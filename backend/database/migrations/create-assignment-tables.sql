-- Migración: Crear tablas de asignaciones de reportería y realizadores
-- Fecha: 2025-12-20

-- Tabla de asignaciones de reportería (camarógrafos y asistentes)
CREATE TABLE IF NOT EXISTS asignaciones_reporteria (
  id SERIAL PRIMARY KEY,
  id_personal INTEGER NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  numero_salida INTEGER NOT NULL CHECK (numero_salida BETWEEN 1 AND 3),
  hora_salida TIME NOT NULL,
  destino VARCHAR(255) NOT NULL,
  producto VARCHAR(255) NOT NULL,
  estatus VARCHAR(50) NOT NULL DEFAULT 'En Canal' CHECK (estatus IN ('En Canal', 'En Trayecto', 'En Locación')),
  fuera_ciudad BOOLEAN DEFAULT FALSE,
  dias_bloqueado INTEGER DEFAULT 0,
  fecha_retorno DATE,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (id_personal, fecha, numero_salida)
);

-- Tabla de asignaciones de realizadores
CREATE TABLE IF NOT EXISTS asignaciones_realizadores (
  id SERIAL PRIMARY KEY,
  id_personal INTEGER NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  numero_salida INTEGER NOT NULL CHECK (numero_salida BETWEEN 1 AND 3),
  hora_salida TIME NOT NULL,
  destino VARCHAR(255) NOT NULL,
  producto VARCHAR(255) NOT NULL,
  estatus VARCHAR(50) NOT NULL DEFAULT 'En Canal' CHECK (estatus IN ('En Canal', 'En Trayecto', 'En Locación')),
  fuera_ciudad BOOLEAN DEFAULT FALSE,
  dias_bloqueado INTEGER DEFAULT 0,
  fecha_retorno DATE,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (id_personal, fecha, numero_salida)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_asignaciones_reporteria_fecha ON asignaciones_reporteria(fecha);
CREATE INDEX IF NOT EXISTS idx_asignaciones_reporteria_personal ON asignaciones_reporteria(id_personal);
CREATE INDEX IF NOT EXISTS idx_asignaciones_reporteria_estatus ON asignaciones_reporteria(estatus);
CREATE INDEX IF NOT EXISTS idx_asignaciones_reporteria_fecha_personal ON asignaciones_reporteria(fecha, id_personal);

CREATE INDEX IF NOT EXISTS idx_asignaciones_realizadores_fecha ON asignaciones_realizadores(fecha);
CREATE INDEX IF NOT EXISTS idx_asignaciones_realizadores_personal ON asignaciones_realizadores(id_personal);
CREATE INDEX IF NOT EXISTS idx_asignaciones_realizadores_estatus ON asignaciones_realizadores(estatus);
CREATE INDEX IF NOT EXISTS idx_asignaciones_realizadores_fecha_personal ON asignaciones_realizadores(fecha, id_personal);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_asignaciones_reporteria_updated_at BEFORE UPDATE
  ON asignaciones_reporteria FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_asignaciones_realizadores_updated_at BEFORE UPDATE
  ON asignaciones_realizadores FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

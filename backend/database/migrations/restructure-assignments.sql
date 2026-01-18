-- Migración: Reestructurar sistema de asignaciones
-- Fecha: 2025-12-21
-- Objetivo: Separar turnos de salidas para evitar conflictos 409

-- Primero, eliminar las tablas antiguas
DROP TABLE IF EXISTS asignaciones_reporteria CASCADE;
DROP TABLE IF EXISTS asignaciones_realizadores CASCADE;

-- Tabla de TURNOS base (registro de asistencia diaria)
CREATE TABLE IF NOT EXISTS turnos_diarios (
  id SERIAL PRIMARY KEY,
  id_personal INTEGER NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  turno VARCHAR(50) NOT NULL CHECK (turno IN ('06:00-13:00', '13:00-20:00', 'Guardia', 'No programado')),
  es_fin_semana BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (id_personal, fecha)
);

-- Tabla de SALIDAS de reportería (hasta 3 por turno)
CREATE TABLE IF NOT EXISTS salidas_reporteria (
  id SERIAL PRIMARY KEY,
  turno_id INTEGER NOT NULL REFERENCES turnos_diarios(id) ON DELETE CASCADE,
  numero_salida INTEGER NOT NULL CHECK (numero_salida BETWEEN 1 AND 3),
  hora_salida TIME NOT NULL,
  destino VARCHAR(255) NOT NULL,
  producto VARCHAR(255) NOT NULL,
  estatus VARCHAR(50) NOT NULL DEFAULT 'En Trayecto' CHECK (estatus IN ('En Trayecto', 'En Locación', 'Finalizado')),
  fuera_ciudad BOOLEAN DEFAULT FALSE,
  dias_bloqueado INTEGER DEFAULT 0,
  fecha_retorno DATE,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (turno_id, numero_salida)
);

-- Tabla de SALIDAS de realizadores (hasta 3 por turno)
CREATE TABLE IF NOT EXISTS salidas_realizadores (
  id SERIAL PRIMARY KEY,
  turno_id INTEGER NOT NULL REFERENCES turnos_diarios(id) ON DELETE CASCADE,
  numero_salida INTEGER NOT NULL CHECK (numero_salida BETWEEN 1 AND 3),
  hora_salida TIME NOT NULL,
  destino VARCHAR(255) NOT NULL,
  producto VARCHAR(255) NOT NULL,
  estatus VARCHAR(50) NOT NULL DEFAULT 'En Trayecto' CHECK (estatus IN ('En Trayecto', 'En Locación', 'Finalizado')),
  fuera_ciudad BOOLEAN DEFAULT FALSE,
  dias_bloqueado INTEGER DEFAULT 0,
  fecha_retorno DATE,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (turno_id, numero_salida)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos_diarios(fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_personal ON turnos_diarios(id_personal);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha_personal ON turnos_diarios(fecha, id_personal);

CREATE INDEX IF NOT EXISTS idx_salidas_reporteria_turno ON salidas_reporteria(turno_id);
CREATE INDEX IF NOT EXISTS idx_salidas_reporteria_estatus ON salidas_reporteria(estatus);

CREATE INDEX IF NOT EXISTS idx_salidas_realizadores_turno ON salidas_realizadores(turno_id);
CREATE INDEX IF NOT EXISTS idx_salidas_realizadores_estatus ON salidas_realizadores(estatus);

-- Triggers para updated_at
CREATE TRIGGER update_turnos_diarios_updated_at BEFORE UPDATE
  ON turnos_diarios FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_salidas_reporteria_updated_at BEFORE UPDATE
  ON salidas_reporteria FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_salidas_realizadores_updated_at BEFORE UPDATE
  ON salidas_realizadores FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

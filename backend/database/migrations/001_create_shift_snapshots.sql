-- Migración: Crear tabla shift_snapshots para guardar historial inmutable de turnos
-- Fecha: 2026-01-25
-- Descripción: Permite guardar snapshots diarios de asignaciones de personal por área y turno

-- ========================================
-- TABLA: shift_snapshots
-- ========================================
CREATE TABLE IF NOT EXISTS shift_snapshots (
    id SERIAL PRIMARY KEY,

    -- Información temporal
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Información del área y personal
    area VARCHAR(150) NOT NULL,
    personnel_id INTEGER,
    personnel_name VARCHAR(255) NOT NULL,
    personnel_role VARCHAR(150),

    -- Información del turno
    shift_number INTEGER NOT NULL CHECK (shift_number >= 1 AND shift_number <= 6),
    shift_start_time TIME NOT NULL,
    shift_end_time TIME,
    shift_label VARCHAR(100),
    shift_description TEXT,

    -- Estado del personal ese día
    status VARCHAR(50) DEFAULT 'ACTIVO' CHECK (status IN ('ACTIVO', 'DE_VIAJE', 'AUSENTE', 'CAPACITACION', 'PERMISO')),
    notes TEXT,

    -- Metadata
    saved_by INTEGER,
    is_weekend BOOLEAN DEFAULT false,
    rotation_week INTEGER,

    -- Índice único: No puede haber dos asignaciones del mismo personal en la misma fecha/área/turno
    CONSTRAINT unique_assignment UNIQUE (snapshot_date, area, personnel_id, shift_number)
);

-- Índices para optimizar consultas
CREATE INDEX idx_snapshot_date ON shift_snapshots(snapshot_date);
CREATE INDEX idx_snapshot_area ON shift_snapshots(area);
CREATE INDEX idx_snapshot_personnel ON shift_snapshots(personnel_id);
CREATE INDEX idx_snapshot_date_area ON shift_snapshots(snapshot_date, area);
CREATE INDEX idx_snapshot_status ON shift_snapshots(status);

-- Índice para búsquedas rápidas de "¿existe snapshot para esta fecha?"
CREATE INDEX idx_snapshot_exists ON shift_snapshots(snapshot_date, area);

-- Comentarios de documentación
COMMENT ON TABLE shift_snapshots IS 'Snapshots inmutables de asignaciones diarias de personal por área y turno';
COMMENT ON COLUMN shift_snapshots.snapshot_date IS 'Fecha del snapshot (la fecha para la cual se guardó la programación)';
COMMENT ON COLUMN shift_snapshots.area IS 'Área del personal (ej: AUDIO, CAMARÓGRAFOS DE ESTUDIO)';
COMMENT ON COLUMN shift_snapshots.shift_number IS 'Número del turno (1-6) según la lógica de rotación';
COMMENT ON COLUMN shift_snapshots.status IS 'Estado del personal ese día específico';
COMMENT ON COLUMN shift_snapshots.rotation_week IS 'Semana de rotación usada al momento de guardar';

-- ========================================
-- TABLA: snapshot_metadata
-- ========================================
-- Guarda información general del snapshot (cuándo se guardó, quién lo guardó, etc.)
CREATE TABLE IF NOT EXISTS snapshot_metadata (
    id SERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL UNIQUE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    saved_by INTEGER,
    total_personnel INTEGER,
    total_areas INTEGER,
    is_locked BOOLEAN DEFAULT false,
    notes TEXT,

    CONSTRAINT fk_saved_by FOREIGN KEY (saved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_metadata_date ON snapshot_metadata(snapshot_date);
CREATE INDEX idx_metadata_locked ON snapshot_metadata(is_locked);

COMMENT ON TABLE snapshot_metadata IS 'Metadata de cada snapshot guardado (información general del día)';
COMMENT ON COLUMN snapshot_metadata.is_locked IS 'Si está bloqueado, no se puede modificar el snapshot';

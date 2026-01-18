-- Crear tabla para guardar las asignaciones de programas por fecha
CREATE TABLE IF NOT EXISTS program_assignments (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    personnel_id INTEGER NOT NULL,
    program_id VARCHAR(100) NOT NULL,
    assigned BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, personnel_id, program_id)
);

CREATE INDEX IF NOT EXISTS idx_program_assignments_date ON program_assignments(date);
CREATE INDEX IF NOT EXISTS idx_program_assignments_personnel ON program_assignments(personnel_id);
CREATE INDEX IF NOT EXISTS idx_program_assignments_program ON program_assignments(program_id);

-- Tabla para guardar el estado completo del grid por fecha
CREATE TABLE IF NOT EXISTS daily_schedules (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    assignments_data JSONB NOT NULL,
    programs_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daily_schedules_date ON daily_schedules(date);

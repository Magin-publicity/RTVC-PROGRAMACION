-- Crear tablas para RTVC Scheduling
CREATE TABLE IF NOT EXISTS personnel (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    area VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    personnel_id INTEGER REFERENCES personnel(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    shift_time VARCHAR(100) NOT NULL,
    program VARCHAR(255),
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(personnel_id, date)
);

CREATE TABLE IF NOT EXISTS novelties (
    id SERIAL PRIMARY KEY,
    personnel_id INTEGER REFERENCES personnel(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_personnel ON schedules(personnel_id);
CREATE INDEX IF NOT EXISTS idx_novelties_date ON novelties(date);
CREATE INDEX IF NOT EXISTS idx_novelties_personnel ON novelties(personnel_id);

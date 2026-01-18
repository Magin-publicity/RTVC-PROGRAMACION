const pool = require('../config/database');

async function addAvailabilityFields() {
  try {
    console.log('🔧 Agregando campos de disponibilidad a la tabla personnel...');

    // Agregar campos para rastrear disponibilidad
    await pool.query(`
      ALTER TABLE personnel
      ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS unavailability_reason VARCHAR(100),
      ADD COLUMN IF NOT EXISTS unavailability_start_date DATE,
      ADD COLUMN IF NOT EXISTS unavailability_end_date DATE,
      ADD COLUMN IF NOT EXISTS notes TEXT
    `);

    console.log('✅ Campos de disponibilidad agregados exitosamente');

    // Crear tabla para historial de disponibilidad
    await pool.query(`
      CREATE TABLE IF NOT EXISTS availability_history (
        id SERIAL PRIMARY KEY,
        personnel_id INTEGER REFERENCES personnel(id) ON DELETE CASCADE,
        is_available BOOLEAN NOT NULL,
        reason VARCHAR(100),
        start_date DATE NOT NULL,
        end_date DATE,
        notes TEXT,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabla availability_history creada exitosamente');

    console.log('✅ Migración completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

addAvailabilityFields();

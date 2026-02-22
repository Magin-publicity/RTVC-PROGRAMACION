// Migración: crear tabla meal_groups para plantillas de alimentación
const pool = require('../config/database');

async function createMealGroups() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meal_groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        service_type VARCHAR(20) NOT NULL DEFAULT 'ALMUERZO',
        personnel_ids INTEGER[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla meal_groups creada exitosamente');

    // Índice por service_type
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_meal_groups_service_type
      ON meal_groups(service_type)
    `);
    console.log('✅ Índice idx_meal_groups_service_type creado');

  } catch (err) {
    console.error('❌ Error en migración:', err.message);
  } finally {
    process.exit(0);
  }
}

createMealGroups();

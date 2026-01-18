// Script para agregar campo program_name a meal_requests
const pool = require('../config/database');

async function addProgramField() {
  try {
    console.log('📝 Agregando campo program_name a meal_requests...');

    await pool.query(`
      ALTER TABLE meal_requests
      ADD COLUMN IF NOT EXISTS program_name VARCHAR(150)
    `);

    console.log('✅ Campo program_name agregado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addProgramField();

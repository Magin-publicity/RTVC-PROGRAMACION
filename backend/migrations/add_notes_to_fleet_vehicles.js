const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function addNotesColumn() {
  try {
    console.log('🔧 Agregando columna notes a fleet_vehicles...');

    await pool.query(`
      ALTER TABLE fleet_vehicles
      ADD COLUMN IF NOT EXISTS notes TEXT;
    `);

    console.log('✅ Columna notes agregada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al agregar columna notes:', error);
    process.exit(1);
  }
}

addNotesColumn();

const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración 004...');

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/004_create_program_assignments.sql'),
      'utf8'
    );

    await pool.query(migrationSQL);

    console.log('✅ Migración 004 completada exitosamente');
    console.log('   - Tabla program_assignments creada');
    console.log('   - Tabla daily_schedules creada');
    console.log('   - Índices creados');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  }
}

runMigration();

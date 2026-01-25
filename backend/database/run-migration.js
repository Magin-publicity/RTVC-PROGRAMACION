const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración: 001_create_shift_snapshots.sql\n');

    // Leer el archivo SQL
    const migrationPath = path.join(__dirname, 'migrations', '001_create_shift_snapshots.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Ejecutar la migración
    await pool.query(sql);

    console.log('✅ Migración ejecutada exitosamente!');
    console.log('\nTablas creadas:');
    console.log('  - shift_snapshots (snapshots de turnos diarios)');
    console.log('  - snapshot_metadata (metadata de snapshots)');

    // Verificar que las tablas se crearon
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('shift_snapshots', 'snapshot_metadata')
      ORDER BY table_name
    `);

    console.log('\n📊 Tablas verificadas en la base de datos:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });

    // Mostrar estructura de shift_snapshots
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'shift_snapshots'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Columnas de shift_snapshots:');
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  }
}

runMigration();

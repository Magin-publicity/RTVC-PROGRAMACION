const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración de estudios, masters y asignaciones...\n');

    const migrationPath = path.join(__dirname, '..', 'migrations', 'create_studios_masters_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(sql);

    console.log('✅ Migración completada exitosamente!\n');
    console.log('📋 Tablas creadas:');
    console.log('   - estudios');
    console.log('   - masters');
    console.log('   - programas');
    console.log('   - personal_asignado');
    console.log('\n📊 Verificando tablas...\n');

    // Verificar que las tablas se crearon
    const checkTables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('estudios', 'masters', 'programas', 'personal_asignado')
      ORDER BY table_name;
    `);

    console.log('Tablas encontradas:');
    checkTables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Verificar datos de ejemplo
    const estudiosCount = await pool.query('SELECT COUNT(*) FROM estudios');
    const mastersCount = await pool.query('SELECT COUNT(*) FROM masters');

    console.log(`\n📦 Datos de ejemplo insertados:`);
    console.log(`   - ${estudiosCount.rows[0].count} estudios`);
    console.log(`   - ${mastersCount.rows[0].count} masters`);

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

runMigration();

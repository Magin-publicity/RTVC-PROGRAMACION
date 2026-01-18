const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function findProgramRelation() {
  try {
    console.log('🔍 Buscando relación entre personal y programas...\n');

    // Verificar todas las tablas que contienen "program"
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE '%program%'
      OR table_name LIKE '%assign%'
      ORDER BY table_name
    `);

    console.log('📊 Tablas encontradas:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Verificar columnas de personnel
    console.log('\n📋 Columnas de la tabla personnel:');
    const personnelColumnsResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'personnel'
      ORDER BY ordinal_position
    `);

    personnelColumnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    // Verificar columnas de daily_schedules
    console.log('\n📋 Columnas de la tabla daily_schedules:');
    const scheduleColumnsResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'daily_schedules'
      ORDER BY ordinal_position
    `);

    scheduleColumnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    // Ver ejemplo de asignación del 12 de enero en daily_transport_assignments
    console.log('\n📋 Ejemplo de daily_transport_assignments (12 enero):');
    const assignmentsResult = await pool.query(`
      SELECT *
      FROM daily_transport_assignments
      WHERE date = '2026-01-12' AND shift_type = 'AM'
      LIMIT 5
    `);

    if (assignmentsResult.rows.length > 0) {
      console.log('Columnas disponibles:');
      Object.keys(assignmentsResult.rows[0]).forEach(key => {
        console.log(`  - ${key}: ${assignmentsResult.rows[0][key]}`);
      });
    } else {
      console.log('  (No hay datos aún)');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

findProgramRelation();

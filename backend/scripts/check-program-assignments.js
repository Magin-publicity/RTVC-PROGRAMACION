const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function checkProgramAssignments() {
  try {
    const date = '2026-01-12';

    console.log('🔍 Verificando program_assignments...\n');

    // Ver estructura
    const columnsResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'program_assignments'
      ORDER BY ordinal_position
    `);

    console.log('📋 Columnas de program_assignments:');
    columnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    // Ver datos del 12 de enero
    const assignmentsResult = await pool.query(`
      SELECT *
      FROM program_assignments
      WHERE date = $1
      LIMIT 10
    `, [date]);

    console.log(`\n📊 Registros para ${date}: ${assignmentsResult.rows.length}`);

    if (assignmentsResult.rows.length > 0) {
      console.log('\nPrimeros 10 registros:');
      assignmentsResult.rows.forEach((row, i) => {
        console.log(`\n${i + 1}.`, JSON.stringify(row, null, 2));
      });
    }

    // Ver programs_data en daily_schedules
    console.log('\n\n🔍 Verificando programs_data en daily_schedules...\n');

    const scheduleResult = await pool.query(`
      SELECT programs_data
      FROM daily_schedules
      WHERE date = $1
    `, [date]);

    if (scheduleResult.rows.length > 0 && scheduleResult.rows[0].programs_data) {
      const programsData = scheduleResult.rows[0].programs_data;
      console.log('📊 programs_data keys:');
      Object.keys(programsData).forEach(key => {
        console.log(`  ${key}:`, programsData[key]);
      });
    } else {
      console.log('  (No hay programs_data)');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

checkProgramAssignments();

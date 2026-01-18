const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function investigateTables() {
  console.log('='.repeat(80));
  console.log('INVESTIGACIÓN DE TABLAS DE PROGRAMACIÓN AUTOMATIZADA');
  console.log('='.repeat(80));

  try {
    // Investigar daily_schedules
    console.log('\n📋 TABLA: daily_schedules');
    console.log('─'.repeat(80));

    const dsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'daily_schedules'
      ORDER BY ordinal_position
    `);

    if (dsColumns.rows.length > 0) {
      console.log('\nColumnas:');
      dsColumns.rows.forEach(col => {
        console.log(`  • ${col.column_name.padEnd(30)} | ${col.data_type.padEnd(20)} | ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });

      // Mostrar datos de ejemplo
      const dsData = await pool.query(`
        SELECT * FROM daily_schedules
        WHERE date >= '2026-01-10' AND date <= '2026-01-16'
        LIMIT 5
      `);

      console.log(`\nDatos de ejemplo (${dsData.rows.length} filas):`);
      if (dsData.rows.length > 0) {
        dsData.rows.forEach((row, idx) => {
          console.log(`\n  Fila ${idx + 1}:`);
          Object.keys(row).forEach(key => {
            console.log(`    ${key}: ${row[key]}`);
          });
        });
      }
    } else {
      console.log('  ⚠️  Tabla no encontrada o sin columnas');
    }

    // Investigar personal_asignado
    console.log('\n\n📋 TABLA: personal_asignado');
    console.log('─'.repeat(80));

    const paColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'personal_asignado'
      ORDER BY ordinal_position
    `);

    if (paColumns.rows.length > 0) {
      console.log('\nColumnas:');
      paColumns.rows.forEach(col => {
        console.log(`  • ${col.column_name.padEnd(30)} | ${col.data_type.padEnd(20)} | ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });

      // Mostrar datos de ejemplo
      const paData = await pool.query(`
        SELECT * FROM personal_asignado
        WHERE fecha >= '2026-01-10' AND fecha <= '2026-01-16'
        LIMIT 5
      `);

      console.log(`\nDatos de ejemplo (${paData.rows.length} filas):`);
      if (paData.rows.length > 0) {
        paData.rows.forEach((row, idx) => {
          console.log(`\n  Fila ${idx + 1}:`);
          Object.keys(row).forEach(key => {
            console.log(`    ${key}: ${row[key]}`);
          });
        });
      }
    } else {
      console.log('  ⚠️  Tabla no encontrada o sin columnas');
    }

    // Buscar asignaciones para el martes 13 de enero, turno AM
    console.log('\n\n🔍 BÚSQUEDA ESPECÍFICA: Martes 13 de Enero, Turno AM (05:00)');
    console.log('─'.repeat(80));

    const testDate = '2026-01-13';
    const testShift = 'AM';

    // Intentar en daily_schedules
    try {
      const ds = await pool.query(`
        SELECT * FROM daily_schedules
        WHERE date = $1
        LIMIT 10
      `, [testDate]);

      console.log(`\n📅 daily_schedules para ${testDate}: ${ds.rows.length} filas`);
      if (ds.rows.length > 0) {
        ds.rows.slice(0, 3).forEach((row, idx) => {
          console.log(`\n  Registro ${idx + 1}:`);
          Object.keys(row).forEach(key => {
            console.log(`    ${key}: ${row[key]}`);
          });
        });
      }
    } catch (e) {
      console.log(`  ⚠️  Error consultando daily_schedules: ${e.message}`);
    }

    // Intentar en personal_asignado
    try {
      const pa = await pool.query(`
        SELECT * FROM personal_asignado
        WHERE fecha = $1
        LIMIT 10
      `, [testDate]);

      console.log(`\n📅 personal_asignado para ${testDate}: ${pa.rows.length} filas`);
      if (pa.rows.length > 0) {
        pa.rows.slice(0, 3).forEach((row, idx) => {
          console.log(`\n  Registro ${idx + 1}:`);
          Object.keys(row).forEach(key => {
            console.log(`    ${key}: ${row[key]}`);
          });
        });
      }
    } catch (e) {
      console.log(`  ⚠️  Error consultando personal_asignado: ${e.message}`);
    }

    // Buscar otras tablas relacionadas con schedules o assignments
    console.log('\n\n🔍 BUSCANDO OTRAS TABLAS RELACIONADAS');
    console.log('─'.repeat(80));

    const relatedTables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND (
        table_name LIKE '%schedule%' OR
        table_name LIKE '%assignment%' OR
        table_name LIKE '%shift%' OR
        table_name LIKE '%asign%'
      )
      ORDER BY table_name
    `);

    console.log('\nTablas encontradas:');
    relatedTables.rows.forEach(t => {
      console.log(`  • ${t.table_name}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('INVESTIGACIÓN COMPLETADA');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

investigateTables();

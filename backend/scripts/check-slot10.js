const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function checkSlot10() {
  try {
    const date = '2026-01-12';

    console.log('🔍 Analizando Slot 10 vs Slot 1\n');

    // Obtener programación
    const scheduleResult = await pool.query(
      `SELECT assignments_data FROM daily_schedules WHERE date = $1`,
      [date]
    );

    const assignmentsData = scheduleResult.rows[0].assignments_data;

    // Extraer IDs del slot 10
    const slot10Ids = [];
    Object.keys(assignmentsData).forEach(key => {
      const parts = key.split('_');
      if (parts.length === 2 && parts[1] === '10') {
        slot10Ids.push(parseInt(parts[0]));
      }
    });

    console.log(`📊 Slot 10: ${slot10Ids.length} personas`);

    // Consultar personal del slot 10
    const slot10Result = await pool.query(
      `SELECT id, name, role, area, tipo_personal
       FROM personnel
       WHERE id = ANY($1)
       ORDER BY name`,
      [slot10Ids]
    );

    console.log('\n👥 Personal en Slot 10:');
    const byType = {};
    slot10Result.rows.forEach(p => {
      byType[p.tipo_personal] = (byType[p.tipo_personal] || 0) + 1;
    });

    Object.keys(byType).forEach(tipo => {
      console.log(`  ${tipo}: ${byType[tipo]} personas`);
    });

    console.log('\n📋 Listado completo:');
    slot10Result.rows.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (${p.tipo_personal} - ${p.role})`);
    });

    // Consultar qué son los slots
    console.log('\n🕐 Intentando identificar horarios de slots...');
    console.log('   (buscando en tablas relacionadas)');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkSlot10();

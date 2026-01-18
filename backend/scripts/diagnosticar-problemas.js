const pool = require('../config/database');

async function diagnosticar() {
  try {
    console.log('🔍 DIAGNÓSTICO DE PROBLEMAS\n');
    console.log('='.repeat(60));

    // Problema 2: Verificar abril después del 21
    console.log('\n📊 PROBLEMA 2: Asignaciones después del 21 de abril\n');

    const abril = await pool.query(
      `SELECT date, assignments_data FROM daily_schedules
       WHERE date >= $1 AND date <= $2
       ORDER BY date`,
      ['2026-04-21', '2026-05-10']
    );

    abril.rows.forEach(row => {
      const date = row.date.toISOString().split('T')[0];
      const assignCount = row.assignments_data ? Object.keys(row.assignments_data).length : 0;
      const dayOfWeek = row.date.getDay();
      const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dayOfWeek];

      if (assignCount === 0) {
        console.log(`  ⚠️  ${date} (${dayName}): SIN ASIGNACIONES`);
      } else {
        console.log(`  ✅ ${date} (${dayName}): ${assignCount} asignaciones`);
      }
    });

    // Problema 3: Contribuciones 4 de abril
    console.log('\n📊 PROBLEMA 3: Contribuciones fin de semana\n');

    const finesSemana = await pool.query(
      `SELECT date FROM daily_schedules
       WHERE date >= $1 AND date <= $2
       AND EXTRACT(DOW FROM date) IN (0, 6)
       ORDER BY date`,
      ['2026-04-01', '2026-04-30']
    );

    console.log('Fines de semana de abril guardados en DB:');
    finesSemana.rows.forEach(row => {
      console.log(`  - ${row.date.toISOString().split('T')[0]}`);
    });

    pool.end();
  } catch (error) {
    console.error('Error:', error);
    pool.end();
  }
}

diagnosticar();

const pool = require('../config/database');

async function cleanContribucionesCallTimes() {
  try {
    // IDs de CONTRIBUCIONES
    const contribIds = [91, 92, 93];

    // Obtener programaciones con callTimes de CONTRIBUCIONES
    const result = await pool.query(`
      SELECT date, programs_data
      FROM daily_schedules
      WHERE date >= '2026-01-06' AND date <= '2026-01-31'
      ORDER BY date
    `);

    console.log(`📅 Encontrados ${result.rows.length} días a revisar`);

    for (const row of result.rows) {
      const data = row.programs_data;

      if (data && data.callTimes) {
        const hasContrib = Object.keys(data.callTimes).some(k =>
          contribIds.includes(parseInt(k))
        );

        if (hasContrib) {
          // Eliminar callTimes de CONTRIBUCIONES
          contribIds.forEach(id => {
            if (data.callTimes[id.toString()]) {
              console.log(`   🗑️ ${row.date}: Eliminando callTime de persona ${id}`);
              delete data.callTimes[id.toString()];
            }
          });

          // Actualizar en la BD
          await pool.query(
            'UPDATE daily_schedules SET programs_data = $1 WHERE date = $2',
            [JSON.stringify(data), row.date]
          );
        }
      }
    }

    console.log('✅ Limpieza completada');
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    pool.end();
    process.exit(1);
  }
}

cleanContribucionesCallTimes();

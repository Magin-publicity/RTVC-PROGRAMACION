const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function cleanContribWeekendAssignments() {
  try {
    console.log('🧹 Limpiando asignaciones de CONTRIBUCIONES en fines de semana...\n');

    // Obtener IDs de personal de CONTRIBUCIONES
    const contribPersonnel = await pool.query(`
      SELECT id, name FROM personnel
      WHERE area = 'CONTRIBUCIONES' AND active = true
    `);

    const contribIds = contribPersonnel.rows.map(p => p.id.toString());
    console.log(`📋 Personal de CONTRIBUCIONES: ${contribPersonnel.rows.map(p => p.name).join(', ')}`);
    console.log(`📋 IDs: ${contribIds.join(', ')}\n`);

    // Obtener todos los schedules de fines de semana
    const weekendSchedules = await pool.query(`
      SELECT date, assignments_data
      FROM daily_schedules
      WHERE EXTRACT(DOW FROM date) IN (0, 6)
      ORDER BY date
    `);

    console.log(`📅 Encontrados ${weekendSchedules.rows.length} fines de semana en la base de datos\n`);

    let totalCleaned = 0;

    for (const schedule of weekendSchedules.rows) {
      const { date, assignments_data } = schedule;
      const dayOfWeek = new Date(date + 'T12:00:00').getDay();
      const dayName = dayOfWeek === 0 ? 'Domingo' : 'Sábado';

      let assignments = assignments_data || {};
      let cleanedCount = 0;

      // Eliminar todas las asignaciones de CONTRIBUCIONES
      Object.keys(assignments).forEach(key => {
        const personnelId = key.split('_')[0];
        if (contribIds.includes(personnelId)) {
          delete assignments[key];
          cleanedCount++;
        }
      });

      if (cleanedCount > 0) {
        // Actualizar la base de datos
        await pool.query(
          `UPDATE daily_schedules
           SET assignments_data = $1
           WHERE date = $2`,
          [assignments, date]
        );

        console.log(`✅ ${dayName} ${date}: Eliminadas ${cleanedCount} asignaciones de CONTRIBUCIONES`);
        totalCleaned += cleanedCount;
      }
    }

    console.log(`\n✅ Total: ${totalCleaned} asignaciones de CONTRIBUCIONES eliminadas de fines de semana`);
    console.log('✨ Las asignaciones se regenerarán automáticamente según la rotación de 3 semanas');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

cleanContribWeekendAssignments();

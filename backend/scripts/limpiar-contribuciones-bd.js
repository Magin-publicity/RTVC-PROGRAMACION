// Script para limpiar TODAS las asignaciones incorrectas de CONTRIBUCIONES de la BD
const db = require('../config/database');

async function limpiarContribucionesBD() {
  try {
    console.log('🧹 Limpiando asignaciones incorrectas de CONTRIBUCIONES de la BD...\n');

    // Obtener todos los schedules
    const scheduleResult = await db.query(`
      SELECT date, assignments_data
      FROM daily_schedules
      WHERE assignments_data IS NOT NULL
      ORDER BY date
    `);

    const schedules = scheduleResult.rows || scheduleResult;
    console.log(`📅 Encontrados ${schedules.length} schedules\n`);

    // Obtener IDs del personal de CONTRIBUCIONES
    const personnelResult = await db.query(`
      SELECT id, name
      FROM personnel
      WHERE area = 'CONTRIBUCIONES'
        AND active = true
    `);

    const contribucionesIds = (personnelResult.rows || personnelResult).map(p => p.id.toString());
    console.log(`👥 Personal de CONTRIBUCIONES: ${contribucionesIds.join(', ')}\n`);

    let totalCleaned = 0;

    for (const schedule of schedules) {
      const date = schedule.date.toISOString().split('T')[0];
      const assignmentsData = schedule.assignments_data;

      if (!assignmentsData) continue;

      let modified = false;
      const newAssignments = { ...assignmentsData };

      // Recorrer todas las keys y eliminar las de CONTRIBUCIONES
      Object.keys(newAssignments).forEach(key => {
        const [personnelId] = key.split('_');

        // Si es personal de CONTRIBUCIONES, eliminar la asignación
        if (contribucionesIds.includes(personnelId)) {
          delete newAssignments[key];
          modified = true;
          totalCleaned++;
        }
      });

      // Si se modificó, actualizar en BD
      if (modified) {
        await db.query(`
          UPDATE daily_schedules
          SET assignments_data = $1,
              updated_at = NOW()
          WHERE date = $2
        `, [JSON.stringify(newAssignments), date]);

        console.log(`✅ ${date}: Limpiadas asignaciones de CONTRIBUCIONES`);
      }
    }

    console.log(`\n✅ Limpieza completada: ${totalCleaned} asignaciones eliminadas`);
    console.log('🔄 Ahora recarga la página para que se generen correctamente');

    await db.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await db.end();
    process.exit(1);
  }
}

limpiarContribucionesBD();

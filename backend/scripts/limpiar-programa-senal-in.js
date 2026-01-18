// Script para limpiar el programa "señal in" de todos los daily_schedules
const pool = require('../config/database');

async function limpiarSenalIn() {
  try {
    console.log('🧹 Limpiando programa "señal in" de todos los schedules...');

    // Obtener todos los daily_schedules
    const result = await pool.query('SELECT date, programs_data FROM daily_schedules');

    let schedulesUpdated = 0;
    let programsRemoved = 0;

    for (const row of result.rows) {
      const programsData = row.programs_data || {};
      const programs = programsData.programs || [];

      // Filtrar programas que contengan "señal in" (case insensitive)
      const filteredPrograms = programs.filter(p =>
        !p.name || p.name.toLowerCase() !== 'señal in'
      );

      // Si se eliminó algún programa, actualizar
      if (filteredPrograms.length < programs.length) {
        const removedCount = programs.length - filteredPrograms.length;
        programsRemoved += removedCount;

        console.log(`   📅 ${row.date}: Eliminando ${removedCount} programa(s)`);

        // Actualizar programs_data
        const updatedProgramsData = {
          ...programsData,
          programs: filteredPrograms
        };

        await pool.query(
          'UPDATE daily_schedules SET programs_data = $1, updated_at = CURRENT_TIMESTAMP WHERE date = $2',
          [JSON.stringify(updatedProgramsData), row.date]
        );

        schedulesUpdated++;
      }
    }

    console.log(`\n✅ Limpieza completada:`);
    console.log(`   📊 Schedules actualizados: ${schedulesUpdated}`);
    console.log(`   🗑️  Programas eliminados: ${programsRemoved}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error limpiando programa:', error);
    process.exit(1);
  }
}

limpiarSenalIn();

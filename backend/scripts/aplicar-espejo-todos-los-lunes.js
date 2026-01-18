const pool = require('../database/db');

// Script para aplicar espejo semanal a TODOS los lunes del año

async function aplicarEspejoTodosLosLunes() {
  try {
    console.log('\n🔄 Aplicando espejo semanal a TODOS los lunes del año...\n');

    // 1. Obtener todos los lunes únicos de la BD
    const lunesResult = await pool.query(`
      SELECT DISTINCT date
      FROM daily_schedules
      WHERE EXTRACT(DOW FROM date) = 1
      ORDER BY date
    `);

    console.log(`📊 Lunes encontrados: ${lunesResult.rows.length}\n`);

    let totalActualizados = 0;
    let totalErrores = 0;

    // 2. Para cada lunes, copiar a su semana
    for (const row of lunesResult.rows) {
      const lunes = row.date;
      const lunesFecha = new Date(lunes);

      console.log(`\n📅 Procesando semana del ${lunes}`);

      // Obtener datos del lunes
      const lunesData = await pool.query(
        'SELECT assignments_data, programs_data FROM daily_schedules WHERE date = $1',
        [lunes]
      );

      if (lunesData.rows.length === 0) {
        console.log(`   ⚠️  Sin datos`);
        totalErrores++;
        continue;
      }

      const data = lunesData.rows[0];
      const numAsignaciones = Object.keys(data.assignments_data).length;

      console.log(`   📊 ${numAsignaciones} asignaciones`);

      // Calcular fechas de la semana (martes a viernes)
      const fechasSemana = [];
      for (let i = 1; i <= 4; i++) { // 1=martes, 2=miércoles, 3=jueves, 4=viernes
        const fecha = new Date(lunesFecha);
        fecha.setDate(fecha.getDate() + i);
        fechasSemana.push(fecha.toISOString().split('T')[0]);
      }

      // Copiar a cada día de la semana
      for (const fecha of fechasSemana) {
        // Verificar si existe la fecha
        const existeResult = await pool.query(
          'SELECT date FROM daily_schedules WHERE date = $1',
          [fecha]
        );

        if (existeResult.rows.length > 0) {
          // Actualizar
          await pool.query(
            `UPDATE daily_schedules
             SET assignments_data = $1,
                 programs_data = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE date = $3`,
            [
              JSON.stringify(data.assignments_data),
              JSON.stringify(data.programs_data),
              fecha
            ]
          );
          console.log(`   ✅ ${fecha} actualizado`);
          totalActualizados++;
        } else {
          console.log(`   ⚠️  ${fecha} no existe en BD`);
        }
      }
    }

    console.log(`\n\n📊 RESUMEN:`);
    console.log(`   ✅ Días actualizados: ${totalActualizados}`);
    console.log(`   ⚠️  Lunes sin datos: ${totalErrores}`);
    console.log(`\n✅ Espejo semanal aplicado a todo el año\n`);

    await pool.end();

  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

aplicarEspejoTodosLosLunes();

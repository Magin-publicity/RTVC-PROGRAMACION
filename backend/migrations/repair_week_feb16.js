// Script de reparación: copia el snapshot del lunes 16/02 a martes-viernes
const pool = require('../config/database');

async function repairWeek() {
  try {
    // 1. Obtener el snapshot del lunes 16 (datos correctos del usuario)
    const lunesResult = await pool.query(
      "SELECT * FROM daily_schedules_log WHERE date = '2026-02-16'"
    );

    if (lunesResult.rows.length === 0) {
      console.log('ERROR: No hay snapshot del lunes 16 en daily_schedules_log');
      process.exit(1);
    }

    const lunes = lunesResult.rows[0];
    console.log('✅ Lunes 16 encontrado en LOG');
    console.log('   assignments_data size:', JSON.stringify(lunes.assignments_data).length, 'chars');
    console.log('   programs keys:', Object.keys(lunes.programs || {}));

    // 2. Copiar a martes-viernes SOLO si no tienen snapshot propio
    const dias = ['2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20'];

    for (const dia of dias) {
      const existing = await pool.query(
        'SELECT date, saved_at FROM daily_schedules_log WHERE date = $1',
        [dia]
      );

      if (existing.rows.length > 0) {
        console.log(`   ⏭️  ${dia} ya tiene snapshot propio - NO se toca`);
        continue;
      }

      await pool.query(
        `INSERT INTO daily_schedules_log (date, assignments_data, programs, novelties_snapshot, saved_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [dia, lunes.assignments_data, lunes.programs, lunes.novelties_snapshot]
      );
      console.log(`   ✅ ${dia} copiado desde lunes 16`);
    }

    // 3. También reparar daily_schedules (tabla de trabajo) para que sea consistente
    for (const dia of dias) {
      const existingWork = await pool.query(
        'SELECT date FROM daily_schedules WHERE date = $1',
        [dia]
      );

      // Reconstruir programs_data con los datos del lunes
      const programsData = {
        ...(lunes.programs || {}),
        callTimes: lunes.assignments_data?.callTimes || {},
        endTimes: lunes.assignments_data?.endTimes || {},
        manualCallTimes: lunes.assignments_data?.manualCallTimes || {},
        manualEndTimes: lunes.assignments_data?.manualEndTimes || {},
        manualAssignments: lunes.assignments_data?.manualAssignments || {}
      };

      // Extraer solo asignaciones puras (sin callTimes/endTimes/etc)
      const { callTimes, endTimes, manualCallTimes, manualEndTimes, manualAssignments, ...pureAssignments } = lunes.assignments_data || {};

      if (existingWork.rows.length > 0) {
        await pool.query(
          `UPDATE daily_schedules SET assignments_data = $2, programs_data = $3, updated_at = CURRENT_TIMESTAMP WHERE date = $1`,
          [dia, pureAssignments, programsData]
        );
        console.log(`   🔄 ${dia} actualizado en daily_schedules (work table)`);
      } else {
        await pool.query(
          `INSERT INTO daily_schedules (date, assignments_data, programs_data, updated_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
          [dia, pureAssignments, programsData]
        );
        console.log(`   ➕ ${dia} creado en daily_schedules (work table)`);
      }
    }

    console.log('\n✅ Reparación de semana completada exitosamente');
    console.log('   Los días 17-20 ahora tienen la programación del lunes 16');

  } catch (err) {
    console.error('❌ Error en reparación:', err.message);
  } finally {
    process.exit(0);
  }
}

repairWeek();

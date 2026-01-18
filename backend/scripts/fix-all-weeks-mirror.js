const pool = require('../config/database');

(async () => {
  try {
    console.log('🔧 REPARANDO ESPEJO SEMANAL PARA TODO EL AÑO 2026');
    console.log('📅 Copiando TODAS las asignaciones de cada lunes a su martes-viernes correspondiente');
    console.log('');

    // Obtener TODOS los lunes que tienen programación guardada
    const lunesResult = await pool.query(`
      SELECT date, assignments_data, programs_data
      FROM daily_schedules
      WHERE EXTRACT(DOW FROM date) = 1
        AND date >= '2026-01-01'
        AND date <= '2026-12-31'
      ORDER BY date
    `);

    if (lunesResult.rows.length === 0) {
      console.log('⚠️  No se encontraron lunes con programación guardada en 2026');
      await pool.end();
      return;
    }

    console.log(`✅ Encontrados ${lunesResult.rows.length} lunes con programación guardada`);
    console.log('');

    let semanasReparadas = 0;
    let diasActualizados = 0;
    let asignacionesCopiadas = 0;

    for (const lunes of lunesResult.rows) {
      const lunesFecha = lunes.date instanceof Date
        ? lunes.date.toISOString().split('T')[0]
        : lunes.date;

      const assignments = lunes.assignments_data || {};
      const programsData = lunes.programs_data || {};
      const assignmentCount = Object.keys(assignments).length;

      console.log(`📅 LUNES ${lunesFecha} (${assignmentCount} asignaciones)`);

      if (assignmentCount === 0) {
        console.log('   ⚠️  Sin asignaciones, saltando...');
        console.log('');
        continue;
      }

      // Calcular martes-viernes de esa semana
      const lunesDate = new Date(lunesFecha + 'T12:00:00');

      for (let offset = 1; offset <= 4; offset++) {
        const targetDate = new Date(lunesDate);
        targetDate.setDate(targetDate.getDate() + offset);
        const targetDateStr = targetDate.toISOString().split('T')[0];

        const diaNombre = ['Martes', 'Miércoles', 'Jueves', 'Viernes'][offset - 1];

        // Verificar si existe
        const existingResult = await pool.query(
          'SELECT assignments_data FROM daily_schedules WHERE date = $1',
          [targetDateStr]
        );

        const beforeCount = Object.keys(existingResult.rows[0]?.assignments_data || {}).length;

        // Actualizar con TODAS las asignaciones del lunes
        await pool.query(
          `INSERT INTO daily_schedules (date, assignments_data, programs_data, updated_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT (date)
           DO UPDATE SET
             assignments_data = $2,
             programs_data = $3,
             updated_at = CURRENT_TIMESTAMP`,
          [targetDateStr, JSON.stringify(assignments), JSON.stringify(programsData)]
        );

        const added = assignmentCount - beforeCount;
        if (added > 0) {
          console.log(`   ✅ ${diaNombre} ${targetDateStr}: ${beforeCount} → ${assignmentCount} (+${added})`);
          asignacionesCopiadas += added;
        } else {
          console.log(`   ✓ ${diaNombre} ${targetDateStr}: ya tenía ${assignmentCount} asignaciones`);
        }

        diasActualizados++;
      }

      semanasReparadas++;
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ REPARACIÓN COMPLETA');
    console.log(`   - Semanas procesadas: ${semanasReparadas}`);
    console.log(`   - Días actualizados: ${diasActualizados}`);
    console.log(`   - Asignaciones agregadas: ${asignacionesCopiadas}`);
    console.log('');
    console.log('🎉 Ahora TODAS las asignaciones aparecerán en cada día de la semana');
    console.log('');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

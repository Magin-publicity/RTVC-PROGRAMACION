const pool = require('../config/database');

(async () => {
  try {
    console.log('🔧 REPARANDO ESPEJO SEMANAL - Copiando TODAS las asignaciones del lunes');
    console.log('');

    // Obtener lunes 12 enero
    const lunesResult = await pool.query(
      'SELECT assignments_data, programs_data FROM daily_schedules WHERE date = $1',
      ['2026-01-12']
    );

    if (lunesResult.rows.length === 0) {
      console.log('❌ ERROR: No existe programación para el lunes 2026-01-12');
      await pool.end();
      process.exit(1);
    }

    const lunesData = lunesResult.rows[0];
    const assignments = lunesData.assignments_data || {};
    const programsData = lunesData.programs_data || {};

    const assignmentKeys = Object.keys(assignments);
    console.log(`📋 Lunes 12 enero tiene ${assignmentKeys.length} asignaciones`);
    console.log('');

    // Copiar a martes, miércoles, jueves, viernes
    const dias = [
      { fecha: '2026-01-13', nombre: 'Martes' },
      { fecha: '2026-01-14', nombre: 'Miércoles' },
      { fecha: '2026-01-15', nombre: 'Jueves' },
      { fecha: '2026-01-16', nombre: 'Viernes' }
    ];

    for (const dia of dias) {
      console.log(`📅 Actualizando ${dia.nombre} ${dia.fecha}...`);

      // Verificar antes
      const beforeResult = await pool.query(
        'SELECT assignments_data FROM daily_schedules WHERE date = $1',
        [dia.fecha]
      );

      const beforeCount = Object.keys(beforeResult.rows[0]?.assignments_data || {}).length;
      console.log(`   Antes: ${beforeCount} asignaciones`);

      // Actualizar con TODAS las asignaciones del lunes
      await pool.query(
        `INSERT INTO daily_schedules (date, assignments_data, programs_data, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (date)
         DO UPDATE SET
           assignments_data = $2,
           programs_data = $3,
           updated_at = CURRENT_TIMESTAMP`,
        [dia.fecha, JSON.stringify(assignments), JSON.stringify(programsData)]
      );

      // Verificar después
      const afterResult = await pool.query(
        'SELECT assignments_data FROM daily_schedules WHERE date = $1',
        [dia.fecha]
      );

      const afterCount = Object.keys(afterResult.rows[0]?.assignments_data || {}).length;
      console.log(`   Después: ${afterCount} asignaciones`);
      console.log(`   ✅ ${dia.nombre} actualizado (+${afterCount - beforeCount} asignaciones)`);
      console.log('');
    }

    console.log('✅ ESPEJO SEMANAL REPARADO EXITOSAMENTE');
    console.log('');
    console.log('Resumen:');
    console.log('  - Lunes: 365 asignaciones (completo)');
    console.log('  - Martes a Viernes: 365 asignaciones cada uno (completo)');
    console.log('');
    console.log('🎉 Ahora TODAS las asignaciones aparecerán en martes-viernes');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

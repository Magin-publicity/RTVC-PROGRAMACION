const pool = require('../config/database');

(async () => {
  try {
    // Lunes
    const lunesResult = await pool.query(
      'SELECT assignments_data FROM daily_schedules WHERE date = $1',
      ['2026-01-12']
    );

    // Martes
    const martesResult = await pool.query(
      'SELECT assignments_data FROM daily_schedules WHERE date = $1',
      ['2026-01-13']
    );

    const lunesAssignments = lunesResult.rows[0]?.assignments_data || {};
    const martesAssignments = martesResult.rows[0]?.assignments_data || {};

    // Filtrar solo reportería
    const reporteriaPersonnel = await pool.query(`
      SELECT id FROM personnel
      WHERE area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
        AND active = true
    `);

    const reporteriaIds = reporteriaPersonnel.rows.map(p => p.id.toString());

    const lunesReporteria = Object.keys(lunesAssignments).filter(key => {
      const [personnelId] = key.split('_');
      return reporteriaIds.includes(personnelId) && lunesAssignments[key] === true;
    });

    const martesReporteria = Object.keys(martesAssignments).filter(key => {
      const [personnelId] = key.split('_');
      return reporteriaIds.includes(personnelId) && martesAssignments[key] === true;
    });

    console.log('=== COMPARACIÓN LUNES VS MARTES ===\n');
    console.log('LUNES 12 enero:');
    console.log('  Total asignaciones de reportería:', lunesReporteria.length);
    console.log('  Primeras 10:', lunesReporteria.slice(0, 10).join(', '));

    console.log('\nMARTES 13 enero:');
    console.log('  Total asignaciones de reportería:', martesReporteria.length);
    console.log('  Primeras 10:', martesReporteria.slice(0, 10).join(', '));

    // Verificar si son iguales
    const lunesSet = new Set(lunesReporteria);
    const martesSet = new Set(martesReporteria);

    const enLunesNoEnMartes = lunesReporteria.filter(k => !martesSet.has(k));
    const enMartesNoEnLunes = martesReporteria.filter(k => !lunesSet.has(k));

    console.log('\n=== DIFERENCIAS ===');
    console.log('En lunes pero NO en martes:', enLunesNoEnMartes.length);
    if (enLunesNoEnMartes.length > 0 && enLunesNoEnMartes.length <= 10) {
      console.log('  Keys:', enLunesNoEnMartes.join(', '));
    }

    console.log('En martes pero NO en lunes:', enMartesNoEnLunes.length);
    if (enMartesNoEnLunes.length > 0 && enMartesNoEnLunes.length <= 10) {
      console.log('  Keys:', enMartesNoEnLunes.join(', '));
    }

    if (lunesReporteria.length === martesReporteria.length && enLunesNoEnMartes.length === 0) {
      console.log('\n✅ Las asignaciones son IDÉNTICAS');
    } else {
      console.log('\n❌ Las asignaciones son DIFERENTES');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

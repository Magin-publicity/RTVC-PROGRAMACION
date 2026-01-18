const pool = require('../config/database');

(async () => {
  try {
    // Lunes
    const lunesResult = await pool.query(
      'SELECT date, assignments_data FROM daily_schedules WHERE date = $1',
      ['2026-01-12']
    );

    const assignments = lunesResult.rows[0]?.assignments_data || {};

    // Obtener personal de reportería
    const reporteriaPersonnel = await pool.query(`
      SELECT id, name, area FROM personnel
      WHERE area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
        AND active = true
      ORDER BY name
    `);

    const reporteriaIds = reporteriaPersonnel.rows.map(p => p.id.toString());

    console.log('=== ASIGNACIONES DE REPORTERÍA EN LUNES 12 ENERO ===\n');

    reporteriaPersonnel.rows.forEach(person => {
      const personAssignments = Object.keys(assignments).filter(key => {
        const [personnelId] = key.split('_');
        return personnelId === person.id.toString() && assignments[key] === true;
      });

      console.log(`${person.name} (ID ${person.id}): ${personAssignments.length} asignaciones`);
      if (personAssignments.length > 0 && personAssignments.length <= 5) {
        personAssignments.forEach(key => {
          console.log(`  - ${key}`);
        });
      }
    });

    // Resumen total
    const totalReporteriaAssignments = Object.keys(assignments).filter(key => {
      const [personnelId] = key.split('_');
      return reporteriaIds.includes(personnelId) && assignments[key] === true;
    }).length;

    console.log('\n=== RESUMEN ===');
    console.log(`Total personal de reportería: ${reporteriaPersonnel.rows.length}`);
    console.log(`Total asignaciones de reportería: ${totalReporteriaAssignments}`);
    console.log(`Promedio asignaciones por persona: ${(totalReporteriaAssignments / reporteriaPersonnel.rows.length).toFixed(1)}`);

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

const pool = require('../database/db');

async function verAsignaciones() {
  try {
    console.log('📋 Consultando asignaciones del 2025-12-22...\n');

    const result = await pool.query(
      'SELECT date, assignments_data FROM daily_schedules WHERE date = $1',
      ['2025-12-22']
    );

    if (result.rows.length === 0) {
      console.log('❌ No hay datos para el 2025-12-22');
      process.exit(0);
    }

    const assignments = result.rows[0].assignments_data;

    // Filtrar solo asignaciones de reportería
    const reporteriaPersonnel = await pool.query(`
      SELECT id, name, area FROM personnel
      WHERE area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
        AND active = true
      ORDER BY area, name
    `);

    const reporteriaIds = reporteriaPersonnel.rows.map(p => p.id.toString());
    const reporteriaMap = {};
    reporteriaPersonnel.rows.forEach(p => {
      reporteriaMap[p.id] = p;
    });

    console.log('🎯 ASIGNACIONES DE REPORTERÍA DEL 22 DE DICIEMBRE:\n');

    let count = 0;
    Object.entries(assignments).forEach(([key, programName]) => {
      const [personnelId, programId] = key.split('_');

      if (reporteriaIds.includes(personnelId)) {
        const person = reporteriaMap[personnelId];
        console.log(`   ${person.name} (${person.area}) → ${programName}`);
        count++;
      }
    });

    console.log(`\n✅ Total de asignaciones de reportería: ${count}`);

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verAsignaciones();

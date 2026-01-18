const pool = require('../config/database');

(async () => {
  try {
    // Martes
    const martesResult = await pool.query(
      'SELECT date, assignments_data FROM daily_schedules WHERE date = $1',
      ['2026-01-13']
    );

    const martesKeys = Object.keys(martesResult.rows[0]?.assignments_data || {});

    // Extraer personnel_ids únicos
    const personnelIds = [...new Set(martesKeys.map(k => k.split('_')[0]))];

    console.log('=== PERSONAL EN MARTES 13 ENERO ===');
    console.log('Total personnel_ids únicos:', personnelIds.length);
    console.log('IDs:', personnelIds.join(', '));

    // Buscar nombres en la BD
    const namesResult = await pool.query(
      'SELECT id, name, area FROM personnel WHERE id = ANY($1::int[])',
      [personnelIds]
    );

    console.log('\n=== NOMBRES Y ÁREAS ===');
    namesResult.rows.forEach(p => {
      const assignmentCount = martesKeys.filter(k => k.startsWith(p.id + '_')).length;
      console.log(`${p.id} - ${p.name} (${p.area}): ${assignmentCount} asignaciones`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

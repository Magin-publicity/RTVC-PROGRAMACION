const pool = require('../config/database');

(async () => {
  try {
    // Ver datos del 13 de enero (martes)
    const result = await pool.query(
      'SELECT date, assignments_data FROM daily_schedules WHERE date = $1',
      ['2026-01-13']
    );

    if (result.rows.length > 0) {
      const data = result.rows[0];
      const keys = Object.keys(data.assignments_data || {});
      console.log('=== Enero 13, 2026 (Martes) ===');
      console.log('Total keys en assignments_data:', keys.length);

      // Analizar tipos de keys
      const personnelOnlyKeys = keys.filter(k => !k.includes('_'));
      const assignmentKeys = keys.filter(k => k.includes('_'));

      console.log('\nAnálisis de keys:');
      console.log('  - Solo personnel_id (sin programa):', personnelOnlyKeys.length);
      console.log('  - Con asignación (personnel_id_program_id_espacio):', assignmentKeys.length);

      // Mostrar ejemplos
      console.log('\nEjemplos de keys solo personnel:');
      personnelOnlyKeys.slice(0, 3).forEach(key => {
        console.log('  -', key, ':', data.assignments_data[key]);
      });

      console.log('\nEjemplos de keys con asignación:');
      assignmentKeys.slice(0, 3).forEach(key => {
        console.log('  -', key, ':', data.assignments_data[key]);
      });
    } else {
      console.log('No existe programación para 2026-01-13');
    }

    // Ahora ver datos del lunes
    const lunesResult = await pool.query(
      'SELECT date, assignments_data FROM daily_schedules WHERE date = $1',
      ['2026-01-13']
    );

    // Calcular el lunes de esa semana
    const fecha = new Date('2026-01-13T12:00:00');
    const diaSemana = fecha.getDay(); // 2 = martes
    const diasHastaLunes = 1 - diaSemana; // 1 - 2 = -1
    const lunesDate = new Date(fecha);
    lunesDate.setDate(lunesDate.getDate() + diasHastaLunes);
    const lunesStr = lunesDate.toISOString().split('T')[0];

    console.log('\n=== Lunes de esa semana:', lunesStr, '===');

    const lunesData = await pool.query(
      'SELECT date, assignments_data FROM daily_schedules WHERE date = $1',
      [lunesStr]
    );

    if (lunesData.rows.length > 0) {
      const keys = Object.keys(lunesData.rows[0].assignments_data || {});
      console.log('Total keys en assignments_data del lunes:', keys.length);
    } else {
      console.log('NO EXISTE programación para el lunes', lunesStr);
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

const pool = require('../config/database');

(async () => {
  try {
    // Lunes
    const lunesResult = await pool.query(
      'SELECT date, assignments_data FROM daily_schedules WHERE date = $1',
      ['2026-01-12']
    );

    // Martes
    const martesResult = await pool.query(
      'SELECT date, assignments_data FROM daily_schedules WHERE date = $1',
      ['2026-01-13']
    );

    const lunesKeys = Object.keys(lunesResult.rows[0]?.assignments_data || {});
    const martesKeys = Object.keys(martesResult.rows[0]?.assignments_data || {});

    console.log('=== LUNES (2026-01-12) ===');
    console.log('Total keys:', lunesKeys.length);
    console.log('Primeros 10 ejemplos:');
    lunesKeys.slice(0, 10).forEach(key => {
      console.log('  -', key);
    });

    console.log('\n=== MARTES (2026-01-13) ===');
    console.log('Total keys:', martesKeys.length);
    console.log('Primeros 10 ejemplos:');
    martesKeys.slice(0, 10).forEach(key => {
      console.log('  -', key);
    });

    // Analizar diferencias
    console.log('\n=== ANÁLISIS ===');

    // Contar keys de reportería
    const lunesReporteria = lunesKeys.filter(k => {
      const parts = k.split('_');
      return parts.length === 3; // personnel_id_program_id_espacio
    });

    const martesReporteria = martesKeys.filter(k => {
      const parts = k.split('_');
      return parts.length === 3;
    });

    console.log('Lunes - Keys con formato personnel_id_program_id_espacio:', lunesReporteria.length);
    console.log('Martes - Keys con formato personnel_id_program_id_espacio:', martesReporteria.length);

    // Contar keys de otros formatos
    const lunesOtros = lunesKeys.filter(k => {
      const parts = k.split('_');
      return parts.length === 2; // personnel_id_program_id
    });

    const martesOtros = martesKeys.filter(k => {
      const parts = k.split('_');
      return parts.length === 2;
    });

    console.log('\nLunes - Keys con formato personnel_id_program_id (2 partes):', lunesOtros.length);
    console.log('Martes - Keys con formato personnel_id_program_id (2 partes):', martesOtros.length);

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

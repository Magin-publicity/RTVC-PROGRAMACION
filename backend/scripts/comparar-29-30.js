const pool = require('../database/db');

async function comparar() {
  try {
    // Obtener lunes 29
    const lunes = await pool.query(
      'SELECT assignments_data FROM daily_schedules WHERE date = $1',
      ['2025-12-29']
    );

    // Obtener martes 30
    const martes = await pool.query(
      'SELECT assignments_data FROM daily_schedules WHERE date = $1',
      ['2025-12-30']
    );

    if (lunes.rows.length === 0) {
      console.log('❌ Lunes 29 no tiene programación');
      await pool.end();
      return;
    }

    if (martes.rows.length === 0) {
      console.log('❌ Martes 30 no tiene programación');
      await pool.end();
      return;
    }

    const lunesAssignments = lunes.rows[0].assignments_data;
    const martesAssignments = martes.rows[0].assignments_data;

    // Comparar Álvaro Díaz (ID 94)
    const alvaroLunes = Object.entries(lunesAssignments).filter(([k]) => k.startsWith('94_'));
    const alvaroMartes = Object.entries(martesAssignments).filter(([k]) => k.startsWith('94_'));

    console.log('\n🎯 ÁLVARO DÍAZ (ID 94):');
    console.log(`\n📅 LUNES 29 (${alvaroLunes.length} asignaciones):`);
    alvaroLunes.forEach(([key, value]) => {
      const [, programId] = key.split('_');
      console.log(`   Programa ${programId}: ${value}`);
    });

    console.log(`\n📅 MARTES 30 (${alvaroMartes.length} asignaciones):`);
    alvaroMartes.forEach(([key, value]) => {
      const [, programId] = key.split('_');
      console.log(`   Programa ${programId}: ${value}`);
    });

    // Ver si son iguales
    const iguales = JSON.stringify(alvaroLunes.sort()) === JSON.stringify(alvaroMartes.sort());
    console.log(`\n${iguales ? '✅ Son IGUALES' : '❌ Son DIFERENTES'}`);

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

comparar();

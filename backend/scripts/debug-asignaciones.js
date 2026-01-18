const pool = require('../database/db');

async function debugAsignaciones() {
  try {
    const fecha = '2025-12-22';

    const scheduleResult = await pool.query(
      'SELECT assignments_data, programs_data FROM daily_schedules WHERE date = $1',
      [fecha]
    );

    const assignmentsData = scheduleResult.rows[0]?.assignments_data || {};
    const programsData = scheduleResult.rows[0]?.programs_data || {};
    const programs = programsData.programs || [];

    console.log('\n📋 PROGRAMAS DISPONIBLES:');
    programs.forEach(p => {
      console.log(`   ${p.id}: ${p.name} (${p.defaultTime || p.time})`);
    });

    console.log('\n📊 PRIMERAS 10 ASIGNACIONES:');
    const entries = Object.entries(assignmentsData).slice(0, 10);
    entries.forEach(([key, value]) => {
      const [personnelId, programId] = key.split('_');
      const programa = programs.find(p => p.id === programId);
      console.log(`   ${key} = ${value} → Programa: ${programa?.name || 'NO ENCONTRADO'}`);
    });

    // Probar con Álvaro Díaz (ID 94)
    console.log('\n🎯 ASIGNACIONES DE ÁLVARO DÍAZ (ID 94):');
    const alvaroAssignments = Object.entries(assignmentsData).filter(([key]) => key.startsWith('94_'));
    alvaroAssignments.forEach(([key, value]) => {
      const [personnelId, programId] = key.split('_');
      const programa = programs.find(p => p.id === programId);
      console.log(`   ${key} = ${value} → ${programa?.name || 'NO ENCONTRADO'}`);
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugAsignaciones();

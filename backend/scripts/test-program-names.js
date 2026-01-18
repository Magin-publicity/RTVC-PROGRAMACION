// Script para verificar datos de programas y asignaciones
const pool = require('../config/database');

async function testProgramData() {
  try {
    console.log('🔍 Verificando datos de programas...\n');

    // 1. Verificar si hay programas en la tabla
    const programsResult = await pool.query('SELECT COUNT(*) as count FROM programas');
    console.log(`📊 Total de programas en base de datos: ${programsResult.rows[0].count}`);

    if (programsResult.rows[0].count > 0) {
      const samplePrograms = await pool.query('SELECT id, nombre FROM programas LIMIT 5');
      console.log('📺 Programas de ejemplo:');
      samplePrograms.rows.forEach(p => console.log(`   - ${p.id}: ${p.nombre}`));
    }

    console.log('');

    // 2. Verificar si hay asignaciones de personal
    const assignmentsResult = await pool.query('SELECT COUNT(*) as count FROM personal_asignado');
    console.log(`📋 Total de asignaciones en base de datos: ${assignmentsResult.rows[0].count}`);

    if (assignmentsResult.rows[0].count > 0) {
      const sampleAssignments = await pool.query(`
        SELECT pa.id, pa.fecha, p.nombre as programa, per.name as personal
        FROM personal_asignado pa
        JOIN programas p ON pa.id_programa = p.id
        JOIN personnel per ON pa.id_personal = per.id
        LIMIT 5
      `);
      console.log('👥 Asignaciones de ejemplo:');
      sampleAssignments.rows.forEach(a =>
        console.log(`   - ${a.fecha}: ${a.personal} → ${a.programa}`)
      );
    }

    console.log('');

    // 3. Verificar campo program_name en meal_requests
    const mealRequestsResult = await pool.query(`
      SELECT COUNT(*) as total,
             COUNT(program_name) as with_program
      FROM meal_requests
    `);
    console.log(`🍽️  Solicitudes de comida:`);
    console.log(`   - Total: ${mealRequestsResult.rows[0].total}`);
    console.log(`   - Con programa asignado: ${mealRequestsResult.rows[0].with_program}`);

    if (mealRequestsResult.rows[0].with_program > 0) {
      const samplesWithProgram = await pool.query(`
        SELECT personnel_name, program_name, service_date
        FROM meal_requests
        WHERE program_name IS NOT NULL
        LIMIT 5
      `);
      console.log('📋 Solicitudes con programa:');
      samplesWithProgram.rows.forEach(r =>
        console.log(`   - ${r.personnel_name} (${r.service_date}): ${r.program_name}`)
      );
    }

    console.log('\n✅ Verificación completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testProgramData();

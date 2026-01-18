// Script para crear asignaciones de personal a programas de ejemplo
const pool = require('../config/database');

async function seedSampleAssignments() {
  try {
    console.log('👥 Creando asignaciones de ejemplo...\n');

    // Obtener algunos programas
    const programsResult = await pool.query('SELECT id, nombre, horario_inicio, horario_fin FROM programas ORDER BY id LIMIT 4');
    if (programsResult.rows.length === 0) {
      console.log('⚠️  No hay programas. Ejecuta seed-sample-programs.js primero.');
      process.exit(1);
    }

    // Obtener algunos del personal activo
    const personnelResult = await pool.query(`
      SELECT id, name, area FROM personnel
      WHERE active = true
      ORDER BY id
      LIMIT 20
    `);

    if (personnelResult.rows.length === 0) {
      console.log('⚠️  No hay personal en la base de datos.');
      process.exit(1);
    }

    console.log(`📋 Programas disponibles: ${programsResult.rows.length}`);
    console.log(`👤 Personal disponible: ${personnelResult.rows.length}\n`);

    // Fecha de hoy
    const today = new Date().toISOString().split('T')[0];

    // Crear asignaciones para hoy
    let assignmentCount = 0;
    for (let i = 0; i < Math.min(10, personnelResult.rows.length); i++) {
      const person = personnelResult.rows[i];
      const program = programsResult.rows[i % programsResult.rows.length];

      try {
        const result = await pool.query(`
          INSERT INTO personal_asignado
            (id_personal, id_programa, fecha, hora_inicio, hora_fin, rol, estado)
          VALUES ($1, $2, $3, $4, $5, $6, 'programado')
          RETURNING id
        `, [
          person.id,
          program.id,
          today,
          program.horario_inicio,
          program.horario_fin,
          person.area
        ]);

        console.log(`✅ ${person.name} → ${program.nombre} (${today})`);
        assignmentCount++;
      } catch (error) {
        if (error.code === '23505') {
          console.log(`⏭️  Ya existe asignación para ${person.name} en ${today}`);
        } else {
          console.error(`❌ Error asignando ${person.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ ${assignmentCount} asignaciones creadas para ${today}`);

    // Mostrar resumen
    const summary = await pool.query(`
      SELECT p.nombre as programa, COUNT(*) as personas
      FROM personal_asignado pa
      JOIN programas p ON pa.id_programa = p.id
      WHERE pa.fecha = $1
      GROUP BY p.nombre
      ORDER BY p.nombre
    `, [today]);

    console.log('\n📊 Resumen de asignaciones de hoy:');
    summary.rows.forEach(s => {
      console.log(`   - ${s.programa}: ${s.personas} personas`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedSampleAssignments();

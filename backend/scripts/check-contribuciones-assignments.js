// Script para verificar asignaciones de CONTRIBUCIONES
const db = require('../config/database');

async function checkContribucionesAssignments() {
  try {
    console.log('Verificando asignaciones de CONTRIBUCIONES para 2025-12-20...\n');

    const result = await db.query(`
      SELECT
        pa.*,
        p.name,
        p.area,
        pg.nombre as programa,
        pg.horario_inicio
      FROM program_assignments pa
      JOIN personnel p ON pa.personnel_id = p.id
      JOIN programas pg ON pa.program_id::integer = pg.id
      WHERE p.area = 'CONTRIBUCIONES'
        AND pa.date = '2025-12-20'
      ORDER BY p.name, pg.horario_inicio
    `);

    const assignments = result.rows || result;

    console.log(`Total asignaciones: ${assignments.length}\n`);

    // Agrupar por persona
    const byPerson = assignments.reduce((acc, a) => {
      if (!acc[a.name]) acc[a.name] = [];
      acc[a.name].push(a);
      return acc;
    }, {});

    Object.entries(byPerson).forEach(([person, asignaciones]) => {
      console.log(`\n${person}:`);
      asignaciones.forEach(a => {
        console.log(`  ${a.horario_inicio} - ${a.programa}`);
      });
    });

    await db.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await db.end();
    process.exit(1);
  }
}

checkContribucionesAssignments();

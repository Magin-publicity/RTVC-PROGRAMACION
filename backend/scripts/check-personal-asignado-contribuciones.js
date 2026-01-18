// Script para verificar asignaciones de CONTRIBUCIONES en personal_asignado
const db = require('../config/database');

async function checkPersonalAsignado() {
  try {
    console.log('Verificando personal_asignado de CONTRIBUCIONES para 2025-12-20...\n');

    const result = await db.query(`
      SELECT
        pa.*,
        p.name,
        p.area,
        pg.nombre as programa,
        m.nombre as master
      FROM personal_asignado pa
      JOIN personnel p ON pa.id_personal = p.id
      LEFT JOIN programas pg ON pa.id_programa = pg.id
      LEFT JOIN masters m ON pa.id_master = m.id
      WHERE p.area = 'CONTRIBUCIONES'
        AND pa.fecha = '2025-12-20'
      ORDER BY p.name, pa.hora_inicio
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
      console.log(`\n${person} (${asignaciones.length} asignaciones):`);
      asignaciones.forEach(a => {
        const programaMaster = a.programa || a.master || 'N/A';
        console.log(`  ${a.hora_inicio} - ${a.hora_fin} → ${programaMaster}`);
      });
    });

    await db.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await db.end();
    process.exit(1);
  }
}

checkPersonalAsignado();

const pool = require('../config/database');

async function verProgramas() {
  const result = await pool.query('SELECT id, nombre, horario_inicio, horario_fin FROM programas WHERE estado = \'activo\' ORDER BY horario_inicio');
  const programs = result.rows || result;

  console.log('\n📺 PROGRAMAS ACTIVOS:\n');
  programs.forEach(p => {
    console.log(`ID: ${p.id}, ${p.nombre}, ${p.horario_inicio} - ${p.horario_fin}`);
  });

  await pool.end();
}

verProgramas();

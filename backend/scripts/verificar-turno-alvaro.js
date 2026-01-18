const { getTurnoActual } = require('../utils/reporteriaRotation');
const pool = require('../database/db');

async function verificar() {
  try {
    // Obtener grupo de Álvaro
    const result = await pool.query(
      'SELECT grupo_reporteria FROM personnel WHERE id = 94'
    );

    const grupo = result.rows[0].grupo_reporteria;
    console.log(`\n👤 Álvaro Díaz: ${grupo}`);

    // Verificar turno en diferentes fechas
    const fechas = [
      '2025-12-22', // Lunes semana 52
      '2025-12-29', // Lunes semana 53
    ];

    fechas.forEach(fecha => {
      const turnoInfo = getTurnoActual(grupo, fecha);
      console.log(`\n📅 ${fecha}:`);
      console.log(`   Semana: ${turnoInfo.weekNumber}`);
      console.log(`   Turno: ${turnoInfo.turno} (${turnoInfo.horario})`);
      console.log(`   Call Time: ${turnoInfo.callTime}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verificar();

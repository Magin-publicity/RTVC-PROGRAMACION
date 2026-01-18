const pool = require('../config/database');
const { generarLlamadosSemanales, asignarPersonalATurno } = require('../utils/reporteriaRotation');

async function crearLlamadosReporteria() {
  try {
    console.log('🔄 Generando llamados de reportería para la semana...\n');

    // Obtener la fecha de inicio de la semana actual (lunes)
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes, etc.
    const diasHastaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diasHastaLunes);
    lunes.setHours(0, 0, 0, 0);

    console.log(`📅 Semana del: ${lunes.toLocaleDateString('es-ES')}\n`);

    // Generar llamados para la semana
    const llamados = generarLlamadosSemanales(lunes);

    console.log(`✅ Generados ${llamados.length} llamados de reportería`);
    console.log('   - 10 llamados por día (2 turnos × 2 áreas × 5 días)\n');

    // Obtener todo el personal de reportería con su turno
    const { rows: personal } = await pool.query(`
      SELECT id, name, area, turno, active
      FROM personnel
      WHERE area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
        AND active = true
      ORDER BY area, turno, name
    `);

    console.log(`👥 Personal disponible: ${personal.length}`);
    console.log(`   - Camarógrafos: ${personal.filter(p => p.area === 'CAMARÓGRAFOS DE REPORTERÍA').length}`);
    console.log(`   - Asistentes: ${personal.filter(p => p.area === 'ASISTENTES DE REPORTERÍA').length}\n`);

    // Mostrar distribución por turnos
    const porTurnos = personal.reduce((acc, p) => {
      const key = `${p.area} - ${p.turno}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Distribución por turnos:');
    Object.entries(porTurnos).forEach(([key, count]) => {
      console.log(`   ${key}: ${count} personas`);
    });

    console.log('\n💡 Llamados generados por día:');
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    diasSemana.forEach((dia, index) => {
      const fecha = new Date(lunes);
      fecha.setDate(lunes.getDate() + index);
      const fechaStr = fecha.toISOString().split('T')[0];

      const llamadosDia = llamados.filter(l => l.fecha === fechaStr);
      console.log(`\n   ${dia} (${fechaStr}):`);
      llamadosDia.forEach(l => {
        console.log(`     - ${l.area} - ${l.turno} (${l.horario}) - Capacidad: ${l.capacidad}`);
      });
    });

    console.log('\n✅ Sistema de llamados de reportería configurado correctamente');
    console.log('📌 Los llamados están listos para ser insertados en la base de datos');
    console.log('📌 El personal se asignará automáticamente según su turno\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear llamados de reportería:', error);
    process.exit(1);
  }
}

crearLlamadosReporteria();

const pool = require('../config/database');

async function insertarLlamadosReporteria() {
  try {
    console.log('🔄 Insertando llamados de reportería en la programación...\n');

    // Obtener la fecha de inicio de la semana actual (lunes)
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes, etc.
    const diasHastaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diasHastaLunes);
    lunes.setHours(0, 0, 0, 0);

    console.log(`📅 Semana del: ${lunes.toLocaleDateString('es-ES')}\n`);

    const llamados = [];
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    // Generar llamados de lunes a viernes
    for (let dia = 0; dia < 5; dia++) {
      const fecha = new Date(lunes);
      fecha.setDate(lunes.getDate() + dia);
      const fechaStr = fecha.toISOString().split('T')[0];

      // Llamado Mañana - Camarógrafos (8:00-13:00)
      llamados.push({
        date: fechaStr,
        program: 'Reportería Camarógrafos',
        shift_time: '8:00 AM - 1:00 PM',
        location: 'Reportería',
        notes: 'Turno mañana - 9 camarógrafos'
      });

      // Llamado Tarde - Camarógrafos (13:00-20:00)
      llamados.push({
        date: fechaStr,
        program: 'Reportería Camarógrafos',
        shift_time: '1:00 PM - 8:00 PM',
        location: 'Reportería',
        notes: 'Turno tarde - 9 camarógrafos'
      });

      // Llamado Mañana - Asistentes (8:00-13:00)
      llamados.push({
        date: fechaStr,
        program: 'Reportería Asistentes',
        shift_time: '8:00 AM - 1:00 PM',
        location: 'Reportería',
        notes: 'Turno mañana - 4 asistentes'
      });

      // Llamado Tarde - Asistentes (13:00-20:00)
      llamados.push({
        date: fechaStr,
        program: 'Reportería Asistentes',
        shift_time: '1:00 PM - 8:00 PM',
        location: 'Reportería',
        notes: 'Turno tarde - 4 asistentes'
      });
    }

    console.log(`✅ Generados ${llamados.length} llamados (${llamados.length / 5} por día)\n`);

    // Insertar llamados en la base de datos
    let insertados = 0;

    for (const llamado of llamados) {
      try {
        // Verificar si ya existe para evitar duplicados
        const exists = await pool.query(`
          SELECT id FROM schedules
          WHERE date = $1 AND program = $2 AND shift_time = $3
        `, [llamado.date, llamado.program, llamado.shift_time]);

        if (exists.rows.length > 0) {
          // Actualizar
          await pool.query(`
            UPDATE schedules
            SET location = $1, notes = $2, updated_at = CURRENT_TIMESTAMP
            WHERE date = $3 AND program = $4 AND shift_time = $5
          `, [llamado.location, llamado.notes, llamado.date, llamado.program, llamado.shift_time]);
        } else {
          // Insertar
          await pool.query(`
            INSERT INTO schedules (date, program, shift_time, location, notes)
            VALUES ($1, $2, $3, $4, $5)
          `, [llamado.date, llamado.program, llamado.shift_time, llamado.location, llamado.notes]);
          insertados++;
        }
      } catch (error) {
        console.error(`❌ Error al insertar llamado:`, error.message);
      }
    }

    console.log(`\n📊 Resultados:`);
    console.log(`   ✅ Insertados/Actualizados: ${insertados} llamados`);

    // Mostrar llamados insertados por día
    console.log('\n📋 Llamados en la programación:');
    diasSemana.forEach((dia, index) => {
      const fecha = new Date(lunes);
      fecha.setDate(lunes.getDate() + index);
      const fechaStr = fecha.toISOString().split('T')[0];

      console.log(`\n   ${dia} (${fechaStr}):`);
      console.log(`     🎥 08:00-13:00 Reportería Camarógrafos (9 personas)`);
      console.log(`     🎥 13:00-20:00 Reportería Camarógrafos (9 personas)`);
      console.log(`     👥 08:00-13:00 Reportería Asistentes (4 personas)`);
      console.log(`     👥 13:00-20:00 Reportería Asistentes (4 personas)`);
    });

    console.log('\n✅ Llamados de reportería insertados en la programación');
    console.log('📌 Los llamados aparecerán en la tabla de programación semanal\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al insertar llamados:', error);
    process.exit(1);
  }
}

insertarLlamadosReporteria();

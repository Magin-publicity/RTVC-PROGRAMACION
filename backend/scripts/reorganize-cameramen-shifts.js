// Script para reorganizar los turnos de Camarógrafos de Estudio
// Distribución: 6 + 4 + 5 + 5 = 20 personas
const pool = require('../config/database');

async function reorganizeCameramenShifts() {
  try {
    console.log('🔄 Reorganizando turnos de Camarógrafos de Estudio...\n');
    console.log('Distribución objetivo:');
    console.log('  - Madrugada (05:00-11:00): 6 personas');
    console.log('  - Media Mañana (09:00-15:00): 4 personas');
    console.log('  - Tarde (13:00-19:00): 5 personas');
    console.log('  - Noche (16:00-22:00): 5 personas');
    console.log('  - TOTAL: 20 personas\n');

    // TURNO MADRUGADA (05:00 - 11:00) - 6 personas
    // Incluye: John Loaiza (operador grúa)
    const turnoMadrugada = [
      'John Loaiza',       // Operador de Grúa
      'Cesar Jimenez',
      'John Jiménez',
      'Angel Zapata',
      'Oscar González',
      'Juan Sacristán'
    ];

    // TURNO MEDIA MAÑANA (09:00 - 15:00) - 4 personas
    // Incluye: Carlos García (operador grúa)
    const turnoMediaManana = [
      'Carlos García',     // Operador de Grúa
      'Alexander Quiñonez',
      'Pedro Niño',
      'William Mosquera'
    ];

    // TURNO TARDE (13:00 - 19:00) - 5 personas
    // Incluye: Jefferson Pérez, Raul Ramírez (operadores grúa)
    const turnoTarde = [
      'Jefferson Pérez',   // Operador de Grúa
      'Raul Ramírez',      // Operador de Grúa
      'Jorge Jaramillo',
      'Ernesto Corchuelo',
      'Samuel Romero'
    ];

    // TURNO NOCHE (16:00 - 22:00) - 5 personas
    // Incluye: Carlos A. López, Luis Bernal (operadores grúa)
    const turnoNoche = [
      'Carlos A. López',   // Operador de Grúa
      'Luis Bernal',       // Operador de Grúa
      'Andrés López',
      'Sebastián Hernández',
      'John Damiston Arevalo '  // Nota: tiene espacio al final en BD
    ];

    // Actualizar TURNO MADRUGADA (05:00)
    console.log('📌 Actualizando Turno Madrugada (05:00)...');
    for (const name of turnoMadrugada) {
      await pool.query(`
        UPDATE personnel
        SET current_shift = '05:00'
        WHERE name = $1 AND area = 'CAMARÓGRAFOS DE ESTUDIO'
      `, [name]);
    }
    console.log(`   ✅ ${turnoMadrugada.length} personas asignadas`);

    // Actualizar TURNO MEDIA MAÑANA (09:00)
    console.log('📌 Actualizando Turno Media Mañana (09:00)...');
    for (const name of turnoMediaManana) {
      await pool.query(`
        UPDATE personnel
        SET current_shift = '09:00'
        WHERE name = $1 AND area = 'CAMARÓGRAFOS DE ESTUDIO'
      `, [name]);
    }
    console.log(`   ✅ ${turnoMediaManana.length} personas asignadas`);

    // Actualizar TURNO TARDE (13:00)
    console.log('📌 Actualizando Turno Tarde (13:00)...');
    for (const name of turnoTarde) {
      await pool.query(`
        UPDATE personnel
        SET current_shift = '13:00'
        WHERE name = $1 AND area = 'CAMARÓGRAFOS DE ESTUDIO'
      `, [name]);
    }
    console.log(`   ✅ ${turnoTarde.length} personas asignadas`);

    // Actualizar TURNO NOCHE (16:00)
    console.log('📌 Actualizando Turno Noche (16:00)...');
    for (const name of turnoNoche) {
      await pool.query(`
        UPDATE personnel
        SET current_shift = '16:00'
        WHERE name = $1 AND area = 'CAMARÓGRAFOS DE ESTUDIO'
      `, [name]);
    }
    console.log(`   ✅ ${turnoNoche.length} personas asignadas`);

    // Verificar resultados
    console.log('\n📊 VERIFICACIÓN FINAL:\n');

    const turnos = ['05:00', '09:00', '13:00', '16:00'];
    const labels = ['Madrugada (05:00-11:00)', 'Media Mañana (09:00-15:00)', 'Tarde (13:00-19:00)', 'Noche (16:00-22:00)'];
    const expected = [6, 4, 5, 5];

    for (let i = 0; i < turnos.length; i++) {
      const result = await pool.query(`
        SELECT name FROM personnel
        WHERE area = 'CAMARÓGRAFOS DE ESTUDIO'
        AND current_shift = $1
        ORDER BY name
      `, [turnos[i]]);

      const status = result.rows.length === expected[i] ? '✅' : '❌';
      console.log(`${status} ${labels[i]}: ${result.rows.length}/${expected[i]} personas`);
      result.rows.forEach(r => console.log(`   - ${r.name}`));
      console.log('');
    }

    // Total
    const total = await pool.query(`
      SELECT COUNT(*) as total FROM personnel
      WHERE area = 'CAMARÓGRAFOS DE ESTUDIO' AND active = true
    `);
    console.log(`📈 TOTAL: ${total.rows[0].total} camarógrafos de estudio`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error reorganizando turnos:', error);
    process.exit(1);
  }
}

reorganizeCameramenShifts();

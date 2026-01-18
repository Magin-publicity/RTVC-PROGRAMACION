const pool = require('../database/db');

async function debugRotation() {
  try {
    const targetDate = '2025-12-26';

    // Calcular semana ISO
    const date = new Date(targetDate);
    const startOfYear = new Date(Date.UTC(date.getFullYear(), 0, 1));
    const weeksDiff = Math.floor((date - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    const currentWeek = weeksDiff % 5;

    console.log(`📅 Fecha: ${targetDate}`);
    console.log(`   weeksDiff: ${weeksDiff}`);
    console.log(`   currentWeek (weeksDiff % 5): ${currentWeek}`);

    // Obtener patrones para esta semana
    const patterns = await pool.query(
      "SELECT * FROM rotation_patterns WHERE area = 'CONTRIBUCIONES' AND week_number = $1 ORDER BY shift_start",
      [currentWeek]
    );

    console.log(`\n📋 Patrones para semana ${currentWeek}:`);
    patterns.rows.forEach((p, i) => {
      console.log(`   [${i}] ${p.shift_start} - ${p.shift_end}`);
    });

    // Obtener personal
    const people = await pool.query(
      "SELECT id, name FROM personnel WHERE area = 'CONTRIBUCIONES' ORDER BY id"
    );

    console.log(`\n👥 Personal de CONTRIBUCIONES:`);
    people.rows.forEach((p, i) => {
      console.log(`   [${i}] ID ${p.id}: ${p.name}`);
    });

    // Simular lógica de asignación
    console.log(`\n🔄 Simulando asignación (lógica normal: people.length >= patterns.length):`);
    people.rows.forEach((person, personIndex) => {
      const baseShiftIndex = personIndex % patterns.rows.length;
      const rotatedShiftIndex = (baseShiftIndex + weeksDiff) % patterns.rows.length;
      const pattern = patterns.rows[rotatedShiftIndex];

      console.log(`   ${person.name}:`);
      console.log(`      personIndex: ${personIndex}`);
      console.log(`      baseShiftIndex: ${baseShiftIndex}`);
      console.log(`      rotatedShiftIndex: ${rotatedShiftIndex}`);
      console.log(`      → Turno: ${pattern ? pattern.shift_start + ' - ' + pattern.shift_end : 'NINGUNO'}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

debugRotation();

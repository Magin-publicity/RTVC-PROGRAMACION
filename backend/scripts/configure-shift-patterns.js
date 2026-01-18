// backend/scripts/configure-shift-patterns.js
// Configuración de patrones de turnos para grupos de 4 y 5 personas

const pool = require('../database/db');

// Configuración de turnos para grupos de 4 personas
const SHIFTS_4_PEOPLE = [
  { name: 'T1', label: 'Apertura', start: '05:00', end: '11:00' },
  { name: 'T2', label: 'Mañana', start: '09:00', end: '15:00' },
  { name: 'T3', label: 'Tarde', start: '13:00', end: '19:00' },
  { name: 'T4', label: 'Cierre', start: '16:00', end: '22:00' }
];

// Configuración de turnos para grupos de 5 personas
const SHIFTS_5_PEOPLE = [
  { name: 'T1', label: 'Apertura', start: '05:00', end: '10:00' },
  { name: 'T2', label: 'Mañana', start: '09:00', end: '14:00' },
  { name: 'T3', label: 'Media Jornada', start: '11:00', end: '16:00' },
  { name: 'T4', label: 'Tarde', start: '14:00', end: '19:00' },
  { name: 'T5', label: 'Cierre', start: '17:00', end: '22:00' }
];

async function configureShiftPatterns() {
  try {
    console.log('🔄 Configurando patrones de turnos...\n');

    // 1. Limpiar patrones existentes
    await pool.query('DELETE FROM rotation_patterns');
    console.log('✅ Patrones antiguos eliminados\n');

    // 2. Obtener áreas con conteo de personal
    const areasResult = await pool.query(`
      SELECT area,
             COUNT(*) as personnel_count,
             array_agg(name ORDER BY name) as personnel_names
      FROM personnel
      WHERE active = true
      GROUP BY area
      ORDER BY area
    `);

    console.log(`📊 Áreas encontradas: ${areasResult.rows.length}\n`);

    const patterns = [];

    for (const areaData of areasResult.rows) {
      const { area, personnel_names } = areaData;
      const personnel_count = parseInt(areaData.personnel_count); // Convertir a número

      console.log(`📋 ${area}:`);
      console.log(`   👥 Personal: ${personnel_count} personas`);
      console.log(`   📝 Nombres: ${personnel_names.join(', ')}`);

      // Determinar qué configuración de turnos usar
      let shiftsConfig;
      if (personnel_count === 5) {
        shiftsConfig = SHIFTS_5_PEOPLE;
        console.log(`   ⏰ Configuración: 5 turnos (05:00-10:00, 09:00-14:00, 11:00-16:00, 14:00-19:00, 17:00-22:00)`);
      } else if (personnel_count === 4) {
        shiftsConfig = SHIFTS_4_PEOPLE;
        console.log(`   ⏰ Configuración: 4 turnos (05:00-11:00, 09:00-15:00, 13:00-19:00, 16:00-22:00)`);
      } else {
        // Para otros tamaños, usar configuración de 4 turnos por defecto
        shiftsConfig = SHIFTS_4_PEOPLE;
        console.log(`   ⏰ Configuración: 4 turnos por defecto (${personnel_count} personas)`);
      }

      // Crear patrones para 4 semanas
      for (let week = 1; week <= 4; week++) {
        shiftsConfig.forEach(shift => {
          patterns.push({
            week_number: week,
            area: area,
            shift_start: shift.start,
            shift_end: shift.end,
            shift_name: shift.name,
            shift_label: shift.label
          });
        });
      }

      console.log(`   ✓ ${shiftsConfig.length * 4} patrones creados para 4 semanas\n`);
    }

    console.log(`\n✅ Total de patrones a insertar: ${patterns.length}\n`);

    // 3. Insertar todos los patrones
    for (const pattern of patterns) {
      await pool.query(
        `INSERT INTO rotation_patterns (week_number, area, shift_start, shift_end)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [pattern.week_number, pattern.area, pattern.shift_start, pattern.shift_end]
      );
    }

    console.log('✅ Patrones insertados en la base de datos\n');

    // 4. Verificar patrones creados
    const countResult = await pool.query('SELECT COUNT(*) FROM rotation_patterns');
    console.log(`📊 Total de patrones en BD: ${countResult.rows[0].count}\n`);

    // 5. Mostrar resumen detallado por área
    const summaryResult = await pool.query(`
      SELECT
        area,
        COUNT(DISTINCT shift_start) as unique_shifts,
        COUNT(*) as total_patterns,
        array_agg(DISTINCT (shift_start || ' - ' || shift_end)) as shifts
      FROM rotation_patterns
      GROUP BY area
      ORDER BY area
    `);

    console.log('📋 Resumen de turnos por área:\n');
    summaryResult.rows.forEach(row => {
      console.log(`  ${row.area}:`);
      console.log(`    - Turnos únicos: ${row.unique_shifts}`);
      console.log(`    - Total patrones (4 semanas): ${row.total_patterns}`);
      console.log(`    - Horarios:`);
      row.shifts.forEach(shift => {
        console.log(`      • ${shift}`);
      });
      console.log('');
    });

    console.log('\n✅ Configuración de turnos completada exitosamente');

  } catch (error) {
    console.error('❌ Error configurando patrones:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar
configureShiftPatterns();

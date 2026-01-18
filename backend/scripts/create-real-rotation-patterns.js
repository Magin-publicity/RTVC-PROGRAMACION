const pool = require('./config/database');

async function createRealRotationPatterns() {
  try {
    console.log('🔄 Creando patrones de rotación para todas las áreas...');

    // 1. Limpiar patrones existentes
    await pool.query('DELETE FROM rotation_patterns');
    console.log('✅ Patrones antiguos eliminados');

    // 2. Obtener todas las áreas con su personal
    const areasResult = await pool.query(`
      SELECT DISTINCT area,
             array_agg(DISTINCT current_shift ORDER BY current_shift) as shifts
      FROM personnel
      WHERE active = true AND current_shift IS NOT NULL
      GROUP BY area
      ORDER BY area
    `);

    console.log(`📊 Áreas encontradas: ${areasResult.rows.length}`);

    // 3. Para cada área, crear patrones de rotación basados en sus turnos reales
    const patterns = [];

    for (const areaData of areasResult.rows) {
      const area = areaData.area;
      const shifts = areaData.shifts;

      console.log(`  📋 ${area}: ${shifts.length} turnos diferentes`);

      // Crear patrones para 4 semanas
      for (let week = 1; week <= 4; week++) {
        // Para cada turno único en esta área
        shifts.forEach((shiftStart, index) => {
          // Calcular hora de fin basándose en la hora de inicio
          let endHour = parseInt(shiftStart.split(':')[0]) + 8; // 8 horas de turno
          if (endHour >= 24) endHour = 22; // Máximo hasta las 22:00

          const shiftEnd = `${String(endHour).padStart(2, '0')}:00`;

          patterns.push({
            week_number: week,
            area: area,
            shift_start: shiftStart,
            shift_end: shiftEnd
          });
        });
      }
    }

    console.log(`✅ Total de patrones a insertar: ${patterns.length}`);

    // 4. Insertar todos los patrones
    for (const pattern of patterns) {
      await pool.query(
        `INSERT INTO rotation_patterns (week_number, area, shift_start, shift_end)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [pattern.week_number, pattern.area, pattern.shift_start, pattern.shift_end]
      );
    }

    console.log('✅ Patrones de rotación creados exitosamente');

    // 5. Verificar cuántos patrones se crearon
    const countResult = await pool.query('SELECT COUNT(*) FROM rotation_patterns');
    console.log(`📊 Total de patrones en la base de datos: ${countResult.rows[0].count}`);

    // 6. Mostrar resumen por área
    const summaryResult = await pool.query(`
      SELECT area, COUNT(*) as pattern_count
      FROM rotation_patterns
      GROUP BY area
      ORDER BY area
    `);

    console.log('\n📋 Resumen por área:');
    summaryResult.rows.forEach(row => {
      console.log(`  - ${row.area}: ${row.pattern_count} patrones`);
    });

  } catch (error) {
    console.error('❌ Error creando patrones:', error);
  } finally {
    await pool.end();
  }
}

createRealRotationPatterns();

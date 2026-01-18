const pool = require('../config/database');

async function actualizarHorariosReporteria() {
  try {
    console.log('🔄 Actualizando horarios de reportería a sistema de grupos...\n');

    // 1. Actualizar GRUPO_A (Mañana) - Todos a 08:00
    console.log('1️⃣ Actualizando GRUPO_A a 08:00...');
    const resultGrupoA = await pool.query(`
      UPDATE personnel
      SET turno = 'MAÑANA'
      WHERE grupo_reporteria = 'GRUPO_A'
        AND area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
      RETURNING id, name, area
    `);
    console.log(`   ✅ ${resultGrupoA.rowCount} personas del GRUPO_A actualizadas`);

    // 2. Actualizar GRUPO_B (Tarde) - Todos a 13:00
    console.log('2️⃣ Actualizando GRUPO_B a 13:00...');
    const resultGrupoB = await pool.query(`
      UPDATE personnel
      SET turno = 'TARDE'
      WHERE grupo_reporteria = 'GRUPO_B'
        AND area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
      RETURNING id, name, area
    `);
    console.log(`   ✅ ${resultGrupoB.rowCount} personas del GRUPO_B actualizadas`);

    // 3. Verificar distribución final
    console.log('\n3️⃣ Verificando distribución final...\n');
    const verification = await pool.query(`
      SELECT
        grupo_reporteria,
        area,
        turno,
        COUNT(*) as cantidad,
        STRING_AGG(name, ', ' ORDER BY name) as nombres
      FROM personnel
      WHERE area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
        AND active = true
      GROUP BY grupo_reporteria, area, turno
      ORDER BY grupo_reporteria, area
    `);

    console.table(verification.rows);

    // 4. Mostrar resumen por grupo
    console.log('\n📊 RESUMEN POR GRUPO:\n');

    const grupoA = await pool.query(`
      SELECT area, COUNT(*) as cantidad, STRING_AGG(name, ', ' ORDER BY name) as nombres
      FROM personnel
      WHERE grupo_reporteria = 'GRUPO_A'
        AND area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
      GROUP BY area
    `);

    console.log('🌅 GRUPO A (08:00 - 13:00):');
    grupoA.rows.forEach(row => {
      console.log(`   ${row.area}: ${row.cantidad} personas`);
      console.log(`   Nombres: ${row.nombres}\n`);
    });

    const grupoB = await pool.query(`
      SELECT area, COUNT(*) as cantidad, STRING_AGG(name, ', ' ORDER BY name) as nombres
      FROM personnel
      WHERE grupo_reporteria = 'GRUPO_B'
        AND area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
      GROUP BY area
    `);

    console.log('🌆 GRUPO B (13:00 - 20:00):');
    grupoB.rows.forEach(row => {
      console.log(`   ${row.area}: ${row.cantidad} personas`);
      console.log(`   Nombres: ${row.nombres}\n`);
    });

    console.log('✅ Horarios de reportería actualizados correctamente\n');
    console.log('⚠️  IMPORTANTE: Recarga la página de programación para ver los cambios\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error actualizando horarios:', error);
    process.exit(1);
  }
}

actualizarHorariosReporteria();

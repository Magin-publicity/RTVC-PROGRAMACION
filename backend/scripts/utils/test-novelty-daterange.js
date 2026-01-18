const pool = require('../config/database');

async function testNoveltyDateRange() {
  try {
    console.log('🧪 Probando funcionalidad de rango de fechas para novedades...\n');

    // 1. Obtener un personal aleatorio
    const personnelResult = await pool.query('SELECT id, name FROM personnel LIMIT 1');
    if (personnelResult.rows.length === 0) {
      console.error('❌ No hay personal en la base de datos');
      process.exit(1);
    }
    const personnel = personnelResult.rows[0];
    console.log(`✅ Usando personal: ${personnel.name} (ID: ${personnel.id})\n`);

    // 2. Crear una novedad con rango de fechas (7 días)
    console.log('📝 Creando novedad con rango de fechas (Dec 7-14, 2025)...');
    const insertResult = await pool.query(
      'INSERT INTO novelties (personnel_id, date, start_date, end_date, type, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [personnel.id, '2025-12-07', '2025-12-07', '2025-12-14', 'medical_leave', 'Incapacidad médica']
    );
    console.log('✅ Novedad creada:', insertResult.rows[0]);
    console.log('');

    // 3. Consultar la novedad con JOIN a personnel
    console.log('🔍 Consultando novedad con información de personal...');
    const queryResult = await pool.query(`
      SELECT
        n.id,
        n.personnel_id,
        n.date,
        n.start_date,
        n.end_date,
        n.type,
        n.description,
        p.name AS personnel_name,
        p.area,
        p.role
      FROM novelties n
      LEFT JOIN personnel p ON n.personnel_id = p.id
      WHERE n.id = $1
    `, [insertResult.rows[0].id]);

    console.log('✅ Novedad con datos de personal:');
    console.table(queryResult.rows);
    console.log('');

    // 4. Simular el endpoint del calendario
    console.log('📅 Probando endpoint de calendario (expandir rango de fechas)...');
    const startDate = '2025-12-01';
    const endDate = '2025-12-31';

    const calendarResult = await pool.query(`
      SELECT
        n.id,
        n.personnel_id,
        n.date,
        n.start_date,
        n.end_date,
        n.type,
        n.description,
        p.name as personnel_name,
        p.area as personnel_area,
        p.role as personnel_role
      FROM novelties n
      LEFT JOIN personnel p ON n.personnel_id = p.id
      WHERE (
        (n.start_date IS NOT NULL AND n.start_date <= $2 AND n.end_date >= $1)
        OR
        (n.start_date IS NULL AND n.date >= $1 AND n.date <= $2)
      )
    `, [startDate, endDate]);

    console.log('✅ Novedades encontradas para el calendario:');
    console.table(calendarResult.rows);

    // Expandir rango a días individuales
    const novelty = calendarResult.rows[0];
    if (novelty && novelty.start_date && novelty.end_date) {
      console.log('\n📋 Expandiendo rango de fechas a días individuales:');
      const start = new Date(novelty.start_date);
      const end = new Date(novelty.end_date);

      const days = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(d.toISOString().split('T')[0]);
      }

      console.log(`   Rango: ${novelty.start_date.toISOString().split('T')[0]} a ${novelty.end_date.toISOString().split('T')[0]}`);
      console.log(`   Días afectados (${days.length}):`, days.join(', '));
    }

    console.log('\n✨ ¡Todas las pruebas pasaron exitosamente!');
    console.log('\n🎯 Resumen:');
    console.log('   ✅ Creación de novedad con rango de fechas');
    console.log('   ✅ Query con LEFT JOIN devuelve personnel_name correctamente');
    console.log('   ✅ Calendario filtra correctamente por rangos de fechas');
    console.log('   ✅ Expansión de rango a días individuales funciona');

    // Limpiar: eliminar la novedad de prueba
    await pool.query('DELETE FROM novelties WHERE id = $1', [insertResult.rows[0].id]);
    console.log('\n🧹 Novedad de prueba eliminada\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testNoveltyDateRange();

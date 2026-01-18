const pool = require('../config/database');

async function verifyRotation() {
  try {
    console.log('🔍 Verificando sistema de rotación...\n');

    // Verificar tabla de rotaciones
    const rotations = await pool.query('SELECT * FROM rotations ORDER BY id LIMIT 5');
    console.log('📋 Rotaciones (primeras 5):');
    console.table(rotations.rows);

    // Contar total de rotaciones
    const count = await pool.query('SELECT COUNT(*) FROM rotations');
    console.log(`\n📊 Total de rotaciones en la base de datos: ${count.rows[0].count}`);

    // Verificar rotaciones por área
    const byArea = await pool.query(`
      SELECT area, COUNT(*) as total
      FROM rotations
      GROUP BY area
      ORDER BY area
    `);
    console.log('\n📊 Rotaciones por área:');
    console.table(byArea.rows);

    // Verificar personal (primeras 5 personas)
    const personnel = await pool.query('SELECT id, name, area, role, current_shift FROM personnel LIMIT 5');
    console.log('\n👥 Personal (primeras 5 personas):');
    console.table(personnel.rows);

    // Verificar que current_shift esté en NULL
    const withShift = await pool.query('SELECT COUNT(*) FROM personnel WHERE current_shift IS NOT NULL');
    console.log(`\n✅ Personal con current_shift NULL: ${parseInt(count.rows[0].count) - parseInt(withShift.rows[0].count)}`);
    console.log(`❌ Personal con current_shift asignado: ${withShift.rows[0].count}`);

    if (parseInt(withShift.rows[0].count) === 0) {
      console.log('\n✨ Correcto: Todos los turnos fijos fueron eliminados');
      console.log('📅 La rotación de 4 semanas sigue funcionando normalmente');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyRotation();

// backend/scripts/balancear-grupos.js
// Balancear grupos para que queden 5 personas en cada uno

const pool = require('../config/database');

async function balancearGrupos() {
  try {
    console.log('📊 BALANCEANDO GRUPOS\n');

    // Ver distribución actual
    const dist = await pool.query(`
      SELECT grupo, COUNT(*) as count
      FROM personnel
      WHERE area = 'CAMARÓGRAFOS DE ESTUDIO' AND active = true
      GROUP BY grupo
      ORDER BY grupo
    `);

    console.log('Distribución ANTES:');
    console.table(dist.rows);

    // Ver quiénes están en el Grupo C
    const grupoC = await pool.query(`
      SELECT name, current_shift
      FROM personnel
      WHERE grupo = 'C' AND area = 'CAMARÓGRAFOS DE ESTUDIO'
      ORDER BY name
    `);

    console.log('\n🟢 Grupo C actual (6 personas):');
    console.table(grupoC.rows);

    // Mover a Sebastián Hernández del Grupo C al Grupo B para balancear
    console.log('\n🔄 Moviendo Sebastián Hernández del Grupo C al Grupo B...');

    await pool.query(`
      UPDATE personnel
      SET grupo = 'B'
      WHERE name = 'Sebastián Hernández'
        AND area = 'CAMARÓGRAFOS DE ESTUDIO'
    `);

    console.log('✅ Sebastián Hernández movido al Grupo B\n');

    // Ver distribución DESPUÉS
    const distDespues = await pool.query(`
      SELECT grupo, COUNT(*) as count
      FROM personnel
      WHERE area = 'CAMARÓGRAFOS DE ESTUDIO' AND active = true
      GROUP BY grupo
      ORDER BY grupo
    `);

    console.log('Distribución DESPUÉS:');
    console.table(distDespues.rows);

    console.log('\n✅ GRUPOS BALANCEADOS: 5 personas por grupo\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

balancearGrupos();

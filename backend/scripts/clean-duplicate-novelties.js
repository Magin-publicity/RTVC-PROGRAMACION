// Script para limpiar novelties duplicadas
const db = require('../config/database');

async function cleanDuplicateNovelties() {
  const client = await db.connect();

  try {
    console.log('🧹 Iniciando limpieza de novelties duplicadas...\n');

    await client.query('BEGIN');

    // Encontrar y eliminar duplicados, manteniendo solo el más reciente
    const deleteQuery = `
      DELETE FROM novelties
      WHERE id NOT IN (
        SELECT MAX(id)
        FROM novelties
        GROUP BY personnel_id, date, type, description, start_date, end_date
      )
      RETURNING *
    `;

    const result = await client.query(deleteQuery);

    console.log(`🗑️  Eliminadas ${result.rows.length} novelties duplicadas\n`);

    if (result.rows.length > 0) {
      // Mostrar muestra de lo que se eliminó
      const sample = result.rows.slice(0, 5);
      console.log('📋 Muestra de novelties eliminadas:');
      sample.forEach(n => {
        console.log(`   - ID ${n.id}: ${n.description} (${n.date.toISOString().split('T')[0]})`);
      });
      if (result.rows.length > 5) {
        console.log(`   ... y ${result.rows.length - 5} más`);
      }
    }

    // Contar novelties restantes por persona
    const countQuery = `
      SELECT
        p.name,
        n.description,
        COUNT(*) as count
      FROM novelties n
      JOIN personnel p ON n.personnel_id = p.id
      WHERE n.type IN ('VIAJE', 'EVENTO')
      GROUP BY p.name, n.description
      ORDER BY count DESC
    `;

    const countResult = await client.query(countQuery);

    console.log('\n📊 Novelties de viaje/evento por persona:');
    countResult.rows.forEach(row => {
      console.log(`   ${row.name}: ${row.count} días - ${row.description}`);
    });

    await client.query('COMMIT');

    console.log('\n✅ Limpieza completada exitosamente!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante limpieza:', error);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

// Ejecutar
cleanDuplicateNovelties().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});

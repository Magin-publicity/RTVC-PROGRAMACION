const pool = require('../config/database');

async function checkPersonnelNames() {
  try {
    console.log('🔍 Verificando nombres exactos del personal...\n');

    const searchNames = [
      'Peña', 'Moreno', 'Rodríguez', 'Rodriguez', 'Boada',
      'Romero', 'Espinel', 'Orlando', 'Paez', 'Cano'
    ];

    for (const searchName of searchNames) {
      const result = await pool.query(
        `SELECT name, area FROM personnel WHERE name ILIKE $1 ORDER BY area, name`,
        [`%${searchName}%`]
      );

      if (result.rows.length > 0) {
        console.log(`\n📋 Resultados para "${searchName}":`);
        result.rows.forEach(person => {
          console.log(`  - "${person.name}" en ${person.area}`);
        });
      }
    }

    console.log('\n✅ Verificación completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPersonnelNames();

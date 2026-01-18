const pool = require('../config/database');

async function checkAvailability() {
  try {
    console.log('🔍 Verificando disponibilidad del personal...\n');

    const result = await pool.query(`
      SELECT id, name, area, is_available, unavailability_reason,
             unavailability_start_date, unavailability_end_date
      FROM personnel
      WHERE is_available = false OR unavailability_reason IS NOT NULL
      ORDER BY area, name
    `);

    if (result.rows.length === 0) {
      console.log('✅ Todo el personal está disponible');
    } else {
      console.log(`⚠️ Personal no disponible (${result.rows.length}):\n`);
      result.rows.forEach(person => {
        console.log(`- ${person.name} (${person.area})`);
        console.log(`  Razón: ${person.unavailability_reason || 'N/A'}`);
        console.log(`  Desde: ${person.unavailability_start_date || 'N/A'}`);
        console.log(`  Hasta: ${person.unavailability_end_date || 'N/A'}`);
        console.log('');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAvailability();

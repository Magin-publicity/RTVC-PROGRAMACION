const pool = require('../config/database');
const { WEEKEND_PERSONNEL_NUMBERED } = require('../config/weekend-rotation-numbered');

async function checkAllAreas() {
  try {
    console.log('📋 Verificando coincidencia entre configuración y base de datos...\n');

    // Obtener todo el personal activo de la base de datos
    const result = await pool.query(`
      SELECT area, name, active
      FROM personnel
      WHERE active = true
      ORDER BY area, name
    `);

    // Agrupar por área
    const dbPersonnelByArea = {};
    result.rows.forEach(p => {
      if (!dbPersonnelByArea[p.area]) {
        dbPersonnelByArea[p.area] = [];
      }
      dbPersonnelByArea[p.area].push(p.name);
    });

    // Comparar con configuración
    const areas = Object.keys(WEEKEND_PERSONNEL_NUMBERED);

    for (const area of areas) {
      const configPersonnel = WEEKEND_PERSONNEL_NUMBERED[area];
      const dbPersonnel = dbPersonnelByArea[area] || [];

      // Filtrar personal disponible en config (sin hasContract: false)
      const availableInConfig = configPersonnel.filter(p => p.hasContract !== false);

      console.log(`\n📦 ${area}:`);
      console.log(`   Config: ${availableInConfig.length} personas disponibles`);
      console.log(`   DB:     ${dbPersonnel.length} personas activas`);

      if (availableInConfig.length !== dbPersonnel.length) {
        console.log(`   ⚠️ DESAJUSTE - Diferencia de ${Math.abs(availableInConfig.length - dbPersonnel.length)} personas`);

        // Mostrar personas en config pero no en DB
        const configNames = availableInConfig.map(p => p.name);
        const onlyInConfig = configNames.filter(name => !dbPersonnel.includes(name));
        if (onlyInConfig.length > 0) {
          console.log(`   ❌ En config pero NO activos en DB: ${onlyInConfig.join(', ')}`);
        }

        // Mostrar personas en DB pero no en config
        const onlyInDb = dbPersonnel.filter(name => !configNames.includes(name));
        if (onlyInDb.length > 0) {
          console.log(`   ➕ Activos en DB pero NO en config: ${onlyInDb.join(', ')}`);
        }
      } else {
        console.log(`   ✅ Coinciden`);
      }
    }

    pool.end();
  } catch (error) {
    console.error('Error:', error);
    pool.end();
  }
}

checkAllAreas();

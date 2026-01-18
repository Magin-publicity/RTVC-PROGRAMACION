// Script para actualizar información completa del personal
const pool = require('../config/database');

// Función para generar email basado en el nombre
function generateEmail(name) {
  const cleanName = name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/\s+/g, '');
  return `${cleanName}@rtvc.gov.co`;
}

// Función para generar teléfono
function generatePhone(index) {
  return `300${String(1000000 + index).substring(0, 7)}`;
}

async function updateAllPersonnel() {
  try {
    console.log('📝 Obteniendo todo el personal...\n');

    // Obtener todo el personal
    const result = await pool.query(`
      SELECT id, name
      FROM personnel
      ORDER BY id ASC
    `);

    console.log(`📊 Total de personas a actualizar: ${result.rows.length}\n`);

    let updated = 0;
    let errors = 0;

    for (let i = 0; i < result.rows.length; i++) {
      const person = result.rows[i];

      const email = generateEmail(person.name);
      const phone = generatePhone(person.id);
      const contractStart = '2024-01-01';
      const contractEnd = '2025-12-31';

      try {
        await pool.query(
          `UPDATE personnel
           SET email = $1, phone = $2, contract_start = $3, contract_end = $4
           WHERE id = $5`,
          [email, phone, contractStart, contractEnd, person.id]
        );

        console.log(`✅ ${person.name}`);
        console.log(`   Email: ${email}`);
        console.log(`   Teléfono: ${phone}`);
        console.log(`   Contrato: ${contractStart} a ${contractEnd}\n`);

        updated++;
      } catch (error) {
        console.error(`❌ Error al actualizar ${person.name}:`, error.message);
        errors++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Actualizados: ${updated}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📝 Total procesados: ${result.rows.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

updateAllPersonnel();

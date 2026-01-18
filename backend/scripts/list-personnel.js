// Script para listar todo el personal en la base de datos
const pool = require('../config/database');

async function listPersonnel() {
  try {
    console.log('📋 Personal en la base de datos:\n');

    const result = await pool.query(`
      SELECT id, name, role, area, email, phone, contract_start, contract_end
      FROM personnel
      ORDER BY name ASC
    `);

    result.rows.forEach((person, index) => {
      console.log(`${index + 1}. ${person.name}`);
      console.log(`   ID: ${person.id}`);
      console.log(`   Rol: ${person.role}`);
      console.log(`   Área: ${person.area}`);
      console.log(`   Email: ${person.email || 'Sin email'}`);
      console.log(`   Teléfono: ${person.phone || 'Sin teléfono'}`);
      console.log(`   Contrato: ${person.contract_start || 'N/A'} - ${person.contract_end || 'N/A'}`);
      console.log('');
    });

    console.log(`\n📊 Total: ${result.rows.length} personas`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listPersonnel();

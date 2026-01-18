const pool = require('../config/database');

async function verifyUpdates() {
  try {
    const result = await pool.query(`
      SELECT name, email, phone, contract_end
      FROM personnel
      WHERE name IN ('Alejandro La Torre', 'Eduardo Contreras', 'Wílmer Salamanca', 'Álvaro Díaz', 'Santiago Ortiz',
                     'Diego Gamboa', 'Julian Jimenez', 'William Aldana', 'Edgar Nieto')
      ORDER BY name
    `);

    console.log('=== VERIFICACIÓN DE DATOS ACTUALIZADOS ===\n');
    result.rows.forEach(p => {
      console.log(`Nombre: ${p.name}`);
      console.log(`  Email: ${p.email}`);
      console.log(`  Teléfono: ${p.phone}`);
      console.log(`  Fin contrato: ${p.contract_end ? p.contract_end.toISOString().split('T')[0] : 'N/A'}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyUpdates();

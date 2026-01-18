const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function checkTransportModes() {
  try {
    const date = '2026-01-12';
    const shiftType = 'AM';

    console.log(`🔍 Verificando modos de transporte para ${date} ${shiftType}\n`);

    // Consultar todas las asignaciones
    const result = await pool.query(
      `SELECT personnel_name, transport_mode, direccion, barrio, localidad
       FROM daily_transport_assignments
       WHERE date = $1 AND shift_type = $2
       ORDER BY transport_mode, personnel_name`,
      [date, shiftType]
    );

    console.log(`📊 Total asignaciones: ${result.rows.length}\n`);

    // Contar por modo de transporte
    const byMode = {};
    result.rows.forEach(row => {
      byMode[row.transport_mode] = (byMode[row.transport_mode] || 0) + 1;
    });

    console.log('📈 Por modo de transporte:');
    Object.keys(byMode).forEach(mode => {
      console.log(`  ${mode}: ${byMode[mode]} personas`);
    });

    // Mostrar personal en RUTA
    const enRuta = result.rows.filter(r => r.transport_mode === 'RUTA');
    console.log(`\n🚐 Personal que usa RUTA (${enRuta.length}):`);
    enRuta.forEach((p, i) => {
      console.log(`${i + 1}. ${p.personnel_name}`);
      console.log(`   Dirección: ${p.direccion || 'SIN DIRECCIÓN'}`);
      console.log(`   Barrio: ${p.barrio || 'N/A'} - Localidad: ${p.localidad || 'N/A'}`);
      console.log('');
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkTransportModes();

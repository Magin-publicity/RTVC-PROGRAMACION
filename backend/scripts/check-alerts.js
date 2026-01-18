const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function checkAlerts() {
  try {
    const date = '2026-01-12';
    const shiftType = 'AM';

    console.log(`🔍 Verificando alertas para ${date} ${shiftType}\n`);

    // Consultar alertas
    const alertsResult = await pool.query(
      `SELECT * FROM route_alerts
       WHERE date = $1 AND shift_type = $2
       ORDER BY created_at DESC`,
      [date, shiftType]
    );

    console.log(`📊 Total alertas: ${alertsResult.rows.length}\n`);

    if (alertsResult.rows.length > 0) {
      alertsResult.rows.forEach((alert, i) => {
        console.log(`${i + 1}. [${alert.severity}] ${alert.alert_type}`);
        console.log(`   Mensaje: ${alert.message}`);
        console.log(`   Personnel ID: ${alert.personnel_id}`);
        console.log(`   Resuelto: ${alert.resolved}`);
        console.log(`   Creado: ${alert.created_at}`);
        console.log('');
      });
    } else {
      console.log('⚠️ No hay alertas registradas');
    }

    // Verificar personal sin dirección
    console.log('\n🔍 Verificando personal sin dirección en el turno...\n');

    const assignmentsResult = await pool.query(
      `SELECT personnel_id, personnel_name, direccion
       FROM daily_transport_assignments
       WHERE date = $1 AND shift_type = $2`,
      [date, shiftType]
    );

    console.log(`📊 Total personal en turno: ${assignmentsResult.rows.length}\n`);

    const sinDireccion = assignmentsResult.rows.filter(p =>
      !p.direccion || p.direccion.trim() === ''
    );

    console.log(`⚠️ Personal sin dirección: ${sinDireccion.length}\n`);

    if (sinDireccion.length > 0) {
      sinDireccion.forEach((p, i) => {
        console.log(`${i + 1}. ${p.personnel_name} (ID: ${p.personnel_id})`);
        console.log(`   Dirección: "${p.direccion}"`);
        console.log('');
      });
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkAlerts();

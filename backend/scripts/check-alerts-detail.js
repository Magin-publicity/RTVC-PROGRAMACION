const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function checkAlerts() {
  try {
    const date = '2026-01-12';
    const shiftType = 'AM';

    const result = await pool.query(`
      SELECT id, alert_type, severity, message, personnel_id, resolved, created_at
      FROM route_alerts
      WHERE date = $1 AND shift_type = $2
      ORDER BY created_at DESC
    `, [date, shiftType]);

    console.log(`Alertas para ${date} ${shiftType}:`);
    console.log('='.repeat(80));
    console.log(`Total: ${result.rows.length} alertas\n`);

    result.rows.forEach((alert, idx) => {
      console.log(`${idx + 1}. [${alert.alert_type}] ${alert.severity}`);
      console.log(`   Mensaje: ${alert.message}`);
      console.log(`   Resuelto: ${alert.resolved ? 'Sí' : 'No'}`);
      console.log(`   ID: ${alert.id}, Personnel ID: ${alert.personnel_id || 'N/A'}`);
      console.log('');
    });

    // Contar por tipo
    const byType = {};
    result.rows.forEach(a => {
      byType[a.alert_type] = (byType[a.alert_type] || 0) + 1;
    });

    console.log('Por tipo de alerta:');
    Object.keys(byType).forEach(type => {
      console.log(`  ${type}: ${byType[type]}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAlerts();

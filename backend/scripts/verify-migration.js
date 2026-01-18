const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

pool.query(`
  SELECT name, area, direccion, phone, email
  FROM personnel
  WHERE active = true AND (direccion IS NOT NULL OR phone IS NOT NULL OR email IS NOT NULL)
  ORDER BY name
  LIMIT 20
`).then(res => {
  console.log('='.repeat(80));
  console.log('VERIFICACIÓN DE DATOS MIGRADOS');
  console.log('='.repeat(80));
  console.log(`Total de empleados con datos actualizados: ${res.rows.length}\n`);

  res.rows.forEach((r, idx) => {
    console.log(`${idx + 1}. ${r.name} - ${r.area}`);
    if (r.direccion) console.log(`   📍 ${r.direccion}`);
    if (r.phone) console.log(`   📞 ${r.phone}`);
    if (r.email) console.log(`   ✉️  ${r.email}`);
    console.log('');
  });

  pool.end();
});

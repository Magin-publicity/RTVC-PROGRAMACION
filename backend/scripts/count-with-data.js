const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

pool.query(`
  SELECT
    COUNT(*) FILTER (WHERE direccion IS NOT NULL OR phone IS NOT NULL OR email IS NOT NULL) as con_datos,
    COUNT(*) FILTER (WHERE direccion IS NULL AND phone IS NULL AND email IS NULL) as sin_datos,
    COUNT(*) as total
  FROM personnel
  WHERE active = true
`).then(res => {
  console.log('='.repeat(80));
  console.log('RESUMEN DE PERSONAL CON DATOS DE CONTACTO');
  console.log('='.repeat(80));
  console.log(`\n✅ Personas CON datos (dirección, teléfono o email): ${res.rows[0].con_datos}`);
  console.log(`⚠️  Personas SIN datos: ${res.rows[0].sin_datos}`);
  console.log(`📊 Total activos: ${res.rows[0].total}`);
  console.log(`\n📈 Cobertura: ${((res.rows[0].con_datos / res.rows[0].total) * 100).toFixed(1)}%`);
  pool.end();
});

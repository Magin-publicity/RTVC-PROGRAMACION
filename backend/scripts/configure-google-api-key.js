const { Pool } = require('pg');
const readline = require('readline');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function configureApiKey() {
  console.log('='.repeat(80));
  console.log('CONFIGURACIÓN DE GOOGLE MAPS API KEY');
  console.log('='.repeat(80));

  console.log('\nPasos para obtener tu API Key:');
  console.log('1. Ve a: https://console.cloud.google.com/');
  console.log('2. Crea un proyecto o selecciona uno existente');
  console.log('3. Habilita estas APIs:');
  console.log('   - Geocoding API');
  console.log('   - Distance Matrix API');
  console.log('4. Ve a "Credenciales" y crea una API Key');
  console.log('5. Copia la API Key\n');

  rl.question('Ingresa tu Google Maps API Key (o presiona Enter para omitir): ', async (apiKey) => {
    try {
      if (!apiKey || apiKey.trim() === '') {
        console.log('\n⚠️  No se ingresó API Key. El sistema funcionará en modo simulado.');
        console.log('   Las direcciones no se geocodificarán y las rutas no se optimizarán.\n');
      } else {
        const result = await pool.query(
          `UPDATE routes_configuration
           SET config_value = $1, updated_at = NOW()
           WHERE config_key = 'GOOGLE_API_KEY'
           RETURNING *`,
          [apiKey.trim()]
        );

        console.log('\n✅ API Key configurada correctamente!');
        console.log(`   Key guardada: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
        console.log('\n⚠️  IMPORTANTE: Reinicia el servidor backend para que la configuración surta efecto.');
      }
    } catch (error) {
      console.error('\n❌ Error configurando API Key:', error.message);
    } finally {
      rl.close();
      await pool.end();
    }
  });
}

configureApiKey();

const pool = require('../config/database');
const bcrypt = require('bcrypt');

async function createAuthSystem() {
  try {
    console.log('🔐 Creando sistema de autenticación...\n');

    // 1. Crear tabla de usuarios
    console.log('📋 Creando tabla de usuarios...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        personnel_id INTEGER REFERENCES personnel(id),
        role VARCHAR(50) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `);
    console.log('✅ Tabla users creada');

    // 2. Crear tabla de roles y permisos
    console.log('\n📋 Creando tabla de roles...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        permissions JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla roles creada');

    // 3. Insertar roles predefinidos
    console.log('\n📋 Insertando roles predefinidos...');

    const roles = [
      {
        name: 'admin',
        description: 'Administrador con acceso total',
        permissions: {
          schedule: { view: true, edit: true, delete: true, export: true },
          personnel: { view: true, edit: true, delete: true },
          novelties: { view: true, create: true, edit: true, delete: true },
          rotation: { view: true, edit: true },
          reports: { view: true, export: true },
          users: { view: true, create: true, edit: true, delete: true }
        }
      },
      {
        name: 'coordinator',
        description: 'Coordinador - puede ver y editar programación',
        permissions: {
          schedule: { view: true, edit: true, delete: false, export: true },
          personnel: { view: true, edit: false, delete: false },
          novelties: { view: true, create: true, edit: true, delete: true },
          rotation: { view: true, edit: false },
          reports: { view: true, export: true },
          users: { view: false, create: false, edit: false, delete: false }
        }
      },
      {
        name: 'director',
        description: 'Director - puede ver programación y gestionar su área',
        permissions: {
          schedule: { view: true, edit: true, delete: false, export: true },
          personnel: { view: true, edit: false, delete: false },
          novelties: { view: true, create: true, edit: true, delete: false },
          rotation: { view: true, edit: false },
          reports: { view: true, export: false },
          users: { view: false, create: false, edit: false, delete: false }
        }
      },
      {
        name: 'employee',
        description: 'Empleado - solo puede ver su programación',
        permissions: {
          schedule: { view: true, edit: false, delete: false, export: false },
          personnel: { view: false, edit: false, delete: false },
          novelties: { view: true, create: false, edit: false, delete: false },
          rotation: { view: true, edit: false },
          reports: { view: false, export: false },
          users: { view: false, create: false, edit: false, delete: false }
        }
      }
    ];

    for (const role of roles) {
      await pool.query(
        `INSERT INTO roles (name, description, permissions)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO UPDATE
         SET description = $2, permissions = $3`,
        [role.name, role.description, JSON.stringify(role.permissions)]
      );
    }
    console.log('✅ Roles insertados');

    // 4. Crear usuario administrador por defecto
    console.log('\n👤 Creando usuario administrador...');
    const adminPassword = await bcrypt.hash('admin123', 10);

    await pool.query(`
      INSERT INTO users (username, password, role)
      VALUES ('admin', $1, 'admin')
      ON CONFLICT (username) DO NOTHING
    `, [adminPassword]);

    console.log('✅ Usuario administrador creado');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   ⚠️  IMPORTANTE: Cambia esta contraseña después del primer login');

    // 5. Crear tabla de sesiones
    console.log('\n📋 Creando tabla de sesiones...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla sessions creada');

    // 6. Mostrar resumen
    console.log('\n📊 Resumen del sistema de autenticación:');
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const rolesCount = await pool.query('SELECT COUNT(*) FROM roles');

    console.log(`   ✅ ${rolesCount.rows[0].count} roles creados`);
    console.log(`   ✅ ${usersCount.rows[0].count} usuario(s) creado(s)`);

    // Mostrar roles
    const rolesList = await pool.query('SELECT name, description FROM roles ORDER BY name');
    console.log('\n🎭 Roles disponibles:');
    console.table(rolesList.rows);

    console.log('\n✨ ¡Sistema de autenticación creado exitosamente!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createAuthSystem();

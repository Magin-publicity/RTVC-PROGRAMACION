// Migración: crear tablas para Grupos Exclusivos (MÁSTER, MÓVIL, PUESTO FIJO)
const pool = require('../config/database');

async function createExclusiveGroups() {
  try {
    console.log('🚀 Iniciando migración de Grupos Exclusivos...\n');

    // =============================================
    // TABLA: exclusive_groups (definición del grupo)
    // =============================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exclusive_groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,

        -- Tipo de grupo: MASTER, MOVIL, PUESTO_FIJO
        group_type VARCHAR(20) NOT NULL CHECK (group_type IN ('MASTER', 'MOVIL', 'PUESTO_FIJO')),

        -- Para MASTER: referencia al master/estudio
        master_id INTEGER REFERENCES masters(id) ON DELETE SET NULL,

        -- Para MOVIL: referencia al vehículo y conductor
        vehicle_id INTEGER REFERENCES fleet_vehicles(id) ON DELETE SET NULL,
        driver_id INTEGER REFERENCES personnel(id) ON DELETE SET NULL,

        -- Para PUESTO_FIJO: ubicación externa
        location_name VARCHAR(150),  -- Ej: "Congreso", "Presidencia", "Aeropuerto"
        location_address TEXT,

        -- Personal asignado al grupo (array de IDs)
        personnel_ids INTEGER[] NOT NULL DEFAULT '{}',

        -- Estado y color para visualización
        is_active BOOLEAN DEFAULT true,
        color VARCHAR(7) DEFAULT '#6366f1',  -- Color hex para UI

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla exclusive_groups creada');

    // =============================================
    // TABLA: exclusive_group_assignments (historial por día)
    // =============================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exclusive_group_assignments (
        id SERIAL PRIMARY KEY,

        -- Referencia al grupo
        group_id INTEGER NOT NULL REFERENCES exclusive_groups(id) ON DELETE CASCADE,

        -- Fecha de asignación
        assignment_date DATE NOT NULL,

        -- Turno (AM/PM o ALL_DAY)
        shift_type VARCHAR(10) DEFAULT 'ALL_DAY' CHECK (shift_type IN ('AM', 'PM', 'ALL_DAY')),

        -- Snapshot del personal asignado ese día (para historial)
        personnel_ids INTEGER[] NOT NULL DEFAULT '{}',

        -- Estado del grupo ese día
        status VARCHAR(20) DEFAULT 'ACTIVO' CHECK (status IN ('ACTIVO', 'INCOMPLETO', 'CANCELADO')),

        -- Notas o alertas del día
        notes TEXT,
        alerts JSONB DEFAULT '[]',  -- Array de alertas (ej: personal con novedad)

        -- Para MOVIL: estado del despacho
        dispatch_time TIME,
        return_time TIME,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        -- Evitar duplicados: un grupo solo puede tener una asignación por día/turno
        UNIQUE(group_id, assignment_date, shift_type)
      )
    `);
    console.log('✅ Tabla exclusive_group_assignments creada');

    // =============================================
    // ÍNDICES
    // =============================================
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_exclusive_groups_type ON exclusive_groups(group_type)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_exclusive_groups_active ON exclusive_groups(is_active)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_exclusive_assignments_date ON exclusive_group_assignments(assignment_date)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_exclusive_assignments_group ON exclusive_group_assignments(group_id)`);
    console.log('✅ Índices creados');

    // =============================================
    // COLORES POR DEFECTO PARA CADA TIPO
    // =============================================
    // MASTER: Azul (#3b82f6)
    // MOVIL: Verde (#10b981)
    // PUESTO_FIJO: Naranja (#f59e0b)

    console.log('\n✅ Migración completada exitosamente');
    console.log('\n📋 Tipos de grupos disponibles:');
    console.log('   - MASTER: Equipos que operan un Master/Estudio (color azul)');
    console.log('   - MOVIL: Equipos en unidad móvil con vehículo y conductor (color verde)');
    console.log('   - PUESTO_FIJO: Personal en ubicación externa fija (color naranja)');

  } catch (err) {
    console.error('❌ Error en migración:', err.message);
  } finally {
    process.exit(0);
  }
}

createExclusiveGroups();

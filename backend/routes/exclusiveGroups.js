// backend/routes/exclusiveGroups.js
// Rutas para gestión de Grupos Exclusivos (MÁSTER, MÓVIL, PUESTO FIJO)

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Colores por tipo de grupo
const GROUP_COLORS = {
  MASTER: '#3b82f6',      // Azul
  MOVIL: '#10b981',       // Verde
  PUESTO_FIJO: '#f59e0b'  // Naranja
};

// =============================================
// GET: Obtener todos los grupos exclusivos
// =============================================
router.get('/', async (req, res) => {
  try {
    const { group_type, active_only } = req.query;

    let query = `
      SELECT
        eg.*,
        m.nombre as master_name,
        m.codigo as master_code,
        fv.placa as vehicle_plate,
        fv.marca as vehicle_brand,
        fv.modelo as vehicle_model,
        p.name as driver_name,
        (SELECT COUNT(*) FROM unnest(eg.personnel_ids)) as personnel_count
      FROM exclusive_groups eg
      LEFT JOIN masters m ON eg.master_id = m.id
      LEFT JOIN fleet_vehicles fv ON eg.vehicle_id = fv.id
      LEFT JOIN personnel p ON eg.driver_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (group_type) {
      params.push(group_type);
      query += ` AND eg.group_type = $${params.length}`;
    }

    if (active_only === 'true') {
      query += ` AND eg.is_active = true`;
    }

    query += ` ORDER BY eg.group_type, eg.name`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo grupos exclusivos:', error);
    res.status(500).json({ error: 'Error al obtener grupos exclusivos' });
  }
});

// =============================================
// GET: Obtener un grupo por ID con detalles del personal
// =============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const groupResult = await pool.query(`
      SELECT
        eg.*,
        m.nombre as master_name,
        m.codigo as master_code,
        fv.placa as vehicle_plate,
        fv.marca as vehicle_brand,
        fv.modelo as vehicle_model,
        fv.capacidad as vehicle_capacity,
        p.name as driver_name
      FROM exclusive_groups eg
      LEFT JOIN masters m ON eg.master_id = m.id
      LEFT JOIN fleet_vehicles fv ON eg.vehicle_id = fv.id
      LEFT JOIN personnel p ON eg.driver_id = p.id
      WHERE eg.id = $1
    `, [id]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    const group = groupResult.rows[0];

    // Obtener detalles del personal
    if (group.personnel_ids && group.personnel_ids.length > 0) {
      const personnelResult = await pool.query(`
        SELECT id, name, area, phone, email
        FROM personnel
        WHERE id = ANY($1::int[])
        ORDER BY area, name
      `, [group.personnel_ids]);
      group.personnel_details = personnelResult.rows;
    } else {
      group.personnel_details = [];
    }

    res.json(group);
  } catch (error) {
    console.error('Error obteniendo grupo:', error);
    res.status(500).json({ error: 'Error al obtener grupo' });
  }
});

// =============================================
// POST: Crear nuevo grupo exclusivo
// =============================================
router.post('/', async (req, res) => {
  try {
    const {
      name, description, group_type,
      master_id, vehicle_id, driver_id,
      location_name, location_address,
      personnel_ids, color
    } = req.body;

    // Validaciones
    if (!name || !group_type) {
      return res.status(400).json({ error: 'Nombre y tipo de grupo son requeridos' });
    }

    if (!['MASTER', 'MOVIL', 'PUESTO_FIJO'].includes(group_type)) {
      return res.status(400).json({ error: 'Tipo de grupo inválido' });
    }

    // Validaciones específicas por tipo
    if (group_type === 'MASTER' && !master_id) {
      return res.status(400).json({ error: 'Grupo MASTER requiere seleccionar un Master/Estudio' });
    }

    if (group_type === 'MOVIL' && (!vehicle_id || !driver_id)) {
      return res.status(400).json({ error: 'Grupo MÓVIL requiere seleccionar vehículo y conductor' });
    }

    if (group_type === 'PUESTO_FIJO' && !location_name) {
      return res.status(400).json({ error: 'Grupo PUESTO FIJO requiere especificar ubicación' });
    }

    const finalColor = color || GROUP_COLORS[group_type];

    const result = await pool.query(`
      INSERT INTO exclusive_groups (
        name, description, group_type,
        master_id, vehicle_id, driver_id,
        location_name, location_address,
        personnel_ids, color
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      name.trim(), description || null, group_type,
      master_id || null, vehicle_id || null, driver_id || null,
      location_name || null, location_address || null,
      personnel_ids || [], finalColor
    ]);

    console.log(`✅ Grupo exclusivo creado: ${name} (${group_type})`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando grupo exclusivo:', error);
    res.status(500).json({ error: 'Error al crear grupo exclusivo' });
  }
});

// =============================================
// PUT: Actualizar grupo exclusivo
// =============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, group_type,
      master_id, vehicle_id, driver_id,
      location_name, location_address,
      personnel_ids, color, is_active
    } = req.body;

    const result = await pool.query(`
      UPDATE exclusive_groups SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        group_type = COALESCE($3, group_type),
        master_id = $4,
        vehicle_id = $5,
        driver_id = $6,
        location_name = $7,
        location_address = $8,
        personnel_ids = COALESCE($9, personnel_ids),
        color = COALESCE($10, color),
        is_active = COALESCE($11, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `, [
      name, description, group_type,
      master_id || null, vehicle_id || null, driver_id || null,
      location_name || null, location_address || null,
      personnel_ids, color, is_active, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    console.log(`✏️ Grupo exclusivo actualizado: ID ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando grupo:', error);
    res.status(500).json({ error: 'Error al actualizar grupo' });
  }
});

// =============================================
// DELETE: Eliminar grupo exclusivo
// =============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM exclusive_groups WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    console.log(`🗑️ Grupo exclusivo eliminado: ID ${id}`);
    res.json({ message: 'Grupo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando grupo:', error);
    res.status(500).json({ error: 'Error al eliminar grupo' });
  }
});

// =============================================
// POST: Asignar grupo a una fecha (crear asignación diaria)
// =============================================
router.post('/assign', async (req, res) => {
  try {
    const { group_id, assignment_date, shift_type, notes } = req.body;

    if (!group_id || !assignment_date) {
      return res.status(400).json({ error: 'group_id y assignment_date son requeridos' });
    }

    // Obtener el grupo y su personal
    const groupResult = await pool.query(
      'SELECT * FROM exclusive_groups WHERE id = $1',
      [group_id]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    const group = groupResult.rows[0];

    // Verificar novedades del personal para ese día
    const noveltiesResult = await pool.query(`
      SELECT n.personnel_id, n.type, n.description, p.name
      FROM novelties n
      JOIN personnel p ON n.personnel_id = p.id
      WHERE n.personnel_id = ANY($1::int[])
        AND $2 BETWEEN n.start_date AND COALESCE(n.end_date, n.start_date)
        AND n.status = 'aprobado'
    `, [group.personnel_ids, assignment_date]);

    const alerts = noveltiesResult.rows.map(n => ({
      type: 'NOVEDAD',
      personnel_id: n.personnel_id,
      personnel_name: n.name,
      novelty_type: n.type,
      message: `Grupo Incompleto por Novedad de ${n.name}: ${n.type}`
    }));

    const status = alerts.length > 0 ? 'INCOMPLETO' : 'ACTIVO';

    // Crear o actualizar la asignación
    const result = await pool.query(`
      INSERT INTO exclusive_group_assignments (
        group_id, assignment_date, shift_type,
        personnel_ids, status, notes, alerts
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (group_id, assignment_date, shift_type) DO UPDATE SET
        personnel_ids = $4,
        status = $5,
        notes = COALESCE($6, exclusive_group_assignments.notes),
        alerts = $7,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      group_id, assignment_date, shift_type || 'ALL_DAY',
      group.personnel_ids, status, notes || null, JSON.stringify(alerts)
    ]);

    console.log(`📅 Grupo ${group.name} asignado para ${assignment_date} - Estado: ${status}`);

    res.json({
      assignment: result.rows[0],
      alerts,
      message: alerts.length > 0
        ? `Grupo asignado con ${alerts.length} alerta(s) de novedad`
        : 'Grupo asignado exitosamente'
    });
  } catch (error) {
    console.error('Error asignando grupo:', error);
    res.status(500).json({ error: 'Error al asignar grupo' });
  }
});

// =============================================
// GET: Obtener asignaciones de grupos para una fecha
// =============================================
router.get('/assignments/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const result = await pool.query(`
      SELECT
        ega.*,
        eg.name as group_name,
        eg.group_type,
        eg.color,
        eg.master_id,
        eg.vehicle_id,
        eg.driver_id,
        eg.location_name,
        m.nombre as master_name,
        fv.placa as vehicle_plate,
        p.name as driver_name
      FROM exclusive_group_assignments ega
      JOIN exclusive_groups eg ON ega.group_id = eg.id
      LEFT JOIN masters m ON eg.master_id = m.id
      LEFT JOIN fleet_vehicles fv ON eg.vehicle_id = fv.id
      LEFT JOIN personnel p ON eg.driver_id = p.id
      WHERE ega.assignment_date = $1
      ORDER BY eg.group_type, eg.name
    `, [date]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo asignaciones:', error);
    res.status(500).json({ error: 'Error al obtener asignaciones' });
  }
});

// =============================================
// GET: Verificar si personal está bloqueado por grupo exclusivo
// =============================================
router.get('/check-blocked/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { personnel_ids } = req.query;

    if (!personnel_ids) {
      return res.json({ blocked: [] });
    }

    const idsArray = personnel_ids.split(',').map(Number);

    // Buscar asignaciones activas para esa fecha
    const result = await pool.query(`
      SELECT
        ega.personnel_ids,
        eg.name as group_name,
        eg.group_type,
        eg.color,
        eg.location_name,
        m.nombre as master_name
      FROM exclusive_group_assignments ega
      JOIN exclusive_groups eg ON ega.group_id = eg.id
      LEFT JOIN masters m ON eg.master_id = m.id
      WHERE ega.assignment_date = $1
        AND ega.status != 'CANCELADO'
    `, [date]);

    const blocked = [];

    for (const assignment of result.rows) {
      for (const id of idsArray) {
        if (assignment.personnel_ids.includes(id)) {
          blocked.push({
            personnel_id: id,
            group_name: assignment.group_name,
            group_type: assignment.group_type,
            color: assignment.color,
            location: assignment.group_type === 'MASTER'
              ? assignment.master_name
              : assignment.location_name
          });
        }
      }
    }

    res.json({ blocked });
  } catch (error) {
    console.error('Error verificando bloqueo:', error);
    res.status(500).json({ error: 'Error al verificar bloqueo' });
  }
});

// =============================================
// GET: Datos auxiliares (masters, vehículos, conductores)
// =============================================
router.get('/aux/masters', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, codigo, tipo, estado
      FROM masters
      WHERE estado = 'activo'
      ORDER BY nombre
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo masters:', error);
    res.status(500).json({ error: 'Error al obtener masters' });
  }
});

router.get('/aux/vehicles', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, placa, marca, modelo, capacidad, estado
      FROM fleet_vehicles
      WHERE estado = 'disponible' OR estado = 'activo'
      ORDER BY placa
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo vehículos:', error);
    res.status(500).json({ error: 'Error al obtener vehículos' });
  }
});

router.get('/aux/drivers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, area, phone
      FROM personnel
      WHERE area ILIKE '%conductor%' OR area ILIKE '%driver%'
        AND active = true
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo conductores:', error);
    res.status(500).json({ error: 'Error al obtener conductores' });
  }
});

module.exports = router;

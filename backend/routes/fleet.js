const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rtvc_scheduling',
  password: process.env.DB_PASSWORD || 'Padres2023',
  port: process.env.DB_PORT || 5432,
});

/**
 * GET /api/fleet/vehicles
 * Obtiene todos los vehículos de la flota
 */
router.get('/vehicles', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, vehicle_code, vehicle_type, capacity, driver_name, driver_phone, plate, status, is_active
      FROM fleet_vehicles
      WHERE is_active = true
      ORDER BY vehicle_code
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo vehículos:', error);
    res.status(500).json({ error: 'Error al obtener vehículos' });
  }
});

/**
 * GET /api/fleet/availability/:date
 * Obtiene la disponibilidad de vehículos para una fecha específica
 */
router.get('/availability/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const result = await pool.query(`
      SELECT
        fa.id,
        fa.date,
        fa.vehicle_id,
        fa.available_from,
        fa.status,
        fa.notes,
        fv.vehicle_code,
        fv.vehicle_type,
        fv.capacity,
        fv.driver_name,
        fv.driver_phone,
        fv.plate
      FROM fleet_availability fa
      JOIN fleet_vehicles fv ON fv.id = fa.vehicle_id
      WHERE fa.date = $1
      ORDER BY fa.available_from, fv.vehicle_code
    `, [date]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo disponibilidad:', error);
    res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
});

/**
 * POST /api/fleet/availability
 * Marca vehículos como disponibles para reportería
 */
router.post('/availability', async (req, res) => {
  try {
    const { date, vehicleIds, availableFrom } = req.body;

    if (!date || !vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length === 0) {
      return res.status(400).json({ error: 'Parámetros inválidos' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const inserted = [];
      for (const vehicleId of vehicleIds) {
        const result = await client.query(`
          INSERT INTO fleet_availability (date, vehicle_id, available_from, status)
          VALUES ($1, $2, $3, 'DISPONIBLE')
          ON CONFLICT (date, vehicle_id)
          DO UPDATE SET available_from = $3, status = 'DISPONIBLE', updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `, [date, vehicleId, availableFrom || '10:00']);

        inserted.push(result.rows[0]);
      }

      await client.query('COMMIT');

      console.log(`✅ ${inserted.length} vehículos marcados como disponibles para ${date}`);
      res.json({ message: 'Disponibilidad registrada', vehicles: inserted });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error registrando disponibilidad:', error);
    res.status(500).json({ error: 'Error al registrar disponibilidad' });
  }
});

/**
 * DELETE /api/fleet/availability/:id
 * Elimina un vehículo de la lista de disponibles
 */
router.delete('/availability/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM fleet_availability
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro de disponibilidad no encontrado' });
    }

    console.log(`✅ Vehículo eliminado de disponibilidad: ID ${id}`);
    res.json({ message: 'Vehículo eliminado de disponibilidad', availability: result.rows[0] });
  } catch (error) {
    console.error('Error eliminando disponibilidad:', error);
    res.status(500).json({ error: 'Error al eliminar disponibilidad' });
  }
});

/**
 * GET /api/fleet/dispatches/:date
 * Obtiene los despachos de prensa para una fecha específica
 */
router.get('/dispatches/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const result = await pool.query(`
      SELECT
        pd.*,
        fv.vehicle_code,
        fv.vehicle_type,
        fv.capacity
      FROM press_dispatches pd
      JOIN fleet_vehicles fv ON fv.id = pd.vehicle_id
      WHERE pd.date = $1
      ORDER BY pd.departure_time, pd.id
    `, [date]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo despachos:', error);
    res.status(500).json({ error: 'Error al obtener despachos' });
  }
});

/**
 * POST /api/fleet/dispatches
 * Crea un nuevo despacho de prensa
 */
router.post('/dispatches', async (req, res) => {
  try {
    const {
      date,
      vehicleId,
      journalistId,
      journalistName,
      cameramanId,
      cameramanName,
      assistantId,
      assistantName,
      directorId,
      directorName,
      liveuId,
      liveuCode,
      driverName,
      vehiclePlate,
      destination,
      departureTime,
      estimatedReturn,
      notes
    } = req.body;

    if (!date || !vehicleId || !journalistName || !driverName || !vehiclePlate || !destination || !departureTime) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    const result = await pool.query(`
      INSERT INTO press_dispatches (
        date, vehicle_id, journalist_id, journalist_name, cameraman_id, cameraman_name,
        assistant_id, assistant_name, director_id, director_name,
        liveu_id, liveu_code,
        driver_name, vehicle_plate, destination, departure_time, estimated_return, notes, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'PROGRAMADO')
      RETURNING *
    `, [date, vehicleId, journalistId, journalistName, cameramanId, cameramanName,
        assistantId, assistantName, directorId, directorName,
        liveuId, liveuCode,
        driverName, vehiclePlate, destination, departureTime, estimatedReturn, notes]);

    console.log(`✅ Despacho creado: ${journalistName} → ${destination} a las ${departureTime}${liveuCode ? ` [LiveU: ${liveuCode}]` : ''}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando despacho:', error);
    res.status(500).json({ error: 'Error al crear despacho' });
  }
});

/**
 * PUT /api/fleet/dispatches/:id
 * Actualiza un despacho existente
 */
router.put('/dispatches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      journalistName,
      cameramanId,
      cameramanName,
      assistantId,
      assistantName,
      directorId,
      directorName,
      liveuId,
      liveuCode,
      driverName,
      vehiclePlate,
      destination,
      departureTime,
      estimatedReturn,
      actualReturn,
      status,
      notes
    } = req.body;

    const result = await pool.query(`
      UPDATE press_dispatches
      SET
        journalist_name = COALESCE($1, journalist_name),
        cameraman_id = COALESCE($2, cameraman_id),
        cameraman_name = COALESCE($3, cameraman_name),
        assistant_id = COALESCE($4, assistant_id),
        assistant_name = COALESCE($5, assistant_name),
        director_id = COALESCE($6, director_id),
        director_name = COALESCE($7, director_name),
        liveu_id = COALESCE($8, liveu_id),
        liveu_code = COALESCE($9, liveu_code),
        driver_name = COALESCE($10, driver_name),
        vehicle_plate = COALESCE($11, vehicle_plate),
        destination = COALESCE($12, destination),
        departure_time = COALESCE($13, departure_time),
        estimated_return = COALESCE($14, estimated_return),
        actual_return = COALESCE($15, actual_return),
        status = COALESCE($16, status),
        notes = COALESCE($17, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $18
      RETURNING *
    `, [journalistName, cameramanId, cameramanName, assistantId, assistantName, directorId, directorName, liveuId, liveuCode, driverName, vehiclePlate, destination,
        departureTime, estimatedReturn, actualReturn, status, notes, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Despacho no encontrado' });
    }

    console.log(`✅ Despacho ${id} actualizado`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando despacho:', error);
    res.status(500).json({ error: 'Error al actualizar despacho' });
  }
});

/**
 * DELETE /api/fleet/dispatches/:id
 * Elimina un despacho
 */
router.delete('/dispatches/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM press_dispatches WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Despacho no encontrado' });
    }

    console.log(`✅ Despacho ${id} eliminado`);
    res.json({ message: 'Despacho eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando despacho:', error);
    res.status(500).json({ error: 'Error al eliminar despacho' });
  }
});

/**
 * GET /api/fleet/journalists
 * Obtiene la lista de periodistas para autocompletado
 */
router.get('/journalists', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name as full_name
      FROM personnel
      WHERE area = 'PERIODISTAS'
      ORDER BY name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo periodistas:', error);
    res.status(500).json({ error: 'Error al obtener periodistas' });
  }
});

/**
 * GET /api/fleet/cameramen
 * Obtiene la lista de camarógrafos para autocompletado
 */
router.get('/cameramen', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name as full_name
      FROM personnel
      WHERE area = 'CAMARÓGRAFOS DE REPORTERÍA'
      ORDER BY name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo camarógrafos:', error);
    res.status(500).json({ error: 'Error al obtener camarógrafos' });
  }
});

/**
 * GET /api/fleet/assistants
 * Obtiene la lista de asistentes de reportería para autocompletado
 */
router.get('/assistants', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name as full_name
      FROM personnel
      WHERE area = 'ASISTENTES DE REPORTERÍA'
      ORDER BY name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo asistentes:', error);
    res.status(500).json({ error: 'Error al obtener asistentes' });
  }
});

/**
 * GET /api/fleet/directors
 * Obtiene la lista de realizadores para autocompletado
 */
router.get('/directors', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name as full_name
      FROM personnel
      WHERE area = 'REALIZADORES'
      ORDER BY name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo realizadores:', error);
    res.status(500).json({ error: 'Error al obtener realizadores' });
  }
});

/**
 * POST /api/fleet/vehicles
 * Crea un nuevo vehículo en la flota
 */
router.post('/vehicles', async (req, res) => {
  try {
    const { vehicleCode, vehicleType, capacity, driverName, driverPhone, plate } = req.body;

    if (!vehicleCode || !vehicleType || !capacity) {
      return res.status(400).json({ error: 'Código, tipo y capacidad son requeridos' });
    }

    const result = await pool.query(`
      INSERT INTO fleet_vehicles (vehicle_code, vehicle_type, capacity, driver_name, driver_phone, plate, status, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, 'AVAILABLE', true)
      RETURNING *
    `, [vehicleCode, vehicleType, capacity, driverName, driverPhone, plate]);

    console.log(`✅ Vehículo creado: ${vehicleCode} - ${vehicleType}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando vehículo:', error);
    if (error.code === '23505') { // Duplicate key
      res.status(400).json({ error: 'Ya existe un vehículo con ese código' });
    } else {
      res.status(500).json({ error: 'Error al crear vehículo' });
    }
  }
});

/**
 * PUT /api/fleet/vehicles/:id
 * Actualiza un vehículo existente
 */
router.put('/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicleCode, vehicleType, capacity, driverName, driverPhone, plate, status } = req.body;

    const result = await pool.query(`
      UPDATE fleet_vehicles
      SET
        vehicle_code = COALESCE($1, vehicle_code),
        vehicle_type = COALESCE($2, vehicle_type),
        capacity = COALESCE($3, capacity),
        driver_name = COALESCE($4, driver_name),
        driver_phone = COALESCE($5, driver_phone),
        plate = COALESCE($6, plate),
        status = COALESCE($7, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 AND is_active = true
      RETURNING *
    `, [vehicleCode, vehicleType, capacity, driverName, driverPhone, plate, status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    console.log(`✅ Vehículo actualizado: ${result.rows[0].vehicle_code}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando vehículo:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Ya existe un vehículo con ese código' });
    } else {
      res.status(500).json({ error: 'Error al actualizar vehículo' });
    }
  }
});

/**
 * DELETE /api/fleet/vehicles/:id
 * Elimina (desactiva) un vehículo
 */
router.delete('/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete: marcar como inactivo en lugar de eliminar
    const result = await pool.query(`
      UPDATE fleet_vehicles
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING vehicle_code
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    console.log(`🗑️  Vehículo eliminado: ${result.rows[0].vehicle_code}`);
    res.json({ message: 'Vehículo eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando vehículo:', error);
    res.status(500).json({ error: 'Error al eliminar vehículo' });
  }
});

// GET - Detalle de Flota para el Dashboard
router.get('/detalle/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;
    console.log(`🚐 Obteniendo detalle de flota para ${fecha}`);

    // Obtener todos los vehículos disponibles
    const vehiculosQuery = `
      SELECT
        v.id,
        v.vehicle_code,
        v.vehicle_type as type,
        v.capacity,
        v.status,
        v.driver_name,
        v.driver_phone,
        v.current_location
      FROM fleet_vehicles v
      WHERE v.is_active = true
      ORDER BY
        CASE v.status
          WHEN 'AVAILABLE' THEN 1
          WHEN 'IN_ROUTE' THEN 2
          WHEN 'MAINTENANCE' THEN 3
          ELSE 4
        END,
        v.vehicle_code
    `;

    const result = await pool.query(vehiculosQuery);
    const vehiculos = result.rows;

    // 🆕 Buscar despachos activos desde press_dispatches
    const despachosQuery = `
      SELECT
        vehicle_id,
        journalist_name,
        destination,
        departure_time,
        status
      FROM press_dispatches
      WHERE date = $1
        AND status IN ('PROGRAMADO', 'EN_RUTA')
        AND vehicle_id IS NOT NULL
    `;
    const despachosResult = await pool.query(despachosQuery, [fecha]);
    const despachos = despachosResult.rows;

    // Enriquecer la información
    const detalle = vehiculos.map(veh => {
      const despacho = despachos.find(d => d.vehicle_id === veh.id);

      // Mapear estados
      const estadoMap = {
        'AVAILABLE': 'DISPONIBLE',
        'IN_ROUTE': 'EN_RUTA',
        'MAINTENANCE': 'MANTENIMIENTO',
        'REPORTING': 'EN_REPORTERIA'
      };

      return {
        id: veh.id,
        vehicle_code: veh.vehicle_code,
        plate_number: veh.vehicle_code, // Usar vehicle_code como placa
        type: veh.type,
        capacity: veh.capacity,
        status: despacho ? 'EN_RUTA' : (estadoMap[veh.status] || veh.status),
        driver_name: veh.driver_name,
        driver_phone: veh.driver_phone,
        current_location: veh.current_location,
        despacho: despacho ? {
          periodista: despacho.journalist_name,
          destino: despacho.destination,
          hora_salida: despacho.departure_time,
          status: despacho.status
        } : null
      };
    });

    res.json(detalle);
  } catch (error) {
    console.error('❌ Error al obtener detalle de flota:', error);
    res.status(500).json({ error: 'Error al obtener detalle de flota' });
  }
});

module.exports = router;

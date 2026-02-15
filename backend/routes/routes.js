const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { optimizeRoutes, recalculateRoutes, validateRoutes, checkRestAlert, generateRouteSummary } = require('../services/routeOptimization');
const { classifyAddress, groupAddressesByZone, getZonificationStats } = require('../services/geographicZonification');
const exportService = require('../services/exportService');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

// ============================================================================
// TRANSPORT ASSIGNMENTS
// ============================================================================

/**
 * GET /api/routes/assignments/:date/:shiftType
 * Obtiene todas las asignaciones de transporte para una fecha y turno
 */
router.get('/assignments/:date/:shiftType', async (req, res) => {
  try {
    const { date, shiftType } = req.params;

    const result = await pool.query(
      `SELECT t.*, p.email, p.phone
       FROM daily_transport_assignments t
       LEFT JOIN personnel p ON t.personnel_id = p.id
       WHERE t.date = $1 AND t.shift_type = $2
       ORDER BY t.route_id, t.pickup_order, t.personnel_name`,
      [date, shiftType]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo asignaciones:', error);
    res.status(500).json({ error: 'Error al obtener asignaciones de transporte' });
  }
});

/**
 * POST /api/routes/assignments/initialize
 * Inicializa asignaciones para una fecha y turno basado en programación técnica
 */
router.post('/assignments/initialize', async (req, res) => {
  try {
    const { date, shiftType } = req.body;

    if (!date || !shiftType) {
      return res.status(400).json({ error: 'Fecha y tipo de turno requeridos' });
    }

    // Obtener personal técnico del sistema de rotación automatizada
    // Para AM: personal que INICIA a las 05:00 (El Calentao 06:00-10:00)
    // Para PM: personal que TERMINA a las 22:00 (Última Emisión 21:30-22:00)

    // Primero verificar que existe programación para la fecha
    const scheduleCheck = await pool.query(
      `SELECT date FROM daily_schedules WHERE date = $1`,
      [date]
    );

    if (scheduleCheck.rows.length === 0) {
      return res.status(404).json({
        error: `No hay programación automatizada para ${date}. Por favor genere primero la programación del día.`
      });
    }

    // Obtener los turnos generados automáticamente del endpoint auto-shifts
    // Esto usa la lógica existente de rotación que ya funciona correctamente
    const shiftsResponse = await fetch(`http://localhost:3000/api/schedule/auto-shifts/${date}`);

    if (!shiftsResponse.ok) {
      return res.status(500).json({
        error: 'Error al obtener turnos automatizados'
      });
    }

    const shifts = await shiftsResponse.json();

    // Filtrar personal según el tipo de turno
    let personnelIds = [];

    if (shiftType === 'AM') {
      // AM: Personal que INICIA SOLO a las 05:00 (El Calentao)
      // Filtro estricto: ÚNICAMENTE 05:00, NO 06:00, NO 07:00, NO 08:00, etc.
      personnelIds = shifts
        .filter(shift => {
          const startTime = shift.shift_start.substring(0, 5); // Normalizar a HH:MM
          return startTime === '05:00';
        })
        .map(shift => shift.personnel_id);

      console.log(`🚌 [RUTAS AM] Filtrando personal que inicia a las 05:00`);
      console.log(`   Total shifts disponibles: ${shifts.length}`);
      console.log(`   Shifts filtrados (05:00): ${personnelIds.length}`);
    } else {
      // PM: Personal que TERMINA a las 22:00 (Última Emisión)
      personnelIds = shifts
        .filter(shift => {
          const endTime = shift.shift_end.substring(0, 5); // Normalizar a HH:MM
          return endTime === '22:00';
        })
        .map(shift => shift.personnel_id);

      console.log(`🚌 [RUTAS PM] Filtrando personal que termina a las 22:00`);
      console.log(`   Total shifts disponibles: ${shifts.length}`);
      console.log(`   Shifts filtrados (22:00): ${personnelIds.length}`);
    }

    if (personnelIds.length === 0) {
      const timeInfo = shiftType === 'AM' ? 'que inician a las 05:00' : 'que terminan a las 22:00';
      return res.status(404).json({
        error: `No hay personal ${timeInfo} para el turno ${shiftType} en ${date}`
      });
    }

    // Obtener información completa del personal técnico asignado
    const programmingResult = await pool.query(
      `SELECT * FROM personnel
       WHERE id = ANY($1)
       AND tipo_personal = 'TECNICO'
       AND active = true
       ORDER BY name`,
      [personnelIds]
    );

    const technical = programmingResult.rows;

    // Crear asignaciones para el personal técnico
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Consultar asignaciones existentes para preservar transport_mode
      const existingAssignments = await client.query(
        'SELECT personnel_id, transport_mode FROM daily_transport_assignments WHERE date = $1 AND shift_type = $2',
        [date, shiftType]
      );

      // Crear mapa de transport_mode existente por personnel_id
      const existingModes = {};
      existingAssignments.rows.forEach(row => {
        existingModes[row.personnel_id] = row.transport_mode;
      });

      // Eliminar asignaciones existentes
      await client.query(
        'DELETE FROM daily_transport_assignments WHERE date = $1 AND shift_type = $2',
        [date, shiftType]
      );

      // Insertar nuevas asignaciones preservando transport_mode
      for (const person of technical) {
        // Determinar transport_mode: preservar existente o usar RUTA por defecto (PROPIO si no tiene dirección)
        let transportMode = existingModes[person.id] || 'RUTA';

        // Si no tiene dirección válida y no tiene modo previo, poner PROPIO
        if (!existingModes[person.id] && (!person.direccion || person.direccion.trim() === '')) {
          transportMode = 'PROPIO';
        }

        await client.query(
          `INSERT INTO daily_transport_assignments
           (date, shift_type, personnel_id, personnel_name, personnel_role, personnel_area,
            transport_mode, direccion, barrio, localidad, is_express, confirmed_by_admin)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, false)`,
          [
            date,
            shiftType,
            person.id,
            person.name,
            person.role,
            person.area,
            transportMode,
            person.direccion,
            person.barrio,
            person.localidad
          ]
        );

        // Crear alerta si no tiene dirección
        if (!person.direccion || person.direccion.trim() === '') {
          await client.query(
            `INSERT INTO route_alerts
             (date, shift_type, alert_type, severity, message, personnel_id)
             VALUES ($1, $2, 'INVALID_ADDRESS', 'CRITICAL', $3, $4)`,
            [
              date,
              shiftType,
              `${person.name} no tiene dirección registrada`,
              person.id
            ]
          );
        }
      }

      await client.query('COMMIT');

      const result = await pool.query(
        `SELECT * FROM daily_transport_assignments
         WHERE date = $1 AND shift_type = $2
         ORDER BY personnel_name`,
        [date, shiftType]
      );

      res.json({
        message: `Inicializadas ${technical.length} asignaciones para ${date} - ${shiftType}`,
        assignments: result.rows
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error inicializando asignaciones:', error);
    res.status(500).json({ error: 'Error al inicializar asignaciones' });
  }
});

/**
 * PUT /api/routes/assignments/:id
 * Actualiza una asignación de transporte y recalcula rutas si cambia transport_mode
 */
router.put('/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { transport_mode, direccion, barrio, localidad, confirmed_by_admin, program_title } = req.body;

    // Obtener asignación actual para verificar cambios
    const currentResult = await pool.query(
      'SELECT * FROM daily_transport_assignments WHERE id = $1',
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    const currentAssignment = currentResult.rows[0];
    const transportModeChanged = transport_mode && transport_mode !== currentAssignment.transport_mode;

    // Actualizar asignación
    const result = await pool.query(
      `UPDATE daily_transport_assignments
       SET transport_mode = $1, direccion = $2, barrio = $3, localidad = $4,
           confirmed_by_admin = $5, program_title = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [transport_mode, direccion, barrio, localidad, confirmed_by_admin, program_title, id]
    );

    const updatedAssignment = result.rows[0];

    // NO recalcular automáticamente - el usuario optimizará cuando esté listo
    res.json({
      assignment: updatedAssignment,
      message: 'Asignación actualizada correctamente.'
    });
  } catch (error) {
    console.error('Error actualizando asignación:', error);
    res.status(500).json({ error: 'Error al actualizar asignación' });
  }
});

/**
 * POST /api/routes/assignments/express
 * Agrega un pasajero express (temporal) a las asignaciones
 */
router.post('/assignments/express', async (req, res) => {
  try {
    const { date, shiftType, name, direccion, phone, barrio, localidad, program_title } = req.body;

    if (!date || !shiftType || !name || !direccion) {
      return res.status(400).json({ error: 'Fecha, turno, nombre y dirección son requeridos' });
    }

    const result = await pool.query(
      `INSERT INTO daily_transport_assignments
       (date, shift_type, personnel_name, transport_mode, direccion, barrio, localidad,
        is_express, confirmed_by_admin, program_title)
       VALUES ($1, $2, $3, 'RUTA', $4, $5, $6, true, true, $7)
       RETURNING *`,
      [date, shiftType, name, direccion, barrio || null, localidad || null, program_title || 'El Calentao']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error agregando pasajero express:', error);
    res.status(500).json({ error: 'Error al agregar pasajero express' });
  }
});

/**
 * GET /api/routes/logistic-personnel
 * Obtiene lista de personal logístico (periodistas, ingenieros, productores)
 */
router.get('/logistic-personnel', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, area, direccion, barrio, localidad, phone, email
       FROM personnel
       WHERE tipo_personal = 'LOGISTICO' AND active = true
       ORDER BY area, name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo personal logístico:', error);
    res.status(500).json({ error: 'Error al obtener personal logístico' });
  }
});

/**
 * POST /api/routes/assignments/logistic
 * Añade personal logístico a las asignaciones del día
 */
router.post('/assignments/logistic', async (req, res) => {
  try {
    const { date, shiftType, personnelIds, program_title } = req.body;

    if (!date || !shiftType || !personnelIds || personnelIds.length === 0) {
      return res.status(400).json({ error: 'Fecha, turno y personal requeridos' });
    }

    // Obtener información del personal
    const personnelResult = await pool.query(
      `SELECT * FROM personnel WHERE id = ANY($1) AND tipo_personal = 'LOGISTICO' AND active = true`,
      [personnelIds]
    );

    if (personnelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Personal no encontrado' });
    }

    const insertedAssignments = [];

    for (const person of personnelResult.rows) {
      // Verificar si ya existe
      const existingResult = await pool.query(
        'SELECT id FROM daily_transport_assignments WHERE date = $1 AND shift_type = $2 AND personnel_id = $3',
        [date, shiftType, person.id]
      );

      if (existingResult.rows.length > 0) {
        continue; // Ya existe, skip
      }

      // Insertar nueva asignación
      const insertResult = await pool.query(
        `INSERT INTO daily_transport_assignments
         (date, shift_type, personnel_id, personnel_name, personnel_role, personnel_area,
          transport_mode, direccion, barrio, localidad, is_express, confirmed_by_admin, program_title)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, true, $11)
         RETURNING *`,
        [
          date,
          shiftType,
          person.id,
          person.name,
          'LOGISTICO',
          person.area,
          person.direccion && person.direccion.trim() !== '' ? 'RUTA' : 'PROPIO',
          person.direccion,
          person.barrio,
          person.localidad,
          program_title || 'El Calentao'
        ]
      );

      insertedAssignments.push(insertResult.rows[0]);
    }

    res.status(201).json({
      message: `${insertedAssignments.length} personas logísticas agregadas correctamente`,
      assignments: insertedAssignments
    });
  } catch (error) {
    console.error('Error agregando personal logístico:', error);
    res.status(500).json({ error: 'Error al agregar personal logístico' });
  }
});

/**
 * POST /api/routes/move-passenger
 * Mueve un pasajero de una ruta a otra
 */
router.post('/move-passenger', async (req, res) => {
  try {
    const { personnelId, targetRouteNumber, date, shiftType } = req.body;

    console.log('📦 Move passenger request:', { personnelId, targetRouteNumber, date, shiftType });

    if (!personnelId || !targetRouteNumber || !date || !shiftType) {
      console.error('❌ Faltan parámetros:', { personnelId, targetRouteNumber, date, shiftType });
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Obtener la ruta destino
      const targetRoute = await client.query(
        'SELECT id FROM optimized_routes WHERE date = $1 AND shift_type = $2 AND route_number = $3',
        [date, shiftType, targetRouteNumber]
      );

      if (targetRoute.rows.length === 0) {
        throw new Error('Ruta destino no encontrada');
      }

      const targetRouteId = targetRoute.rows[0].id;

      // Actualizar la asignación del pasajero usando personnel_id
      const updateResult = await client.query(
        'UPDATE daily_transport_assignments SET route_id = $1 WHERE personnel_id = $2 AND date = $3 AND shift_type = $4 RETURNING id, personnel_name',
        [targetRouteId, personnelId, date, shiftType]
      );

      if (updateResult.rowCount === 0) {
        throw new Error(`No se encontró asignación para personnel_id=${personnelId}`);
      }

      console.log(`✅ Pasajero ${updateResult.rows[0].personnel_name} movido a ruta ${targetRouteNumber}`);

      // Recalcular pasajeros en ambas rutas (origen y destino)
      await recalculateRoutePassengers(client, date, shiftType);

      await client.query('COMMIT');
      res.json({ message: 'Pasajero movido correctamente' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error moviendo pasajero:', error);
    res.status(500).json({ error: error.message || 'Error al mover pasajero' });
  }
});

/**
 * Función auxiliar para recalcular pasajeros en optimized_routes
 */
async function recalculateRoutePassengers(client, date, shiftType) {
  // Actualizar el campo passengers en optimized_routes con los datos actuales
  await client.query(`
    UPDATE optimized_routes r
    SET passengers = (
      SELECT jsonb_agg(
        jsonb_build_object(
          'personnelId', a.personnel_id,
          'name', a.personnel_name,
          'address', a.direccion,
          'barrio', a.barrio,
          'localidad', a.localidad,
          'order', a.pickup_order
        ) ORDER BY a.pickup_order
      )
      FROM daily_transport_assignments a
      WHERE a.route_id = r.id AND a.date = r.date AND a.shift_type = r.shift_type
        AND a.transport_mode = 'RUTA'
    ),
    passenger_count = (
      SELECT COUNT(*)
      FROM daily_transport_assignments a
      WHERE a.route_id = r.id AND a.date = r.date AND a.shift_type = r.shift_type
        AND a.transport_mode = 'RUTA'
    )
    WHERE r.date = $1 AND r.shift_type = $2
  `, [date, shiftType]);

  // Eliminar rutas que quedaron sin pasajeros
  const deletedRoutes = await client.query(`
    DELETE FROM optimized_routes
    WHERE date = $1 AND shift_type = $2 AND passenger_count = 0
    RETURNING route_number
  `, [date, shiftType]);

  if (deletedRoutes.rowCount > 0) {
    console.log(`🗑️  Eliminadas ${deletedRoutes.rowCount} rutas vacías:`,
      deletedRoutes.rows.map(r => `Ruta ${r.route_number}`).join(', '));

    // Renumerar las rutas restantes para que no queden huecos
    // Obtener todas las rutas ordenadas por número
    const routes = await client.query(`
      SELECT id, route_number, zone
      FROM optimized_routes
      WHERE date = $1 AND shift_type = $2
      ORDER BY route_number
    `, [date, shiftType]);

    // Renumerar secuencialmente
    for (let i = 0; i < routes.rows.length; i++) {
      const newRouteNumber = i + 1;
      if (routes.rows[i].route_number !== newRouteNumber) {
        await client.query(`
          UPDATE optimized_routes
          SET route_number = $1
          WHERE id = $2
        `, [newRouteNumber, routes.rows[i].id]);
        console.log(`🔢 Renumerando: Ruta ${routes.rows[i].route_number} → Ruta ${newRouteNumber}`);
      }
    }
  }
}

/**
 * DELETE /api/routes/assignments/:id
 * Elimina una asignación de transporte
 */
router.delete('/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM daily_transport_assignments WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    res.json({ message: 'Asignación eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando asignación:', error);
    res.status(500).json({ error: 'Error al eliminar asignación' });
  }
});

// ============================================================================
// ROUTE OPTIMIZATION
// ============================================================================

/**
 * POST /api/routes/optimize
 * Optimiza rutas para una fecha y turno específico usando zonificación geográfica
 */
router.post('/optimize', async (req, res) => {
  try {
    const { date, shiftType } = req.body;

    if (!date || !shiftType) {
      return res.status(400).json({ error: 'Fecha y tipo de turno requeridos' });
    }

    // Obtener asignaciones de transporte
    const assignmentsResult = await pool.query(
      `SELECT t.*
       FROM daily_transport_assignments t
       WHERE t.date = $1 AND t.shift_type = $2`,
      [date, shiftType]
    );

    if (assignmentsResult.rows.length === 0) {
      return res.status(404).json({
        error: `No hay asignaciones de transporte para ${date} - ${shiftType}. Por favor inicialice primero las asignaciones.`
      });
    }

    // Convertir a formato de personal
    const personnel = assignmentsResult.rows.map(row => ({
      id: row.personnel_id,
      name: row.personnel_name,
      address: row.direccion,
      transport_state: row.transport_mode, // 'RUTA' o 'PROPIO'
      barrio: row.barrio,
      localidad: row.localidad,
      area: row.personnel_area,
      role: row.personnel_role
    }));

    // Obtener vehículos disponibles
    const vehiclesResult = await pool.query(
      `SELECT * FROM fleet_vehicles WHERE is_active = true ORDER BY vehicle_code`
    );

    const availableVehicles = vehiclesResult.rows.map(v => ({
      id: v.id,
      plate: v.vehicle_code,
      type: v.vehicle_type,
      driver: v.driver_name,
      capacity: v.capacity
    }));

    // Optimizar rutas
    const optimizationResult = optimizeRoutes(personnel, shiftType, availableVehicles);

    // Validar rutas
    const validation = validateRoutes(optimizationResult.routes);

    // Generar alertas
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Limpiar rutas optimizadas anteriores
      await client.query(
        'DELETE FROM optimized_routes WHERE date = $1 AND shift_type = $2',
        [date, shiftType]
      );

      // Guardar rutas optimizadas
      for (const route of optimizationResult.routes) {
        const routeResult = await client.query(
          `INSERT INTO optimized_routes
           (date, shift_type, route_number, zone, vehicle_id, total_distance_km,
            estimated_duration_minutes, passenger_count, passengers)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [
            date,
            shiftType,
            route.routeNumber,
            route.zone,
            route.vehicle?.id || null,
            route.stats.totalDistance,
            route.stats.estimatedDuration,
            route.stats.passengerCount,
            JSON.stringify(route.passengers)
          ]
        );

        const routeId = routeResult.rows[0].id;

        // Actualizar asignaciones con route_id y pickup_order
        for (const passenger of route.passengers) {
          const updateResult = await client.query(
            `UPDATE daily_transport_assignments
             SET route_id = $1, pickup_order = $2
             WHERE date = $3 AND shift_type = $4 AND personnel_id = $5
             RETURNING id`,
            [routeId, passenger.order, date, shiftType, passenger.personnelId]
          );

          if (updateResult.rowCount === 0) {
            console.warn(`⚠️  No se encontró asignación para personnel_id=${passenger.personnelId} (${passenger.name})`);
          }
        }
      }

      // Verificar que todos los pasajeros en rutas tienen route_id asignado
      const verificationResult = await client.query(
        `SELECT COUNT(*) as sin_ruta
         FROM daily_transport_assignments
         WHERE date = $1 AND shift_type = $2 AND transport_mode = 'RUTA' AND route_id IS NULL`,
        [date, shiftType]
      );

      if (parseInt(verificationResult.rows[0].sin_ruta) > 0) {
        console.error(`⚠️⚠️⚠️ ADVERTENCIA: ${verificationResult.rows[0].sin_ruta} personas marcadas EN RUTA pero sin route_id asignado`);
      }

      // Crear alertas para direcciones no clasificadas
      if (optimizationResult.stats.unclassifiedAddresses.length > 0) {
        for (const addr of optimizationResult.stats.unclassifiedAddresses) {
          await client.query(
            `INSERT INTO route_alerts
             (date, shift_type, alert_type, severity, message, personnel_id)
             VALUES ($1, $2, 'INVALID_ADDRESS', 'WARNING', $3, $4)`,
            [
              date,
              shiftType,
              `${addr.name}: Dirección no clasificada - ${addr.address}`,
              addr.personnelId
            ]
          );
        }
      }

      await client.query('COMMIT');

      res.json({
        message: `✅ Optimización completada: ${optimizationResult.routes.length} ruta(s) creada(s)`,
        routes: optimizationResult.routes,
        stats: optimizationResult.stats,
        validation,
        summary: generateRouteSummary(optimizationResult)
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error optimizando rutas:', error);
    res.status(500).json({ error: 'Error al optimizar rutas' });
  }
});

/**
 * GET /api/routes/optimized/:date/:shiftType
 * Obtiene rutas optimizadas para una fecha y turno
 */
router.get('/optimized/:date/:shiftType', async (req, res) => {
  try {
    const { date, shiftType } = req.params;

    // Usar directamente optimized_routes que tiene passengers con localidad/barrio
    const result = await pool.query(
      `SELECT
        id AS route_id,
        date,
        shift_type,
        route_number,
        zone,
        vehicle_id,
        vehicle_plate,
        driver_name,
        driver_phone,
        vehicle_type,
        total_distance_km,
        estimated_duration_minutes,
        passenger_count AS total_passengers,
        passengers,
        status,
        created_at
      FROM optimized_routes
      WHERE date = $1 AND shift_type = $2
      ORDER BY route_number`,
      [date, shiftType]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo rutas optimizadas:', error);
    res.status(500).json({ error: 'Error al obtener rutas optimizadas' });
  }
});

/**
 * GET /api/routes/calculate-vehicles/:date/:shiftType
 * Calcula cuántos vehículos se necesitan
 */
router.get('/calculate-vehicles/:date/:shiftType', async (req, res) => {
  try {
    const { date, shiftType } = req.params;

    const calculation = await routeOptimizationService.calculateRequiredVehicles(date, shiftType);

    res.json(calculation);
  } catch (error) {
    console.error('Error calculando vehículos:', error);
    res.status(500).json({ error: 'Error al calcular vehículos requeridos' });
  }
});

// ============================================================================
// FLEET MANAGEMENT
// ============================================================================

/**
 * GET /api/routes/fleet
 * Obtiene todos los vehículos de la flota
 */
router.get('/fleet', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM fleet_vehicles WHERE is_active = true ORDER BY vehicle_code'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo flota:', error);
    res.status(500).json({ error: 'Error al obtener vehículos' });
  }
});

/**
 * POST /api/routes/fleet
 * Crea un nuevo vehículo
 */
router.post('/fleet', async (req, res) => {
  try {
    const { vehicle_code, vehicle_type, capacity, driver_name, driver_phone } = req.body;

    const result = await pool.query(
      `INSERT INTO fleet_vehicles
       (vehicle_code, vehicle_type, capacity, driver_name, driver_phone, status, is_active)
       VALUES ($1, $2, $3, $4, $5, 'AVAILABLE', true)
       RETURNING *`,
      [vehicle_code, vehicle_type, capacity || 4, driver_name, driver_phone]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando vehículo:', error);
    res.status(500).json({ error: 'Error al crear vehículo' });
  }
});

/**
 * PUT /api/routes/fleet/:id
 * Actualiza un vehículo
 */
router.put('/fleet/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicle_code, vehicle_type, capacity, driver_name, driver_phone, status } = req.body;

    const result = await pool.query(
      `UPDATE fleet_vehicles
       SET vehicle_code = $1, vehicle_type = $2, capacity = $3,
           driver_name = $4, driver_phone = $5, status = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [vehicle_code, vehicle_type, capacity, driver_name, driver_phone, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando vehículo:', error);
    res.status(500).json({ error: 'Error al actualizar vehículo' });
  }
});

/**
 * PUT /api/routes/optimized/:routeId/assign-vehicle
 * Asigna información de vehículo/conductor a una ruta optimizada
 */
router.put('/optimized/:routeId/assign-vehicle', async (req, res) => {
  try {
    const { routeId } = req.params;
    const { vehicle_plate, driver_name, driver_phone, vehicle_type } = req.body;

    if (!vehicle_plate || !driver_name) {
      return res.status(400).json({
        error: 'Placa del vehículo y nombre del conductor son requeridos'
      });
    }

    const result = await pool.query(
      `UPDATE optimized_routes
       SET vehicle_plate = $1,
           driver_name = $2,
           driver_phone = $3,
           vehicle_type = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [vehicle_plate, driver_name, driver_phone, vehicle_type, routeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    res.json({
      message: 'Vehículo asignado correctamente a la ruta',
      route: result.rows[0]
    });
  } catch (error) {
    console.error('Error asignando vehículo a ruta:', error);
    res.status(500).json({ error: 'Error al asignar vehículo' });
  }
});

/**
 * DELETE /api/routes/optimized/:routeId/unassign-vehicle
 * Quita la asignación de vehículo de una ruta
 */
router.delete('/optimized/:routeId/unassign-vehicle', async (req, res) => {
  try {
    const { routeId } = req.params;

    const result = await pool.query(
      `UPDATE optimized_routes
       SET vehicle_plate = NULL,
           driver_name = NULL,
           driver_phone = NULL,
           vehicle_type = NULL,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [routeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    res.json({
      message: 'Vehículo desasignado correctamente',
      route: result.rows[0]
    });
  } catch (error) {
    console.error('Error desasignando vehículo:', error);
    res.status(500).json({ error: 'Error al desasignar vehículo' });
  }
});

/**
 * PUT /api/routes/fleet/:id/assign
 * Asigna un vehículo a una ruta (DEPRECATED - usar assign-vehicle)
 */
router.put('/fleet/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { route_id } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Actualizar estado del vehículo
      await client.query(
        "UPDATE fleet_vehicles SET status = 'IN_ROUTE', updated_at = NOW() WHERE id = $1",
        [id]
      );

      // Asignar vehículo a la ruta
      await client.query(
        'UPDATE optimized_routes SET vehicle_id = $1, updated_at = NOW() WHERE id = $2',
        [id, route_id]
      );

      await client.query('COMMIT');

      res.json({ message: 'Vehículo asignado correctamente' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error asignando vehículo:', error);
    res.status(500).json({ error: 'Error al asignar vehículo' });
  }
});

// ============================================================================
// ALERTS
// ============================================================================

/**
 * GET /api/routes/alerts/:date
 * Obtiene alertas para una fecha específica
 */
router.get('/alerts/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { resolved } = req.query;

    let query = 'SELECT * FROM route_alerts WHERE date = $1';
    const params = [date];

    if (resolved !== undefined) {
      query += ' AND resolved = $2';
      params.push(resolved === 'true');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
});

/**
 * PUT /api/routes/alerts/:id/resolve
 * Marca una alerta como resuelta
 */
router.put('/alerts/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE route_alerts SET resolved = true, resolved_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error resolviendo alerta:', error);
    res.status(500).json({ error: 'Error al resolver alerta' });
  }
});

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * GET /api/routes/config
 * Obtiene la configuración del módulo de rutas
 */
router.get('/config', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM routes_configuration ORDER BY config_key');
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

/**
 * PUT /api/routes/config/:key
 * Actualiza un valor de configuración
 */
router.put('/config/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const result = await pool.query(
      'UPDATE routes_configuration SET config_value = $1, updated_at = NOW() WHERE config_key = $2 RETURNING *',
      [value, key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clave de configuración no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

// ============================================================================
// DAILY RESET
// ============================================================================

/**
 * POST /api/routes/reset/:date
 * Resetea todas las asignaciones y rutas para una fecha
 */
router.post('/reset/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Eliminar rutas optimizadas
      await client.query('DELETE FROM optimized_routes WHERE date = $1', [date]);

      // Eliminar asignaciones de transporte
      await client.query('DELETE FROM daily_transport_assignments WHERE date = $1', [date]);

      // Marcar alertas antiguas como resueltas
      await client.query(
        'UPDATE route_alerts SET resolved = true, resolved_at = NOW() WHERE date = $1 AND NOT resolved',
        [date]
      );

      // Liberar vehículos
      await client.query("UPDATE fleet_vehicles SET status = 'AVAILABLE' WHERE status = 'IN_ROUTE'");

      await client.query('COMMIT');

      res.json({ message: `Reset completado para ${date}` });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error reseteando día:', error);
    res.status(500).json({ error: 'Error al resetear día' });
  }
});

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * GET /api/routes/export/whatsapp/:date/:shiftType
 * Genera formato WhatsApp para compartir rutas
 */
router.get('/export/whatsapp/:date/:shiftType', async (req, res) => {
  try {
    const { date, shiftType } = req.params;

    const whatsappText = await exportService.generateWhatsAppFormat(date, shiftType);

    res.json({
      format: 'whatsapp',
      date,
      shiftType,
      content: whatsappText
    });
  } catch (error) {
    console.error('Error generando formato WhatsApp:', error);
    res.status(500).json({ error: 'Error al generar formato WhatsApp' });
  }
});

/**
 * GET /api/routes/export/pdf/:date/:shiftType
 * Genera datos estructurados para PDF
 */
router.get('/export/pdf/:date/:shiftType', async (req, res) => {
  try {
    const { date, shiftType } = req.params;

    const pdfData = await exportService.generatePDFData(date, shiftType);

    res.json(pdfData);
  } catch (error) {
    console.error('Error generando datos PDF:', error);
    res.status(500).json({ error: 'Error al generar datos para PDF' });
  }
});

/**
 * GET /api/routes/export/report/:date/:shiftType
 * Genera reporte simple de texto
 */
router.get('/export/report/:date/:shiftType', async (req, res) => {
  try {
    const { date, shiftType } = req.params;

    const report = await exportService.generateSimpleReport(date, shiftType);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(report);
  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
});

// ============================================================================
// TEMPORARY DESTINATIONS & EMERGENCY ADDRESSES
// ============================================================================

/**
 * PUT /api/routes/assignments/:id/temporary-destination
 * Establece un destino temporal para una asignación (solo ese día)
 */
router.put('/assignments/:id/temporary-destination', async (req, res) => {
  try {
    const { id } = req.params;
    const { temporaryDestination, addressType, notes, lat, lng } = req.body;

    if (!temporaryDestination) {
      return res.status(400).json({ error: 'Destino temporal requerido' });
    }

    const result = await pool.query(`
      UPDATE daily_transport_assignments
      SET temporary_destination = $1,
          temporary_address_type = $2,
          temporary_address_notes = $3,
          temporary_lat = $4,
          temporary_lng = $5
      WHERE id = $6
      RETURNING *
    `, [temporaryDestination, addressType, notes, lat, lng, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    console.log(`📍 Destino temporal establecido para asignación ${id}: ${temporaryDestination}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error estableciendo destino temporal:', error);
    res.status(500).json({ error: 'Error al establecer destino temporal' });
  }
});

/**
 * DELETE /api/routes/assignments/:id/temporary-destination
 * Elimina el destino temporal (vuelve a usar dirección permanente)
 */
router.delete('/assignments/:id/temporary-destination', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE daily_transport_assignments
      SET temporary_destination = NULL,
          temporary_address_type = NULL,
          temporary_address_notes = NULL,
          temporary_lat = NULL,
          temporary_lng = NULL
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    console.log(`✅ Destino temporal eliminado para asignación ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error eliminando destino temporal:', error);
    res.status(500).json({ error: 'Error al eliminar destino temporal' });
  }
});

/**
 * GET /api/routes/emergency-addresses/:personnelId
 * Obtiene direcciones de emergencia guardadas para una persona
 */
router.get('/emergency-addresses/:personnelId', async (req, res) => {
  try {
    const { personnelId } = req.params;

    const result = await pool.query(`
      SELECT * FROM emergency_addresses
      WHERE personnel_id = $1
      ORDER BY usage_count DESC, last_used_date DESC
    `, [personnelId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo direcciones de emergencia:', error);
    res.status(500).json({ error: 'Error al obtener direcciones de emergencia' });
  }
});

/**
 * POST /api/routes/emergency-addresses
 * Guarda una nueva dirección de emergencia
 */
router.post('/emergency-addresses', async (req, res) => {
  try {
    const { personnelId, addressType, address, barrio, localidad, lat, lng, notes } = req.body;

    if (!personnelId || !address || !addressType) {
      return res.status(400).json({ error: 'Parámetros requeridos: personnelId, address, addressType' });
    }

    const result = await pool.query(`
      INSERT INTO emergency_addresses (personnel_id, address_type, address, barrio, localidad, lat, lng, notes, usage_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)
      RETURNING *
    `, [personnelId, addressType, address, barrio, localidad, lat, lng, notes]);

    console.log(`📍 Dirección de emergencia guardada para personnel ${personnelId}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error guardando dirección de emergencia:', error);
    res.status(500).json({ error: 'Error al guardar dirección de emergencia' });
  }
});

/**
 * PUT /api/routes/emergency-addresses/:id/use
 * Incrementa el contador de uso de una dirección de emergencia
 */
router.put('/emergency-addresses/:id/use', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE emergency_addresses
      SET usage_count = usage_count + 1,
          last_used_date = CURRENT_DATE,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando uso de dirección:', error);
    res.status(500).json({ error: 'Error al actualizar uso' });
  }
});

// ============================================================================
// ROUTE CONSOLIDATION (Para evitar rutas con muy pocos pasajeros)
// ============================================================================

/**
 * POST /api/routes/consolidate
 * Consolida rutas pequeñas fusionándolas con otras cercanas
 */
router.post('/consolidate', async (req, res) => {
  try {
    const { date, shiftType, minPassengers = 3 } = req.body;

    if (!date || !shiftType) {
      return res.status(400).json({ error: 'Fecha y turno requeridos' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Encontrar rutas con menos pasajeros del mínimo
      const smallRoutes = await client.query(`
        SELECT id, route_number, zone, passenger_count
        FROM optimized_routes
        WHERE date = $1 AND shift_type = $2 AND passenger_count < $3
        ORDER BY zone, passenger_count
      `, [date, shiftType, minPassengers]);

      if (smallRoutes.rows.length === 0) {
        await client.query('COMMIT');
        return res.json({ message: 'No hay rutas pequeñas para consolidar', consolidatedCount: 0 });
      }

      console.log(`🔄 Consolidando ${smallRoutes.rows.length} rutas pequeñas...`);

      for (const smallRoute of smallRoutes.rows) {
        // Buscar la ruta más grande de la misma zona
        const targetRoute = await client.query(`
          SELECT id, route_number, passenger_count
          FROM optimized_routes
          WHERE date = $1 AND shift_type = $2 AND zone = $3 AND id != $4
          ORDER BY passenger_count DESC
          LIMIT 1
        `, [date, shiftType, smallRoute.zone, smallRoute.id]);

        if (targetRoute.rows.length > 0) {
          // Mover todos los pasajeros de la ruta pequeña a la ruta grande
          await client.query(`
            UPDATE daily_transport_assignments
            SET route_id = $1
            WHERE route_id = $2 AND date = $3 AND shift_type = $4
          `, [targetRoute.rows[0].id, smallRoute.id, date, shiftType]);

          console.log(`✅ Ruta ${smallRoute.route_number} (${smallRoute.passenger_count} pasajeros) fusionada con Ruta ${targetRoute.rows[0].route_number}`);
        }
      }

      // Recalcular pasajeros y eliminar rutas vacías
      await recalculateRoutePassengers(client, date, shiftType);

      await client.query('COMMIT');

      res.json({
        message: 'Rutas consolidadas exitosamente',
        consolidatedCount: smallRoutes.rows.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error consolidando rutas:', error);
    res.status(500).json({ error: 'Error al consolidar rutas' });
  }
});

// ============================================================================
// PROGRAM MAPPINGS (Asignaciones de Estudio/Master a Programas)
// ============================================================================

/**
 * POST /api/routes/program-mappings/setup
 * Crea la tabla program_mappings (solo ejecutar una vez)
 */
router.post('/program-mappings/setup', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS program_mappings (
        program_id INTEGER PRIMARY KEY,
        studio_resource INTEGER,
        master_resource INTEGER,
        updated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_program_mappings_updated
      ON program_mappings(updated_at DESC);
    `);

    res.json({ success: true, message: 'Tabla program_mappings creada exitosamente' });
  } catch (error) {
    console.error('Error creando tabla:', error);
    res.status(500).json({ error: 'Error al crear tabla program_mappings' });
  }
});

/**
 * GET /api/routes/program-mappings
 * Obtiene todas las asignaciones de programas
 */
router.get('/program-mappings', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM program_mappings ORDER BY program_id`
    );

    // Convertir array de filas a objeto { programId: { studioResource, masterResource } }
    const mappings = {};
    result.rows.forEach(row => {
      mappings[row.program_id] = {
        studioResource: row.studio_resource,
        masterResource: row.master_resource,
        updatedAt: row.updated_at
      };
    });

    res.json(mappings);
  } catch (error) {
    console.error('Error obteniendo asignaciones de programas:', error);
    res.status(500).json({ error: 'Error al obtener asignaciones de programas' });
  }
});

/**
 * POST /api/routes/program-mappings
 * Guarda o actualiza la asignación de un programa
 */
router.post('/program-mappings', async (req, res) => {
  try {
    const { programId, studioResource, masterResource } = req.body;

    if (!programId) {
      return res.status(400).json({ error: 'programId es requerido' });
    }

    const result = await pool.query(
      `INSERT INTO program_mappings (program_id, studio_resource, master_resource, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (program_id)
       DO UPDATE SET
         studio_resource = $2,
         master_resource = $3,
         updated_at = NOW()
       RETURNING *`,
      [programId, studioResource || null, masterResource || null]
    );

    res.json({
      success: true,
      mapping: {
        studioResource: result.rows[0].studio_resource,
        masterResource: result.rows[0].master_resource,
        updatedAt: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Error guardando asignación de programa:', error);
    res.status(500).json({ error: 'Error al guardar asignación de programa' });
  }
});

/**
 * DELETE /api/routes/program-mappings/:programId
 * Elimina la asignación de un programa
 */
router.delete('/program-mappings/:programId', async (req, res) => {
  try {
    const { programId } = req.params;

    await pool.query(
      `DELETE FROM program_mappings WHERE program_id = $1`,
      [programId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando asignación de programa:', error);
    res.status(500).json({ error: 'Error al eliminar asignación de programa' });
  }
});

/**
 * POST /api/routes/program-mappings/migrate
 * Migra datos desde localStorage al servidor (solo para migración inicial)
 */
router.post('/program-mappings/migrate', async (req, res) => {
  try {
    const { mappings } = req.body;

    if (!mappings || typeof mappings !== 'object') {
      return res.status(400).json({ error: 'mappings debe ser un objeto' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let migrated = 0;
      for (const [programId, mapping] of Object.entries(mappings)) {
        await client.query(
          `INSERT INTO program_mappings (program_id, studio_resource, master_resource, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (program_id)
           DO UPDATE SET
             studio_resource = $2,
             master_resource = $3,
             updated_at = NOW()`,
          [parseInt(programId), mapping.studioResource || null, mapping.masterResource || null]
        );
        migrated++;
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: `${migrated} asignaciones migradas exitosamente`
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error migrando asignaciones:', error);
    res.status(500).json({ error: 'Error al migrar asignaciones' });
  }
});

module.exports = router;
